import { NextRequest, NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";
import Parser from "rss-parser";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RSS_FEEDS = [
  { url: "https://sneakernews.com/feed/", name: "Sneaker News" },
  { url: "https://sneakerfiles.com/feed/", name: "Sneaker Files" },
];

const MAX_ARTICLES = 2;

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
      children: [{ _type: "span", _key: `span-${blockIndex}`, text: trimmed, marks: [] }],
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
    const t = Date.now();
    try {
      console.log(`[feed] starting ${feed.name}`);
      const result = await parser.parseURL(feed.url);
      console.log(`[feed] ${feed.name} done in ${Date.now() - t}ms, ${result.items?.length} items`);
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
      console.log(`[feed] ${feed.name} FAILED after ${Date.now() - t}ms: ${err}`);
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

async function rewriteWithAI(title: string, description: string): Promise<{
  title: string; excerpt: string; body: string; brand: string; tags: string[];
} | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { console.log("[ai] no API key"); return null; }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const t = Date.now();

  try {
    console.log(`[ai] starting rewrite for: ${title.slice(0, 50)}`);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system:
          'You are a sneaker journalist for A Sneaker Life. Rewrite this sneaker news in your own casual, knowledgeable voice. Respond ONLY with a valid JSON object (no markdown, no backticks) with these keys: { "title": string, "excerpt": string (max 160 chars), "body": string (plain prose only, no # headers, no markdown, 3 paragraphs separated by double newlines, ~200 words), "brand": string, "tags": string[] (3-5 lowercase) }',
        messages: [{ role: "user", content: `Title: ${title}\nDescription: ${description.slice(0, 500)}` }],
      }),
    });

    clearTimeout(timeout);
    console.log(`[ai] response in ${Date.now() - t}ms, status ${response.status}`);

    const text = await response.text();
    if (!response.ok) { console.log(`[ai] error: ${text.slice(0, 100)}`); return null; }

    const data = JSON.parse(text);
    const content = data.content?.[0]?.text ?? "{}";
    const cleaned = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    clearTimeout(timeout);
    console.log(`[ai] FAILED after ${Date.now() - t}ms: ${err}`);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  console.log(`[sync] starting`);

  try {
    const allArticles = await fetchFeeds();
    console.log(`[sync] feeds done in ${Date.now() - start}ms, ${allArticles.length} total articles`);

    const articles = allArticles.filter((a) => isSneakerRelated(a.title));
    console.log(`[sync] ${articles.length} passed sneaker filter`);

    const results = { created: 0, skipped: 0, filtered: allArticles.length - articles.length, errors: [] as string[] };
    let processed = 0;

    for (const article of articles) {
      if (processed >= MAX_ARTICLES) break;
      console.log(`[sync] processing: ${article.title.slice(0, 60)}`);

      try {
        const existing = await sanityWriteClient.fetch(
          `*[_type == "newsArticle" && source.url == $sourceUrl][0]._id`,
          { sourceUrl: article.link },
        );
        if (existing) { results.skipped++; continue; }

        const ai = await rewriteWithAI(article.title, article.description);
        if (!ai) { results.errors.push(`AI rewrite failed for: ${article.title}`); processed++; continue; }

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
          source: { _type: "source", name: article.sourceName, url: article.link },
          publishedAt: article.pubDate,
          autoGenerated: true,
          status: "published",
        };

        if (article.imageUrl) doc.heroImage = article.imageUrl;

        await sanityWriteClient.createOrReplace(doc);
        console.log(`[sync] created: ${ai.title.slice(0, 60)} in ${Date.now() - start}ms total`);
        results.created++;
        processed++;
      } catch (err) {
        results.errors.push(String(err));
        processed++;
      }
    }

    console.log(`[sync] done in ${Date.now() - start}ms`);
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString(), ...results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
