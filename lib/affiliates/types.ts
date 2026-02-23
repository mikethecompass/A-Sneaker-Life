// ─── Canonical Deal type used throughout the app ─────────────────────────────

export type DiscountTier = 10 | 20 | 30 | 50;

export interface RawDeal {
  /** Unique identifier from the affiliate network */
  networkId: string;
  /** "impact" | "cj" */
  network: "impact" | "cj";
  title: string;
  description: string;
  brand: string;
  imageUrl: string;
  /** The affiliate deep-link (before Switchy wrapping) */
  rawAffiliateUrl: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  /** ISO 8601 */
  expiresAt: string | null;
  /** Keyword tags from the network */
  categories: string[];
  /** Slug for the deal page (computed from brand + title + id) */
  slug: string;
  /** Sneaker-specific metadata */
  sku?: string;
  colorway?: string;
  gender?: "mens" | "womens" | "youth" | "unisex";
  sizes?: string[];
}

export interface NormalizedDeal extends RawDeal {
  /** Switchy short link */
  affiliateUrl: string;
  /** Which discount bucket this falls into */
  discountTier: DiscountTier;
  /** Slug for the deal page */
  slug: string;
}

// ─── Impact Radius raw API shapes ─────────────────────────────────────────────

export interface ImpactProduct {
  Id: string;
  Name: string;
  Description: string;
  BrandName: string;
  ImageUrl: string;
  DirectUrl: string;
  OriginalPrice: number;
  SalePrice: number;
  Discount: number;
  Currency: string;
  ExpirationDate: string | null;
  Categories: string[];
  SKU?: string;
}

export interface ImpactApiResponse {
  "@type": string;
  Items: ImpactProduct[];
  TotalCount: number;
}

export interface ImpactCatalogItem {
  Id: string;
  CatalogId: string;
  CampaignId: number;
  CampaignName: string;
  Name: string;
  Description: string;
  Url: string;
  ImageUrl: string;
  CurrentPrice: string;
  OriginalPrice: string;
  Currency: string;
  Labels: string[];
  Brand: string;
  Manufacturer: string;
  Gtin?: string;
  Mpn?: string;
  StockAvailability?: string;
}

export interface ImpactCatalogResponse {
  "@type": string;
  Items: ImpactCatalogItem[];
  TotalCount: number;
  "@nextpageuri"?: string;
}

// ─── CJ Affiliate raw API shapes ──────────────────────────────────────────────

export interface CjProduct {
  "link-id": string;
  "link-name": string;
  description: string;
  advertiser: string;
  "img-url": string;
  "buy-url": string;
  price: string;
  "sale-price": string;
  currency: string;
  "promotion-type": string;
  "promotion-start-date": string;
  "promotion-end-date": string;
  sku?: string;
}

export interface CjApiResponse {
  links: {
    link: CjProduct | CjProduct[];
    total: string;
  };
}
