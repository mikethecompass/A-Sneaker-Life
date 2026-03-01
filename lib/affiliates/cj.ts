/**
 * Commission Junction (CJ Affiliate) Product Search API client
 *
 * Docs: https://developers.cj.com/docs/product-catalog-search-api
 *
 * Authentication: Bearer token via CJ_API_KEY
 *
 * The Product Catalog Search API lets us query by keyword, brand,
 * price range, and promotional type.
 */

import type { CjApiResponse, CjProduct, RawDeal } from "./types";

const CJ_BASE_URL = "https://product-search.api.cj.com/v2";

// Sneaker brand/keyword search terms for CJ queries
const SNEAKER_SEARCH_TERMS = [
  "Nike shoes",
  "Adidas shoes",
  "Jordan shoes",
  "New Balance shoes",
  "Puma shoes",
  "Reebok shoes",
  "Converse shoes",
  "Vans shoes",
  "Asics shoes",
  "Saucony shoes",
];

const BLOCKED_BRANDS = [
  "allbirds",
  "skechers",
  "crocs",
  "ugg",
  "birkenstock",
  "clarks",
  "merrell",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function calcDiscount(original: number, sale: number): number {
  if (!original || original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

function toRawDeal(product: CjProduct, discountPercent: number): RawDeal {
  const originalPrice = parseFloat(product.price) || 0;
  const salePrice = parseFloat(product["sale-price"]) || originalPrice;

  return {
    networkId: product["link-id"],
    network: "cj",
    title: product["link-name"],
    description: product.description ?? "",
    brand: product.advertiser ?? "",
    imageUrl: product["img-url"] ?? "",
    rawAffiliateUrl: product["buy-url"],
    originalPrice,
    salePrice,
    discountPercent,
    currency: product.currency ?? "USD",
    expiresAt: product["promotion-end-date"] ?? null,
    categories: [],
    sku: product.sku,
  };
}

async function fetchPage(
  keyword: string,
  websiteId: string,
  token: string,
  pageNum: number,
  pageSize: number
): Promise<CjProduct[]> {
  const params = new URLSearchParams({
    "website-id": websiteId,
    keywords: keyword,
    "page-number": String(pageNum),
    "records-per-page": String(pageSize),
    // Only active advertisers
    "advertiser-ids": "joined",
  });

  const url = `${CJ_BASE_URL}/product-search?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CJ API error ${res.status}: ${body}`);
  }

  const data: CjApiResponse = await res.json();
  const raw = data?.links?.link;
  if (!raw) return [];

  // CJ returns single object instead of array when only one result
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * Fetch deals from CJ Affiliate by cycling through sneaker keywords.
 *
 * @param minDiscount Only return deals at or above this % off (default 10)
 */
export async function fetchCjDeals(minDiscount = 10): Promise<RawDeal[]> {
  const token = process.env.CJ_API_KEY;
  const websiteId = process.env.CJ_WEBSITE_ID;

  if (!token) throw new Error("Missing CJ_API_KEY");
  if (!websiteId) throw new Error("Missing CJ_WEBSITE_ID");

  const seen = new Set<string>();
  const deals: RawDeal[] = [];

  for (const keyword of SNEAKER_SEARCH_TERMS) {
    let products: CjProduct[];

    try {
      products = await fetchPage(keyword, websiteId, token, 1, 50);
    } catch (err) {
      console.error(`CJ fetch failed for keyword "${keyword}":`, err);
      continue;
    }

    for (const product of products) {
      // Deduplicate by link-id across keyword searches
      if (seen.has(product["link-id"])) continue;
      seen.add(product["link-id"]);

      const originalPrice = parseFloat(product.price) || 0;
      const salePrice = parseFloat(product["sale-price"]) || 0;

      // Skip if no sale price or no original price
      if (!originalPrice || !salePrice) continue;

      // CJ sometimes returns items where sale == original
      if (salePrice >= originalPrice) continue;

      const discountPercent = calcDiscount(originalPrice, salePrice);

      if (discountPercent < minDiscount) continue;

      const rawDeal = toRawDeal(product, discountPercent);
      const brandLower = rawDeal.brand.toLowerCase();
      if (BLOCKED_BRANDS.some(b => brandLower.includes(b))) continue;
      deals.push(rawDeal);
    }
  }

  return deals;
}
