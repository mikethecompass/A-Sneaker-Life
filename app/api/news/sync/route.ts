/**
 * GET /api/news/sync
 *
 * Syncs news articles — sets stale drafts to "archived" and performs
 * any scheduled publishing. Called via Vercel cron every 6 hours.
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // ── Auth: Vercel Cron or manual trigger ──────────────────────────────────
  const secret =
    req.headers.get("x-cron-secret") ??
    req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    archived: 0,
    published: 0,
    errors: [] as string[],
  };

  try {
    // ── 1. Auto-publish scheduled articles whose publishedAt is in the past ──
    const scheduled = await sanityWriteClient.fetch<{ _id: string }[]>(
      `*[_type == "newsArticle" && status == "scheduled" && publishedAt <= now()] { _id }`
    );

    for (const doc of scheduled) {
      try {
        await sanityWriteClient
          .patch(doc._id)
          .set({ status: "published" })
          .commit();
        results.published++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push(`Publish ${doc._id} failed: ${msg}`);
      }
    }

    // ── 2. Archive old drafts (> 30 days without publishing) ─────────────────
    const staleDrafts = await sanityWriteClient.fetch<{ _id: string }[]>(
      `*[_type == "newsArticle" && status == "draft" && _createdAt < dateTime(now()) - 60*60*24*30] { _id }`
    );

    for (const doc of staleDrafts) {
      try {
        await sanityWriteClient
          .patch(doc._id)
          .set({ status: "archived" })
          .commit();
        results.archived++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push(`Archive ${doc._id} failed: ${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.errors.push(`Sync failed: ${msg}`);
  }

  console.log("News sync complete:", results);

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
