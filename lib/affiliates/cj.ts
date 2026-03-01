/**
 * Commission Junction (CJ Affiliate) Ads API client
 * New GraphQL API: ads.api.cj.com
 */

import type { RawDeal } from "./types";

const CJ_GRAPHQL_URL = "https://ads.api.cj.com/query";
const CJ_COMPANY_ID = "5259499";

const BLOCKED_BRANDS = [
  "allbirds", "skechers", "crocs", "ugg", "birkenstock", "clarks", "merrell",
];

function calcDiscount(original: number, sale: number): number {
  if (!original || original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export async function fetchCjDeals(minDiscount = 10): Promise<RawDeal[]> {
  const token = process.env.CJ_API_KEY;
  if (!token) throw new Error("Missing CJ_API_KEY");

  const query = `{
    products(
      companyId: "${CJ_COMPANY_ID}"
      partnerStatus: joined
      keywords: "sneakers shoes Nike Adidas Jordan"
      limit: 100
    ) {
      resultList {
        id
        title
        description
        advertiserName
        imageUrl
        buyUrl
        price
        salePrice
        currency
      }
    }
  }`;

  const res = await fetch(CJ_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CJ API error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const products = json?.data?.products?.resultList ?? [];

  const deals: RawDeal[] = [];

  for (const p of products) {
    const originalPrice = parseFloat(p.price) || 0;
    const salePrice = parseFloat(p.salePrice) || originalPrice;

    if (!originalPrice || !salePrice) continue;
    if (salePrice >= originalPrice) continue;

    const discountPercent = calcDiscount(originalPrice, salePrice);
    if (discountPercent < minDiscount) continue;

    const brandLower = (p.advertiserName ?? "").toLowerCase();
    if (BLOCKED_BRANDS.some(b => brandLower.includes(b))) continue;

    deals.push({
      networkId: p.id,
      network: "cj",
      title: p.title,
      description: p.description ?? "",
      brand: p.advertiserName ?? "",
      imageUrl: p.imageUrl ?? "",
      rawAffiliateUrl: p.buyUrl,
      originalPrice,
      salePrice,
      discountPercent,
      currency: p.currency ?? "USD",
      expiresAt: null,
      categories: [],
      sku: undefined,
    });
  }

  return deals;
}
