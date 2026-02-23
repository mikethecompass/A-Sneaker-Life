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

    const params = new URLSearchParams({
      "website-id": websiteId ?? "",
      keywords: "sneakers",
      "page-number": "1",
      "records-per-page": "5",
      "advertiser-ids": "4942550,5881002,7345657",
    });

    const cjRes = await fetch(
      `https://product-search.api.cj.com/v2/product-search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${cjToken}`,
          Accept: "application/json",
        },
      }
    );

    const cjText = await cjRes.text();
    results.cj = {
      status: cjRes.status,
      ok: cjRes.ok,
      rawResponse: cjText.slice(0, 2000), // first 2000 chars
    };
  } catch (err) {
    results.cj = { error: String(err) };
  }

  // ── Test Impact ───────────────────────────────────────────────────────────
  try {
    const sid = process.env.IMPACT_ACCOUNT_SID;
    const key = process.env.IMPACT_API_KEY;
    const auth = Buffer.from(`${sid}:${key}`).toString("base64");

    const impactRes = await fetch(
      `https://api.impact.com/Mediapartners/${sid}/Deals?PageSize=5`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      }
    );

    const impactText = await impactRes.text();
    results.impact = {
      status: impactRes.status,
      ok: impactRes.ok,
      rawResponse: impactText.slice(0, 2000),
    };
  } catch (err) {
    results.impact = { error: String(err) };
  }

  return NextResponse.json(results);
}
