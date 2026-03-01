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

  // ── 2. Normalize deals (skip Switchy, use raw affiliate URL) ─────────────
  const wrappedDeals: NormalizedDeal[] = [];
  for (const raw of rawDeals) {
    const normalized = normalizeDeal(raw, raw.rawAffiliateUrl);
    if (normalized) wrappedDeals.push(normalized);
  }

  // ── 3. Deduplicate across networks ────────────────────────────────────────
  const deduped = deduplicateDeals(sortDeals(wrappedDeals));
  results.afterDedup = deduped.length;

  // ── 4. Upsert into Sanity (batched) ───────────────────────────────────────
  const BATCH_SIZE = 50;
  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    const batch = deduped.slice(i, i + BATCH_SIZE);
    const mutations = batch.map((deal) => ({
      createOrReplace: {
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
        sku: deal.sku,
        colorway: deal.colorway,
        gender: deal.gender,
        sizes: deal.sizes,
        publishedAt: new Date().toISOString(),
        featured: false,
        brand: null,
      },
    }));
    try {
      await sanityWriteClient.mutate(mutations);
      results.upserted += batch.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Batch upsert failed: ${msg}`);
      results.skipped += batch.length;
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
