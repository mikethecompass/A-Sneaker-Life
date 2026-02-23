/**
 * Commission Junction (CJ Affiliate) Product Search API client
 *
 * CJ's Product Catalog Search API returns XML, not JSON.
 * We fetch XML and parse it manually.
 *
 * Authentication: Bearer token via CJ_API_KEY
 */

import type { RawDeal } from "./types";

const CJ_BASE_URL = "https://product-search.api.cj.com/v2";

const SNEAKER_SEARCH_TERMS = [
  "sneakers",
  "athletic shoes",
  "running shoes",
  "basketball shoes",
  "Nike shoes",
  "Jordan shoes",
  "Puma shoes",
  "training shoes",
  "sport shoes",
];

// CJ advertiser IDs for approved sneaker/apparel partners
const SNEAKER_ADVERTISER_IDS = [
  "4942550", // Nike
  "5881002", // Puma US
  "7345657", // Dick's Sporting Goods
  "5632470", // BSTN
  "6008402", // Li Ning Way of Wade
  "5253058", // Lacoste US
  "2844548", // Columbia Sportswear
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

/** Pull a single XML tag value from raw XML string */
function xmlVal(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
}

/** Parse CJ XML product list into raw product objects */
function parseXmlProducts(xml: string): Array<Record<string, string>> {
  const products: Array<Record<string, string>> = [];
  const productBlocks = xml.match(/<product>([\s\S]*?)<\/product>/gi) ?? [];

  for (const block of productBlocks) {
    const fields = [
      "link-id", "link-name", "description", "advertiser",
      "img-url", "buy-url", "price", "sale-price", "currency",
      "promotion-end-date", "sku",
    ];
    const product: Record<string, string> = {};
    for (const field of fields) {
      product[field] = xmlVal(block, field);
    }
    products.push(product);
  }

  return products;
}

async function fetchPage(
  keyword: string,
  websiteId: string,
  token: string,
): Promise<Array<Record<string, string>>> {
  const params = new URLSearchParams({
    "website-id": websiteId,
    keywords: keyword,
    "page-number": "1",
    "records-per-page": "50",
    "advertiser-ids": SNEAKER_ADVERTISER_IDS.join(","),
  });

  const url = `${CJ_BASE_URL}/product-search?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/xml",
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CJ API error ${res.status}: ${body.slice(0, 200)}`);
  }

  const xml = await res.text();
  return parseXmlProducts(xml);
}

export async function fetchCjDeals(minDiscount = 10): Promise<RawDeal[]> {
  const token = process.env.CJ_API_KEY;
  const websiteId = process.env.CJ_WEBSITE_ID;

  if (!token) throw new Error("Missing CJ_API_KEY");
  if (!websiteId) throw new Error("Missing CJ_WEBSITE_ID");

  const seen = new Set<string>();
  const deals: RawDeal[] = [];

  for (const keyword of SNEAKER_SEARCH_TERMS) {
    let products: Array<Record<string, string>>;

    try {
      products = await fetchPage(keyword, websiteId, token);
    } catch (err) {
      console.error(`CJ fetch failed for keyword "${keyword}":`, err);
      continue;
    }

    for (const product of products) {
      const linkId = product["link-id"];
      if (!linkId || seen.has(linkId)) continue;
      seen.add(linkId);

      const originalPrice = parseFloat(product["price"]) || 0;
      const salePrice = parseFloat(product["sale-price"]) || 0;

      if (!originalPrice || !salePrice) continue;
      if (salePrice >= originalPrice) continue;

      const discountPercent = calcDiscount(originalPrice, salePrice);
      if (discountPercent < minDiscount) continue;

      deals.push({
        networkId: linkId,
        network: "cj",
        title: product["link-name"] ?? "",
        description: product["description"] ?? "",
        brand: product["advertiser"] ?? "",
        imageUrl: product["img-url"] ?? "",
        rawAffiliateUrl: product["buy-url"] ?? "",
        originalPrice,
        salePrice,
        discountPercent,
        currency: product["currency"] || "USD",
        expiresAt: product["promotion-end-date"] || null,
        categories: [],
        sku: product["sku"] || undefined,
        slug: slugify(`${product["advertiser"]}-${product["link-name"]}-${linkId}`),
      });
    }
  }

  return deals;
}
