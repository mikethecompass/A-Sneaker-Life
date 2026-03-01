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
  const SNEAKER_CATALOG_IDS = [
    "2425",  // adidas
    "5700",  // Foot Locker
    "5705",  // Champs Sports
    "10393", // New Balance
  ];

  const fetchCatalog = async (catalogId: string) => {
    const params = new URLSearchParams({
      PageSize: "25",
      SubCategory: "Sale",
    });
    const url = `${IMPACT_BASE_URL}/Mediapartners/${process.env.IMPACT_ACCOUNT_SID}/Catalogs/${catalogId}/Items?${params}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.Items ?? [];
  };

  const catalogResults = await Promise.all(SNEAKER_CATALOG_IDS.map(fetchCatalog));
  const allItems = catalogResults.flat();
  const allDeals: RawDeal[] = [];

  for (const item of allItems) {
      if (!isSneakerRelated(item)) continue;
      const originalPrice = parseFloat(item.OriginalPrice) || 0;
      const currentPrice = parseFloat(item.CurrentPrice) || 0;
      if (!originalPrice || !currentPrice) continue;
      const discountPercent = item.DiscountPercentage ? parseFloat(item.DiscountPercentage) : Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      if (discountPercent < minDiscount) continue;
      allDeals.push({
        networkId: String(item.Id),
        network: "impact",
        title: item.Name ?? "",
        description: item.Description ?? "",
        brand: item.Manufacturer ?? "",
        imageUrl: item.ImageUrl ?? "",
        rawAffiliateUrl: item.Url ?? "",
        originalPrice,
        salePrice: currentPrice,
        discountPercent,
        currency: item.Currency ?? "USD",
        expiresAt: item.ExpirationDate ?? null,
        categories: Array.isArray(item.Labels) ? item.Labels : [],
        sku: item.CatalogItemId ?? undefined,
      });
  }

  return allDeals;
}

