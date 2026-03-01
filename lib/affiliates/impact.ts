/**
 * Impact Radius (Impact.com) Product Search API client
 *
 * Docs: https://developer.impact.com/default#operations-Ads-GetAds
 *
 * Authentication: HTTP Basic Auth
 *   Username = Account SID  (IMPACT_ACCOUNT_SID)
 *   Password = API Key      (IMPACT_API_KEY)
 *
 * We search specifically for sneaker/footwear ads and filter
 * by discount percentage tiers.
 */

import type { ImpactApiResponse, RawDeal } from "./types";

const IMPACT_BASE_URL = "https://api.impact.com";

// Sneaker-relevant category keywords for filtering Impact results
const SNEAKER_KEYWORDS = [
  "sneaker",
  "shoe",
  "footwear",
  "running",
  "basketball",
  "jordan",
  "nike",
  "adidas",
  "new balance",
  "puma",
  "reebok",
  "converse",
  "vans",
  "asics",
  "under armour",
];

function buildBasicAuth(): string {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  const key = process.env.IMPACT_API_KEY;
  if (!sid || !key) throw new Error("Missing IMPACT_ACCOUNT_SID or IMPACT_API_KEY");
  return Buffer.from(`${sid}:${key}`).toString("base64");
}

function isSneakerRelated(product: { Name: string; Description: string; Categories: string[] }): boolean {
  const haystack = [
    product.Name,
    product.Description,
    ...product.Categories,
  ]
    .join(" ")
    .toLowerCase();

  return SNEAKER_KEYWORDS.some((kw) => haystack.includes(kw));
}

function calcDiscount(original: number, sale: number): number {
  if (!original || original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

/**
 * Fetch deals from Impact Radius.
 *
 * @param minDiscount Only return deals at or above this % off (default 10)
 * @param pageSize    Number of results per page (max 100 per Impact API)
 */
export async function fetchImpactDeals(
  minDiscount = 10,
  pageSize = 100
): Promise<RawDeal[]> {
  const auth = buildBasicAuth();

  // Impact's Ads endpoint supports keyword search and pagination
  const params = new URLSearchParams({
    PageSize: String(pageSize),
    Keywords: "sneakers shoes Nike Adidas Jordan",
    OnSale: "true",
  });

  const url = `${IMPACT_BASE_URL}/Mediapartners/${process.env.IMPACT_ACCOUNT_SID}/Catalogs/ItemSearch?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    },
    cache: "no-store", // cache 30 min for Next.js fetch cache
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Impact API error ${res.status}: ${body}`);
  }

  const data: ImpactApiResponse = await res.json();

  const deals: RawDeal[] = [];

  for (const item of data.Items ?? []) {
    // Skip non-sneaker items
    if (!isSneakerRelated(item)) continue;

    const originalPrice = Number(item.OriginalPrice) || 0;
    const salePrice = Number(item.SalePrice) || 0;

    // Skip items with no pricing data
    if (!originalPrice || !salePrice) continue;

    const discountPercent =
      item.Discount != null ? Number(item.Discount) : calcDiscount(originalPrice, salePrice);

    // Apply minimum discount filter
    if (discountPercent < minDiscount) continue;

    deals.push({
      networkId: item.Id,
      network: "impact",
      title: item.Name,
      description: item.Description ?? "",
      brand: item.BrandName ?? "",
      imageUrl: item.ImageUrl ?? "",
      rawAffiliateUrl: item.DirectUrl,
      originalPrice,
      salePrice,
      discountPercent,
      currency: item.Currency ?? "USD",
      expiresAt: item.ExpirationDate ?? null,
      categories: item.Categories ?? [],
      sku: item.SKU,
    });
  }

  return deals;
}
