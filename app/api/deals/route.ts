/**
 * GET /api/deals
 *
 * Public API endpoint — returns deals from Sanity with optional
 * filtering by discount tier.
 *
 * Query params:
 *   tier    = 10 | 20 | 30 | 50  (filter by discount tier)
 *   limit   = number              (default 50)
 *   network = "impact" | "cj"     (optional network filter)
 */

import { NextRequest, NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DEALS_QUERY, DEALS_BY_TIER_QUERY } from "@/lib/sanity/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tierParam = searchParams.get("tier");
  const tier = tierParam ? parseInt(tierParam, 10) : null;

  try {
    let deals;

    if (tier && [10, 20, 30, 50].includes(tier)) {
      deals = await sanityClient.fetch(DEALS_BY_TIER_QUERY, { tier });
    } else {
      deals = await sanityClient.fetch(ALL_DEALS_QUERY);
    }

    return NextResponse.json(
      { deals, count: deals.length, timestamp: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Deals API error:", err);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}
