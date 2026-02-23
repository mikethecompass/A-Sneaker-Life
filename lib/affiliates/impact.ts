/**
 * Impact Radius (Impact.com) API client
 *
 * Queries three endpoints in parallel:
 *   1. /Ads        — display/promotional ads
 *   2. /Deals      — curated deals from advertisers
 *   3. /Promotions — active promotions (% off, coupon codes, etc.)
 *
 * Authentication: HTTP Basic Auth
 *   Username = Account SID  (IMPACT_ACCOUNT_SID)
 *   Password = Auth Token   (IMPACT_API_KEY)
 */

import type { RawDeal } from "./types";

const IMPACT_BASE_URL = "https://api.impact.com";

const SNEAKER_KEYWORDS = [
  "sneaker", "shoe", "footwear", "running", "basketball",
  "jordan", "nike", "adidas", "new balance", "puma",
  "reebok", "converse", "vans", "asics", "under armour",
  "foot locker", "champs", "kicks",
];

const SNEAKER_BRANDS = [
  "foot locker", "champs sports", "footaction", "new balance",
  "adidas", "kicks crew", "stockx", "grailed", "brooks", "salomon",
  "nike", "jordan",
];

function buildBasicAuth(): string {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  const key = process.env.IMPACT_API_KEY;
  if (!sid || !key) throw new Error("Missing IMPACT_ACCOUNT_SID or IMPACT_API_KEY");
  return Buffer.from(`${sid}:${key}`).toString("base64");
}

function isSneakerRelated(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    SNEAKER_KEYWORDS.some((kw) => lower.includes(kw)) ||
    SNEAKER_BRANDS.some((b) => lower.includes(b))
  );
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

function getAccountSid(): string {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  if (!sid) throw new Error("Missing IMPACT_ACCOUNT_SID");
  return sid;
}

// ── Fetch from /Ads endpoint ───────────────────────────────────────────────────
async function fetchAds(auth: string, sid: string, minDiscount: number): Promise<RawDeal[]> {
  // Note: PromotionType is NOT a valid param for /Ads — only AdStatus and AdType are.
  const params = new URLSearchParams({
    PageSize: "100",
    AdStatus: "ACTIVE",
  });

  const res = await fetch(
    `${IMPACT_BASE_URL}/Mediapartners/${sid}/Ads?${params}`,
    {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      next: { revalidate: 1800 },
    }
  );

  console.log(`[Impact /Ads] status=${res.status}`);
  if (!res.ok) {
    console.error(`[Impact /Ads] error body:`, await res.text());
    return [];
  }

  const data = await res.json();
  const rawCount = (data.Items ?? []).length;
  const deals: RawDeal[] = [];

  for (const item of data.Items ?? []) {
    if (!isSneakerRelated(`${item.Name} ${item.Description} ${item.BrandName}`)) continue;

    const originalPrice = Number(item.OriginalPrice) || 0;
    const salePrice = Number(item.SalePrice) || 0;

    const discountPercent = item.Discount != null
      ? Number(item.Discount)
      : calcDiscount(originalPrice, salePrice);

    // Only require discount if we have prices; text-link ads without prices are still useful
    if (originalPrice && salePrice && discountPercent < minDiscount) continue;
    if (!item.DirectUrl && !item.LandingPageUrl) continue;

    deals.push({
      networkId: `ad-${item.Id}`,
      network: "impact",
      title: item.Name,
      description: item.Description ?? "",
      brand: item.BrandName ?? "",
      imageUrl: item.ImageUrl ?? "",
      rawAffiliateUrl: item.DirectUrl ?? item.LandingPageUrl,
      originalPrice,
      salePrice,
      discountPercent,
      currency: item.Currency ?? "USD",
      expiresAt: item.ExpirationDate ?? null,
      categories: item.Categories ?? [],
      sku: item.SKU,
      slug: slugify(`${item.BrandName}-${item.Name}-${item.Id}`),
    });
  }

  console.log(`[Impact /Ads] raw=${rawCount} sneaker-filtered=${deals.length}`);
  return deals;
}

// ── Fetch from /Deals endpoint ─────────────────────────────────────────────────
async function fetchDeals(auth: string, sid: string, minDiscount: number): Promise<RawDeal[]> {
  const params = new URLSearchParams({
    PageSize: "100",
    Status: "ACTIVE",
  });

  const res = await fetch(
    `${IMPACT_BASE_URL}/Mediapartners/${sid}/Deals?${params}`,
    {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      next: { revalidate: 1800 },
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  const deals: RawDeal[] = [];

  for (const item of data.Items ?? []) {
    const combined = `${item.Name ?? ""} ${item.Description ?? ""} ${item.AdvertiserName ?? ""}`;
    if (!isSneakerRelated(combined)) continue;

    const originalPrice = Number(item.OriginalPrice) || Number(item.Price) || 0;
    const salePrice = Number(item.SalePrice) || Number(item.DiscountedPrice) || 0;

    // Some deals are % off without explicit prices — still include them
    const discountPercent = item.DiscountPercent != null
      ? Number(item.DiscountPercent)
      : calcDiscount(originalPrice, salePrice);

    if (discountPercent < minDiscount) continue;
    if (originalPrice && salePrice && salePrice >= originalPrice) continue;

    deals.push({
      networkId: `deal-${item.Id}`,
      network: "impact",
      title: item.Name ?? item.AdvertiserName,
      description: item.Description ?? "",
      brand: item.AdvertiserName ?? "",
      imageUrl: item.ImageUrl ?? item.BannerUrl ?? "",
      rawAffiliateUrl: item.TrackingUrl ?? item.LandingPageUrl ?? "",
      originalPrice: originalPrice || salePrice,
      salePrice: salePrice || originalPrice,
      discountPercent,
      currency: item.Currency ?? "USD",
      expiresAt: item.EndDate ?? null,
      categories: [],
      slug: slugify(`${item.AdvertiserName}-${item.Name}-${item.Id}`),
    });
  }

  return deals;
}

// ── Fetch from /Promotions endpoint ───────────────────────────────────────────
// Fetches both DISCOUNT and SALE promotion types for maximum coverage
async function fetchPromotions(auth: string, sid: string, minDiscount: number): Promise<RawDeal[]> {
  const promoTypes = ["DISCOUNT", "SALE"];
  const allItems: unknown[] = [];

  for (const promoType of promoTypes) {
    const params = new URLSearchParams({
      PageSize: "100",
      PromotionType: promoType,
      Status: "ACTIVE",
    });

    const res = await fetch(
      `${IMPACT_BASE_URL}/Mediapartners/${sid}/Promotions?${params}`,
      {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
        next: { revalidate: 1800 },
      }
    );

    console.log(`[Impact /Promotions type=${promoType}] status=${res.status}`);
    if (!res.ok) {
      console.error(`[Impact /Promotions type=${promoType}] error:`, await res.text());
      continue;
    }

    const data = await res.json();
    allItems.push(...(data.Items ?? []));
  }

  console.log(`[Impact /Promotions] total raw items=${allItems.length}`);
  const deals: RawDeal[] = [];

  for (const item of allItems as Record<string, unknown>[]) {
    const combined = `${item.Name ?? ""} ${item.Description ?? ""} ${item.AdvertiserName ?? ""}`;
    if (!isSneakerRelated(combined)) continue;

    const discountPercent = Number(item.DiscountPercent) || 0;
    if (discountPercent < minDiscount) continue;

    const originalPrice = Number(item.OriginalPrice) || Number(item.Price) || 0;
    const salePrice = originalPrice
      ? Math.round(originalPrice * (1 - discountPercent / 100))
      : 0;

    deals.push({
      networkId: `promo-${item.Id}`,
      network: "impact",
      title: (item.Name as string) ?? `${item.AdvertiserName} — ${discountPercent}% Off`,
      description: (item.Description as string) ?? "",
      brand: (item.AdvertiserName as string) ?? "",
      imageUrl: (item.ImageUrl as string) ?? "",
      rawAffiliateUrl: (item.TrackingUrl as string) ?? (item.LandingPageUrl as string) ?? "",
      originalPrice,
      salePrice,
      discountPercent,
      currency: (item.Currency as string) ?? "USD",
      expiresAt: (item.EndDate as string) ?? null,
      categories: [],
      slug: slugify(`${item.AdvertiserName}-${item.Name}-${item.Id}`),
    });
  }

  console.log(`[Impact /Promotions] sneaker-filtered=${deals.length}`);
  return deals;
}

// ── Main export ────────────────────────────────────────────────────────────────
export async function fetchImpactDeals(minDiscount = 10): Promise<RawDeal[]> {
  const auth = buildBasicAuth();
  const sid = getAccountSid();

  // Query Ads and Promotions in parallel (/Deals returns 403 on this account)
  const [adsResult, promosResult] = await Promise.allSettled([
    fetchAds(auth, sid, minDiscount),
    fetchPromotions(auth, sid, minDiscount),
  ]);

  const all: RawDeal[] = [];

  if (adsResult.status === "fulfilled") all.push(...adsResult.value);
  if (promosResult.status === "fulfilled") all.push(...promosResult.value);

  // Deduplicate by networkId
  const seen = new Set<string>();
  return all.filter((d) => {
    if (seen.has(d.networkId)) return false;
    seen.add(d.networkId);
    return true;
  });
}
