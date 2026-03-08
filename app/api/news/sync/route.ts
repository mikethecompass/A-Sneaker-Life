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

const MAX_ARTICLES = 5;

const SNEAKER_KEYWORDS = [
  "nike", "adidas", "jordan", "new balance", "puma", "reebok", "vans",
  "converse", "yeezy", "sneaker", "shoe", "collab", "colorway", "release",
  "drop", "air max", "dunk", "foamposite", "saucony", "asics", "on feet",
  "retail", "kobe", "lebron", "blazer", "force",
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
  const blocks: object[] = [];
  let blockIndex = 0;

  const paragraphs = text.split(/\n\n+/);

  for (const para of paragraphs) {
    const trimmed = para
      .trim()
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\n/g, " ")
      .trim();

    if (!trimmed) continue;

    blocks.push({
      _type: "block",
      _key: `block-${blockIndex++}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `span-${blockIndex}`,
          text: trimmed,
          marks: [],
        },
      ],
    });
  }

  return blocks;
}

async function fetchFeeds(): Promise<
  { title: string; description: string; link: string; pubDate: string; sourceName: string; imageUrl?: string }[]
> {
  const parser = new Parser({
    timeout: 8000,
    customFields: {
      item: [
        ["media:content", "mediaContent"],
        ["media:thumbnail", "mediaThumbnail"],
        ["enclosure", "enclosure"],
      ],
    },
  });
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const result = await parser.parseURL(feed.url);
      return (result.items ?? [])
        .filter((item) => {
          if (!item.title || !item.link) return false;
          const pubDate = item.pubDate ? new Date(item.pubDate) : null;
          return pubDate && pubDate >= cutoff;
        })
        .map((item) => {
          const imageUrl =
            (item as any).mediaContent?.$.url ||
            (item as any).mediaThumbnail?.$.url ||
            (item as any).enclosure?.url ||
            extractImageFromContent((item as any).content || "") ||
            undefined;

          return {
            title: item.title!,
            description: item.contentSnippet ?? item.content ?? "",
            link: item.link!,
            pubDate: new Date(item.pubDate!).toISOString(),
            sourceName: feed.name,
            imageUrl,
          };
        });
    } catch (err) {
      console.log(`Failed to fetch feed ${feed.name}: ${err}`);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  return results.flat();
}

function extractImageFromContent(content: string): string | null {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
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
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system:
        'You are a sneaker journalist writing for A Sneaker Life. Rewrite the following sneaker news into a fresh, original article. Keep the key facts but use your own voice — casual, knowledgeable, authentic sneakerhead tone. Include: what the shoe/collab is, why it matters, release date and price if known, and where to buy. Do NOT copy any phrasing from the source. Respond ONLY with a valid JSON object (no markdown, no backticks, no code fences) containing exactly these keys: { "title": string, "excerpt": string (max 160 chars), "body": string (PLAIN TEXT ONLY — absolutely no # headers, no ## subheadings, no bullet points, no asterisks, no markdown of any kind — just plain prose paragraphs separated by double newlines, 200-350 words), "brand": string (primary brand name only), "tags": string[] (3-5 lowercase tags) }',
      messages: [
        {
          role: "user",
          content: `Source title: ${title}\nSource description: ${description.slice(0, 800)}\nSource link: ${url}`,
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
    const cleaned = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function deleteAllNewsArticles(): Promise<number> {
  const ids: string[] = await sanityWriteClient.fetch(
    `*[_type == "newsArticle"]._id`,
  );
  if (!ids.length) return 0;

  const transaction = sanityWriteClient.transaction();
  for (const id of ids) {
    transaction.delete(id);
  }
  await transaction.commit();
  return ids.length;
}

export async function POST(req: NextRequest) {
  const secret =
    req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reqUrl = new URL(req.url);
  const reset = reqUrl.searchParams.get("reset") === "true";

  let deleted = 0;
  if (reset) {
    deleted = await deleteAllNewsArticles();
    console.log(`Deleted ${deleted} existing newsArticle documents`);
  }

  try {
    const allArticles = await fetchFeeds();
    console.log(`Fetched ${allArticles.length} articles from RSS feeds`);

    const articles = allArticles.filter((a) => isSneakerRelated(a.title));
    console.log(`${articles.length} articles passed sneaker filter`);

    const results = {
      deleted,
      created: 0,
      skipped: 0,
      filtered: allArticles.length - articles.length,
      errors: [] as string[],
    };
    let processed = 0;

    for (const article of articles) {
      if (processed >= MAX_ARTICLES) break;

      try {
        const existing = await sanityWriteClient.fetch(
          `*[_type == "newsArticle" && source.url == $sourceUrl][0]._id`,
          { sourceUrl: article.link },
        );
        if (existing) {
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

        const doc: { _id: string; _type: string; [key: string]: unknown } = {
          _id: docId,
          _type: "newsArticle",
          title: ai.title,
          slug: { _type: "slug", current: slug },
          excerpt: ai.excerpt?.slice(0, 200) ?? "",
          body: textToPortableText(ai.body),
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
        };

        if (article.imageUrl) {
          doc.heroImage = article.imageUrl;
        }

        await sanityWriteClient.createOrReplace(doc);
        results.created++;
        processed++;
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
