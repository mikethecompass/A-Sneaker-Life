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
    ...(Array.isArray(product.Categories) ? product.Categories : []),
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
  // Sneaker-focused catalog IDs from Impact
  // 2425 = adidas (60k items)
  const SNEAKER_CATALOG_IDS = ["2425"];

  const allDeals: RawDeal[] = [];

  for (const catalogId of SNEAKER_CATALOG_IDS) {
    const params = new URLSearchParams({
      PageSize: String(pageSize),
    });

    const url = `${IMPACT_BASE_URL}/Mediapartners/${process.env.IMPACT_ACCOUNT_SID}/Catalogs/${catalogId}/Items?${params}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Impact catalog ${catalogId} error: ${body}`);
      continue;
    }

    const data = await res.json();
    const items = data?.Items ?? [];
    
    for (const item of items) {
      if (!isSneakerRelated(item)) continue;
      const originalPrice = parseFloat(item.Price) || 0;
      const salePrice = parseFloat(item.SalePrice) || 0;
      if (!originalPrice) continue;
      const effectiveSalePrice = salePrice > 0 && salePrice < originalPrice ? salePrice : originalPrice;
      const discountPercent = salePrice > 0 ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;
      if (discountPercent < minDiscount && salePrice > 0) continue;
      allDeals.push({
        networkId: String(item.Id ?? item.SKU ?? Math.random()),
        network: "impact",
        title: item.Name ?? item.Title ?? "",
        description: item.Description ?? "",
        brand: item.BrandName ?? "",
        imageUrl: item.ImageUrl ?? item.Image ?? "",
        rawAffiliateUrl: item.TrackingLink ?? item.Url ?? "",
        originalPrice,
        salePrice: effectiveSalePrice,
        discountPercent,
        currency: item.Currency ?? "USD",
        expiresAt: item.ExpirationDate ?? null,
        categories: Array.isArray(item.Categories) ? item.Categories : [],
        sku: item.SKU ?? undefined,
      });
    }
  }

  return allDeals;
}

