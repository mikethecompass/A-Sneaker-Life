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

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 3600) +
         (parseInt(match[2] || "0") * 60) +
         (parseInt(match[3] || "0"));
}

async function generateReviewWithAI(title: string, description: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log("ANTHROPIC_API_KEY present:", !!apiKey, "length:", apiKey?.length);
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
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `You are a sneaker reviewer. Based on this YouTube video title and description, generate a structured review. Respond ONLY with valid JSON, no markdown backticks.

Title: ${title}
Description: ${description.slice(0, 500)}

{"shoeName":"shoe name","brand":"brand","summary":"2-3 sentences","pros":["pro1","pro2"],"cons":["con1"],"verdict":"one sentence","rating":7,"retailPrice":120}`
      }]
    })
  });

  const text = await response.text();
  console.log("Anthropic status:", response.status, "body:", text.slice(0, 300));
  if (!response.ok) return null;

  try {
    const data = JSON.parse(text);
    const content = data.content?.[0]?.text ?? "{}";
    return JSON.parse(content.replace(/```json|```/g, "").trim());
  } catch { return null; }
}

async function getAllYouTubeVideos() {
  // Use uploads playlist to get ALL videos (no 200-cap like search endpoint)
  const uploadsPlaylistId = CHANNEL_ID?.replace("UC", "UU");
  let videoIds: string[] = [];
  let pageToken = "";

  // Step 1: get all video IDs from uploads playlist
  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ""}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const ids = (data.items ?? []).map((v: any) => v.contentDetails?.videoId).filter(Boolean);
    videoIds = videoIds.concat(ids);
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  console.log(`Found ${videoIds.length} total video IDs from uploads playlist`);

  // Step 2: fetch full details in batches of 50
  const videos: any[] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50).join(",");
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${chunk}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    videos.push(...(data.items ?? []));
  }

  return videos;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== "Bearer secret123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const limit = body.limit ?? 10;

  try {
    const videos = await getAllYouTubeVideos();
    console.log(`Found ${videos.length} YouTube videos`);

    // Get existing review youtubeIds to skip already processed
    const existing = await sanityWriteClient.fetch<{ youtubeId: string }[]>(
      `*[_type == "review"]{ youtubeId }`
    );
    const existingIds = new Set(existing.map((r) => r.youtubeId));

    const toProcess = videos
      .filter((v) => !existingIds.has(v.id))
      .slice(0, limit);

    console.log(`Processing ${toProcess.length} new videos`);

    const results = { processed: 0, skipped: 0, errors: [] as string[] };

    for (const video of toProcess) {
      try {
        const youtubeId = video.id;
        const title = video.snippet?.title ?? "";
        const description = video.snippet?.description ?? "";
        const thumbnailUrl = video.snippet?.thumbnails?.maxres?.url ?? video.snippet?.thumbnails?.high?.url ?? "";
        const publishedAt = video.snippet?.publishedAt ?? new Date().toISOString();

        if (!youtubeId || !title) { results.skipped++; continue; }

        // Skip Shorts (60 seconds or under)
        const duration = parseDuration(video.contentDetails?.duration ?? "");
        if (duration <= 60) { results.skipped++; continue; }

        // Skip if title contains #shorts
        if (title.toLowerCase().includes("#shorts")) { results.skipped++; continue; }

        // Filter out clearly off-topic content (finance, investing, etc.)
        const offTopicKeywords = ["invest", "stock", "dividend", "wealth", "finance", "bitcoin", "crypto"];
        const isOffTopic = offTopicKeywords.some(kw => title.toLowerCase().includes(kw));
        if (isOffTopic) { results.skipped++; continue; }

        const ai = await generateReviewWithAI(title, description);
        if (!ai) { results.errors.push(`AI failed for ${title}`); continue; }

        const slug = slugify(ai.shoeName ?? title);
        const brand = (ai.brand ?? "").toLowerCase();
        const shoe = ai.shoeName ?? title;
        const relevantRetailers = RETAILERS.filter(r => {
          const name = r.retailer.toLowerCase();
          if (["foot locker", "champs sports", "stockx", "goat"].includes(name)) return true;
          if (name === "adidas") return brand.includes("adidas") || brand.includes("yeezy");
          if (name === "nike" || name === "jordan") return brand.includes("nike") || brand.includes("jordan") || brand.includes("air jordan");
          if (name === "new balance") return brand.includes("new balance");
          return true;
        });
        const affiliateLinks = relevantRetailers.map(r => ({
          _key: r.retailer.replace(/\s/g, ""),
          retailer: r.retailer,
          url: r.baseUrl + encodeURIComponent(shoe),
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
