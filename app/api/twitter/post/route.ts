/**
 * POST /api/twitter/post
 *
 * Fetches the top un-tweeted deals from Sanity, posts them to X via
 * RobinReach, and marks each deal as tweetedAt in Sanity.
 *
 * Called on a cron schedule via vercel.json (every 6 hours).
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { sanityClient, sanityWriteClient } from "@/lib/sanity/client";
import { UNTWEETED_DEALS_QUERY } from "@/lib/sanity/queries";
import { batchPostDeals } from "@/lib/social/robinreach";
import type { TweetDealPayload } from "@/lib/social/robinreach";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface SanityDeal {
  _id: string;
  title: string;
  brand: { name: string };
  affiliateUrl: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  imageUrl?: string;
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Fetch untweeted deals from Sanity ──────────────────────────────────
  let deals: SanityDeal[];
  try {
    deals = await sanityClient.fetch(UNTWEETED_DEALS_QUERY);
  } catch (err) {
    return NextResponse.json(
      { error: `Sanity fetch failed: ${err}` },
      { status: 500 }
    );
  }

  if (!deals.length) {
    return NextResponse.json({ ok: true, message: "No untweeted deals found" });
  }

  // ── 2. Convert to tweet payloads ──────────────────────────────────────────
  const payloads: TweetDealPayload[] = deals.map((d) => ({
    dealId: d._id,
    title: d.title,
    brand: d.brand?.name ?? "Unknown Brand",
    originalPrice: d.originalPrice,
    salePrice: d.salePrice,
    discountPercent: d.discountPercent,
    affiliateUrl: d.affiliateUrl,
    imageUrl: d.imageUrl,
  }));

  // ── 3. Post via RobinReach ────────────────────────────────────────────────
  const postResults = await batchPostDeals(payloads);

  // ── 4. Mark successfully posted deals as tweetedAt in Sanity ─────────────
  const tweetedAt = new Date().toISOString();
  const updatePromises = postResults
    .filter((r) => r.success)
    .map((r) =>
      sanityWriteClient
        .patch(r.dealId)
        .set({ tweetedAt })
        .commit()
        .catch((err) => console.error(`Failed to mark ${r.dealId} as tweeted:`, err))
    );

  await Promise.allSettled(updatePromises);

  const posted = postResults.filter((r) => r.success).length;
  const failed = postResults.filter((r) => !r.success).length;

  return NextResponse.json({
    ok: true,
    timestamp: tweetedAt,
    posted,
    failed,
    details: postResults,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
