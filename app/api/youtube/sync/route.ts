/**
 * POST /api/youtube/sync
 *
 * Fetches the latest videos from the A Sneaker Life YouTube channel
 * and upserts them into Sanity CMS.
 *
 * Called on a cron schedule (every 12 hours via vercel.json).
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchLatestVideos } from "@/lib/youtube/client";
import { sanityWriteClient } from "@/lib/sanity/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Fetch from YouTube ─────────────────────────────────────────────────
  let videos;
  try {
    videos = await fetchLatestVideos(20);
  } catch (err) {
    return NextResponse.json(
      { error: `YouTube fetch failed: ${err}` },
      { status: 500 }
    );
  }

  const results = { upserted: 0, skipped: 0, errors: [] as string[] };

  // ── 2. Upsert each video into Sanity ──────────────────────────────────────
  for (const video of videos) {
    try {
      const docId = `video-${video.youtubeId}`;

      await sanityWriteClient.createOrReplace({
          _id: docId,
          _type: "video",
          title: video.title,
          youtubeId: video.youtubeId,
          thumbnailUrl: video.thumbnailUrl,
          description: video.description.slice(0, 2000),
          publishedAt: video.publishedAt,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          tags: video.tags.slice(0, 20),
          featured: false,
        });

      results.upserted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Failed to upsert ${video.youtubeId}: ${msg}`);
      results.skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
