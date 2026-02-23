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

  // ── Test CJ with XML ──────────────────────────────────────────────────────
  try {
    const cjToken = process.env.CJ_API_KEY;
    const websiteId = process.env.CJ_WEBSITE_ID;

    // CJ GraphQL products query with correct partnerIds param
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

  // ── Test Impact /Ads ───────────────────────────────────────────────────────
  try {
    const sid = process.env.IMPACT_ACCOUNT_SID;
    const key = process.env.IMPACT_API_KEY;
    const auth = Buffer.from(`${sid}:${key}`).toString("base64");

    const params = new URLSearchParams({
      PageSize: "5",
      AdStatus: "ACTIVE",
      DealType: "PERCENT_OFF",
    });

    const impactRes = await fetch(
      `https://api.impact.com/Mediapartners/${sid}/Ads?${params}`,
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
      rawResponse: impactText.slice(0, 3000),
    };
  } catch (err) {
    results.impact = { error: String(err) };
  }

  return NextResponse.json(results);
}
