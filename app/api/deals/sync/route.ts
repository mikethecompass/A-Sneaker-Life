/**
 * POST /api/deals/sync
 *
 * Fetches deals from Impact Radius + CJ Affiliate, filters by discount tier,
 * wraps links through Switchy, and upserts into Sanity CMS.
 *
 * Called on a cron schedule via vercel.json (every 4 hours).
 * Protected by CRON_SECRET header.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchImpactDeals } from "@/lib/affiliates/impact";
import { fetchCjDeals } from "@/lib/affiliates/cj";
import { normalizeDeal, deduplicateDeals, sortDeals } from "@/lib/utils/discount";
import { createSwitchyLink, buildSwitchySlug } from "@/lib/utils/switchy";
import { sanityWriteClient } from "@/lib/sanity/client";
import type { NormalizedDeal, RawDeal } from "@/lib/affiliates/types";

// Minimum discount to include (10%, 20%, 30%, 50%)
const MIN_DISCOUNT = 10;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Pro allows up to 300s

export async function POST(req: NextRequest) {
  // ── Auth: Vercel Cron or manual trigger ──────────────────────────────────
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    fetched: { impact: 0, cj: 0 },
    afterFilter: 0,
    afterDedup: 0,
    upserted: 0,
    skipped: 0,
    errors: [] as string[],
  };

  // ── 1. Fetch from both networks in parallel ───────────────────────────────
  const [impactDeals, cjDeals] = await Promise.allSettled([
    fetchImpactDeals(MIN_DISCOUNT),
    fetchCjDeals(MIN_DISCOUNT),
  ]);

  let rawDeals: RawDeal[] = [];

  if (impactDeals.status === "fulfilled") {
    results.fetched.impact = impactDeals.value.length;
    rawDeals = rawDeals.concat(impactDeals.value);
  } else {
    results.errors.push(`Impact fetch failed: ${impactDeals.reason}`);
    console.error("Impact Radius fetch error:", impactDeals.reason);
  }

  if (cjDeals.status === "fulfilled") {
    results.fetched.cj = cjDeals.value.length;
    rawDeals = rawDeals.concat(cjDeals.value);
  } else {
    results.errors.push(`CJ fetch failed: ${cjDeals.reason}`);
    console.error("CJ Affiliate fetch error:", cjDeals.reason);
  }

  results.afterFilter = rawDeals.length;

  // ── 2. Wrap each deal URL with Switchy ────────────────────────────────────
  const switchyResults = await Promise.allSettled(
    rawDeals.map(async (raw) => {
      const slug = buildSwitchySlug(raw.brand, raw.title, raw.networkId);
      const affiliateUrl = await createSwitchyLink(raw.rawAffiliateUrl, slug);
      return { raw, affiliateUrl };
    })
  );

  const wrappedDeals: NormalizedDeal[] = [];

  for (const result of switchyResults) {
    if (result.status === "rejected") {
      results.errors.push(`Switchy wrap failed: ${result.reason}`);
      continue;
    }

    const normalized = normalizeDeal(result.value.raw, result.value.affiliateUrl);
    if (normalized) wrappedDeals.push(normalized);
  }

  // ── 3. Deduplicate across networks ────────────────────────────────────────
  const deduped = deduplicateDeals(sortDeals(wrappedDeals));
  results.afterDedup = deduped.length;

  // ── 4. Upsert into Sanity in batches to avoid rate limits ────────────────
  const BATCH_SIZE = 10;
  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    const batch = deduped.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((deal) =>
        sanityWriteClient.createOrReplace({
          _id: `deal-${deal.network}-${deal.networkId}`,
          _type: "deal",
          title: deal.title,
          slug: { _type: "slug", current: deal.slug },
          description: deal.description,
          imageUrl: deal.imageUrl,
          affiliateUrl: deal.affiliateUrl,
          originalPrice: deal.originalPrice,
          salePrice: deal.salePrice,
          discountPercent: deal.discountPercent,
          discountTier: deal.discountTier,
          currency: deal.currency,
          expiresAt: deal.expiresAt,
          categories: deal.categories,
          network: deal.network,
          networkId: deal.networkId,
          sku: deal.sku ?? null,
          colorway: deal.colorway ?? null,
          gender: deal.gender ?? null,
          sizes: deal.sizes ?? [],
          publishedAt: new Date().toISOString(),
        })
      )
    );

    for (const r of batchResults) {
      if (r.status === "fulfilled") {
        results.upserted++;
      } else {
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        results.errors.push(`Sanity upsert failed: ${msg}`);
        results.skipped++;
      }
    }

    // Small pause between batches to stay under Sanity's rate limit
    if (i + BATCH_SIZE < deduped.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log("Deal sync complete:", results);

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results,
  });
}

// Allow GET for easy manual triggering from browser (still auth-protected)
export async function GET(req: NextRequest) {
  return POST(req);
}
