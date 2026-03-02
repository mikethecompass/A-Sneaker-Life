import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

const RETAILERS = [
  { retailer: "Foot Locker", baseUrl: "https://www.footlocker.com/search?query=" },
  { retailer: "adidas", baseUrl: "https://www.adidas.com/us/search?q=" },
  { retailer: "StockX", baseUrl: "https://stockx.com/search?s=" },
  { retailer: "GOAT", baseUrl: "https://www.goat.com/search?query=" },
  { retailer: "Champs Sports", baseUrl: "https://www.champssports.com/search?query=" },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
}

async function generateReviewWithAI(title: string, description: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a sneaker reviewer. Based on this YouTube video title and description, generate a structured review.

Title: ${title}
Description: ${description}

Respond ONLY with valid JSON, no markdown:
{
  "shoeName": "exact shoe model name",
  "brand": "brand name",
  "summary": "2-3 sentence summary of the review",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "verdict": "1 sentence verdict",
  "rating": 7,
  "retailPrice": 120
}`
      }]
    })
  });
  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";
  try { return JSON.parse(text); } catch { return null; }
}

async function getAllYouTubeVideos() {
  let videos: any[] = [];
  let pageToken = "";
  
  do {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video${pageToken ? `&pageToken=${pageToken}` : ""}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    videos = videos.concat(data.items ?? []);
    pageToken = data.nextPageToken ?? "";
  } while (pageToken && videos.length < 200);

  return videos;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== "Bearer secret123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const limit = body.limit ?? 10; // Process N videos at a time to avoid timeout

  try {
    const videos = await getAllYouTubeVideos();
    console.log(`Found ${videos.length} YouTube videos`);

    // Get existing review youtubeIds to skip already processed
    const existing = await sanityWriteClient.fetch<{ youtubeId: string }[]>(
      `*[_type == "review"]{ youtubeId }`
    );
    const existingIds = new Set(existing.map((r) => r.youtubeId));

    const toProcess = videos
      .filter((v) => !existingIds.has(v.id?.videoId))
      .slice(0, limit);

    console.log(`Processing ${toProcess.length} new videos`);

    const results = { processed: 0, skipped: 0, errors: [] as string[] };

    for (const video of toProcess) {
      try {
        const youtubeId = video.id?.videoId;
        const title = video.snippet?.title ?? "";
        const description = video.snippet?.description ?? "";
        const thumbnailUrl = video.snippet?.thumbnails?.maxres?.url ?? video.snippet?.thumbnails?.high?.url ?? "";
        const publishedAt = video.snippet?.publishedAt ?? new Date().toISOString();

        if (!youtubeId || !title) { results.skipped++; continue; }

        // Skip non-sneaker videos
        const sneakerKeywords = ["review", "unbox", "on feet", "sneaker", "shoe", "jordan", "nike", "adidas", "yeezy", "dunk", "air max", "new balance"];
        const isRelevant = sneakerKeywords.some(kw => title.toLowerCase().includes(kw) || description.toLowerCase().includes(kw));
        if (!isRelevant) { results.skipped++; continue; }

        const ai = await generateReviewWithAI(title, description);
        if (!ai) { results.errors.push(`AI failed for ${title}`); continue; }

        const slug = slugify(ai.shoeName ?? title);
        const affiliateLinks = RETAILERS.map(r => ({
          _key: r.retailer.replace(/\s/g, ""),
          retailer: r.retailer,
          url: r.baseUrl + encodeURIComponent(ai.shoeName ?? title),
        }));

        await sanityWriteClient.createOrReplace({
          _id: `review-${youtubeId}`,
          _type: "review",
          title: ai.shoeName ?? title,
          slug: { _type: "slug", current: slug },
          youtubeId,
          thumbnailUrl,
          brand: ai.brand ?? "",
          shoeName: ai.shoeName ?? title,
          rating: ai.rating ?? null,
          summary: ai.summary ?? "",
          pros: ai.pros ?? [],
          cons: ai.cons ?? [],
          verdict: ai.verdict ?? "",
          retailPrice: ai.retailPrice ?? null,
          affiliateLinks,
          publishedAt,
          autoGenerated: true,
        });

        results.processed++;
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        results.errors.push(String(err));
      }
    }

    return NextResponse.json({ ok: true, total: videos.length, ...results, remaining: videos.length - existingIds.size - results.processed });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
