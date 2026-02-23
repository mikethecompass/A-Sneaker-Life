/**
 * GET /api/debug
 * Returns raw CJ and Impact API responses for debugging.
 * Protected by CRON_SECRET. Remove this route after debugging.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // ── Test CJ ───────────────────────────────────────────────────────────────
  try {
    const cjToken = process.env.CJ_API_KEY;
    const websiteId = process.env.CJ_WEBSITE_ID;

    const query = `{
      products(
        companyId: "${websiteId}"
        keywords: ["sneakers", "shoes"]
        partnerIds: ["4942550", "5881002", "7345657", "5632470"]
        partnerStatus: JOINED
        limit: 5
      ) {
        resultList {
          id
          title
          description
          price { amount currency }
          salePrice { amount currency }
          imageLink
          link
          brand
          advertiserId
          advertiserName
        }
      }
    }`;

    const cjRes = await fetch("https://ads.api.cj.com/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cjToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const cjText = await cjRes.text();
    results.cj = {
      status: cjRes.status,
      ok: cjRes.ok,
      websiteId,
      rawResponse: cjText.slice(0, 3000),
    };
  } catch (err) {
    results.cj = { error: String(err) };
  }

  const sid = process.env.IMPACT_ACCOUNT_SID;
  const key = process.env.IMPACT_API_KEY;
  const auth = Buffer.from(`${sid}:${key}`).toString("base64");
  const impactBase = `https://api.impact.com/Mediapartners/${sid}`;

  // ── Test Impact /Campaigns — lists all approved partner brands ─────────────
  // If this returns 0 items you have no approved advertisers yet.
  try {
    const res = await fetch(`${impactBase}/Campaigns?PageSize=50`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(text); } catch { /* leave empty */ }

    const items = (parsed.Items as unknown[]) ?? [];
    results.impact_campaigns = {
      status: res.status,
      ok: res.ok,
      totalCount: parsed.TotalCount ?? items.length,
      // Show just the advertiser names so you can see who approved you
      advertisers: items.map((c: unknown) => {
        const camp = c as Record<string, unknown>;
        return { id: camp.CampaignId, name: camp.CampaignName, advertiser: camp.AdvertiserName };
      }),
      rawResponse: text.slice(0, 2000),
    };
  } catch (err) {
    results.impact_campaigns = { error: String(err) };
  }

  // ── Test Impact /Ads — no filters, raw count ───────────────────────────────
  try {
    const res = await fetch(`${impactBase}/Ads?PageSize=10&AdStatus=ACTIVE`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(text); } catch { /* leave empty */ }

    results.impact_ads = {
      status: res.status,
      ok: res.ok,
      totalCount: parsed.TotalCount ?? 0,
      itemCount: ((parsed.Items as unknown[]) ?? []).length,
      rawResponse: text.slice(0, 2000),
    };
  } catch (err) {
    results.impact_ads = { error: String(err) };
  }

  // ── Test Impact /Promotions DISCOUNT ──────────────────────────────────────
  try {
    const res = await fetch(
      `${impactBase}/Promotions?PageSize=10&PromotionType=DISCOUNT&Status=ACTIVE`,
      { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } }
    );
    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(text); } catch { /* leave empty */ }

    results.impact_promotions_discount = {
      status: res.status,
      ok: res.ok,
      totalCount: parsed.TotalCount ?? 0,
      itemCount: ((parsed.Items as unknown[]) ?? []).length,
      rawResponse: text.slice(0, 2000),
    };
  } catch (err) {
    results.impact_promotions_discount = { error: String(err) };
  }

  // ── Test Impact /Promotions SALE ──────────────────────────────────────────
  try {
    const res = await fetch(
      `${impactBase}/Promotions?PageSize=10&PromotionType=SALE&Status=ACTIVE`,
      { headers: { Authorization: `Basic ${auth}`, Accept: "application/json" } }
    );
    const text = await res.text();
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(text); } catch { /* leave empty */ }

    results.impact_promotions_sale = {
      status: res.status,
      ok: res.ok,
      totalCount: parsed.TotalCount ?? 0,
      itemCount: ((parsed.Items as unknown[]) ?? []).length,
      rawResponse: text.slice(0, 2000),
    };
  } catch (err) {
    results.impact_promotions_sale = { error: String(err) };
  }

  // ── Test Impact /Deals (403 expected unless account has Deals access) ──────
  try {
    const res = await fetch(`${impactBase}/Deals?PageSize=5&Status=ACTIVE`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
    });
    const text = await res.text();
    results.impact_deals = {
      status: res.status,
      ok: res.ok,
      rawResponse: text.slice(0, 1000),
    };
  } catch (err) {
    results.impact_deals = { error: String(err) };
  }

  return NextResponse.json(results, { status: 200 });
}
