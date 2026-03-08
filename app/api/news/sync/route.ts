import { NextRequest, NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";
import Parser from "rss-parser";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RSS_FEEDS = [
  { url: "https://sneakernews.com/feed/", name: "Sneaker News" },
  { url: "https://www.kicksonfire.com/feed/", name: "Kicks On Fire" },
  { url: "https://hypebeast.com/feed", name: "Hypebeast" },
  { url: "https://nicekicks.com/feed/", name: "Nice Kicks" },
];

const MAX_ARTICLES = 10;

const SNEAKER_KEYWORDS = [
  "nike", "adidas", "jordan", "new balance", "puma", "reebok", "vans",
  "converse", "yeezy", "sneaker", "shoe", "collab", "colorway", "release",
  "drop", "air max", "dunk", "foamposite", "saucony", "asics", "on feet",
  "retail",
];

function isSneakerRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return SNEAKER_KEYWORDS.some((kw) => lower.includes(kw));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function hashSourceUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 12);
}

function textToPortableText(text: string) {
  return text
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((paragraph, i) => {
      const cleaned = paragraph.trim().replace(/^#+\s*/, "");
      return {
        _type: "block",
        _key: `block-${i}`,
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: `span-${i}`,
            text: cleaned,
            marks: [],
          },
        ],
      };
    });
}

async function fetchFeeds(): Promise<
  { title: string; description: string; link: string; pubDate: string; sourceName: string }[]
> {
  const parser = new Parser({ timeout: 5000 });
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const articles: { title: string; description: string; link: string; pubDate: string; sourceName: string }[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url);
      for (const item of result.items ?? []) {
        if (!item.title || !item.link) continue;
        const pubDate = item.pubDate ? new Date(item.pubDate) : null;
        if (!pubDate || pubDate < cutoff) continue;
        articles.push({
          title: item.title,
          description: item.contentSnippet ?? item.content ?? "",
          link: item.link,
          pubDate: pubDate.toISOString(),
          sourceName: feed.name,
        });
      }
    } catch (err) {
      console.log(`Failed to fetch feed ${feed.name}: ${err}`);
    }
  }

  return articles;
}

async function rewriteWithAI(
  title: string,
  description: string,
  url: string,
): Promise<{
  title: string;
  excerpt: string;
  body: string;
  brand: string;
  tags: string[];
} | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system:
        "You are a sneaker journalist writing for A Sneaker Life. Rewrite the following sneaker news into a fresh, original article. Keep the key facts but use your own voice — casual, knowledgeable, authentic sneakerhead tone. Include: what the shoe/collab is, why it matters, release date and price if known, and where to buy. Do NOT copy any phrasing from the source. Respond ONLY with a JSON object containing: { title: string, excerpt: string (max 200 chars), body: string (plain paragraphs only, 250-400 words — no markdown, no # headers, no ## subheadings, no bullet points, no asterisks — just plain text paragraphs separated by double newlines), brand: string (primary brand), tags: string[] (3-5 relevant tags) }",
      messages: [
        {
          role: "user",
          content: `Source title: ${title}\nSource description: ${description.slice(0, 1000)}\nSource link: ${url}`,
        },
      ],
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.log(`Anthropic error: ${response.status} ${text.slice(0, 200)}`);
    return null;
  }

  try {
    const data = JSON.parse(text);
    const content = data.content?.[0]?.text ?? "{}";
    return JSON.parse(content.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const secret =
    req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all existing newsArticle documents so fresh versions get created
    const staleIds: string[] = await sanityWriteClient.fetch(
      `*[_type == "newsArticle"]._id`,
    );
    if (staleIds.length > 0) {
      const tx = sanityWriteClient.transaction();
      for (const id of staleIds) {
        tx.delete(id);
      }
      await tx.commit();
      console.log(`Deleted ${staleIds.length} existing newsArticle documents`);
    }

    const articles = await fetchFeeds();
    console.log(`Fetched ${articles.length} articles from RSS feeds`);

    const results = { created: 0, skipped: 0, errors: [] as string[] };
    let processed = 0;

    for (const article of articles) {
      if (processed >= MAX_ARTICLES) break;

      try {
        // Deduplicate: check if source URL already exists in Sanity
        const existing = await sanityWriteClient.fetch(
          `*[_type == "newsArticle" && source.url == $sourceUrl][0]`,
          { sourceUrl: article.link },
        );
        if (existing) {
          results.skipped++;
          continue;
        }

        if (!isSneakerRelated(article.title)) {
          results.skipped++;
          continue;
        }

        const ai = await rewriteWithAI(
          article.title,
          article.description,
          article.link,
        );
        if (!ai) {
          results.errors.push(`AI rewrite failed for: ${article.title}`);
          processed++;
          continue;
        }

        const slug = slugify(ai.title);
        const docId = `news-${hashSourceUrl(article.link)}`;

        await sanityWriteClient.createOrReplace({
          _id: docId,
          _type: "newsArticle",
          title: ai.title,
          slug: { _type: "slug", current: slug },
          excerpt: ai.excerpt?.slice(0, 200) ?? "",
          body: textToPortableText(ai.body),
          heroImage: "",
          brand: ai.brand ?? "",
          tags: ai.tags ?? [],
          source: {
            _type: "source",
            name: article.sourceName,
            url: article.link,
          },
          publishedAt: article.pubDate,
          autoGenerated: true,
          status: "published",
        });

        results.created++;
        processed++;

        // Brief pause between API calls
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        results.errors.push(String(err));
        processed++;
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
