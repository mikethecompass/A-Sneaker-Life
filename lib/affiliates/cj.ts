/**
 * Commission Junction (CJ Affiliate) — GraphQL API client
 *
 * Uses the new ads.api.cj.com GraphQL endpoint.
 * Old product-search.api.cj.com v2 is deprecated.
 *
 * Authentication: Bearer token via CJ_API_KEY
 */

import type { RawDeal } from "./types";

const CJ_GRAPHQL_URL = "https://ads.api.cj.com/query";

const SNEAKER_KEYWORDS = [
  "sneakers",
  "running shoes",
  "basketball shoes",
  "athletic shoes",
  "Jordan shoes",
  "Nike shoes",
  "Puma shoes",
  "training shoes",
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

interface CjGraphQLProduct {
  id: string;
  title: string;
  description: string;
  price: { amount: string; currency: string } | null;
  salePrice: { amount: string; currency: string } | null;
  imageLink: string;
  link: string;
  brand: string;
  advertiserId: string;
  advertiserName: string;
}

interface CjGraphQLResponse {
  data?: {
    products?: {
      resultList: CjGraphQLProduct[];
    };
  };
  errors?: Array<{ message: string }>;
}

async function queryProducts(
  companyId: string,
  token: string,
  keywords: string[],
): Promise<CjGraphQLProduct[]> {
  const query = `{
    products(
      companyId: "${companyId}"
      keywords: ${JSON.stringify(keywords)}
      partnerStatus: JOINED
      limit: 100
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

  const res = await fetch(CJ_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`CJ GraphQL error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data: CjGraphQLResponse = await res.json();

  if (data.errors?.length) {
    throw new Error(`CJ GraphQL errors: ${data.errors.map((e) => e.message).join(", ")}`);
  }

  return data.data?.products?.resultList ?? [];
}

export async function fetchCjDeals(minDiscount = 10): Promise<RawDeal[]> {
  const token = process.env.CJ_API_KEY;
  const companyId = process.env.CJ_WEBSITE_ID;

  if (!token) throw new Error("Missing CJ_API_KEY");
  if (!companyId) throw new Error("Missing CJ_WEBSITE_ID");

  const seen = new Set<string>();
  const deals: RawDeal[] = [];

  // Query in batches of keywords to maximize results
  const keywordBatches = [
    SNEAKER_KEYWORDS.slice(0, 4),
    SNEAKER_KEYWORDS.slice(4),
  ];

  for (const keywords of keywordBatches) {
    let products: CjGraphQLProduct[];

    try {
      products = await queryProducts(companyId, token, keywords);
    } catch (err) {
      console.error("CJ GraphQL fetch failed:", err);
      continue;
    }

    for (const product of products) {
      if (!product.id || seen.has(product.id)) continue;
      seen.add(product.id);

      const originalPrice = parseFloat(product.price?.amount ?? "0") || 0;
      const salePrice = parseFloat(product.salePrice?.amount ?? "0") || 0;
      const currency = product.price?.currency ?? "USD";

      // Skip if no pricing data
      if (!originalPrice || !salePrice) continue;

      // Skip if not actually on sale
      if (salePrice >= originalPrice) continue;

      const discountPercent = calcDiscount(originalPrice, salePrice);
      if (discountPercent < minDiscount) continue;

      // Skip if no affiliate link
      if (!product.link) continue;

      deals.push({
        networkId: product.id,
        network: "cj",
        title: product.title ?? "",
        description: product.description ?? "",
        brand: product.brand || product.advertiserName || "",
        imageUrl: product.imageLink ?? "",
        rawAffiliateUrl: product.link,
        originalPrice,
        salePrice,
        discountPercent,
        currency,
        expiresAt: null,
        categories: [],
        slug: slugify(`${product.advertiserName}-${product.title}-${product.id}`),
      });
    }
  }

  return deals;
}
