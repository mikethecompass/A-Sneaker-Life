/**
 * Impact Radius (Impact.com) API client
 */

import type { RawDeal } from "./types";

const IMPACT_BASE_URL = "https://api.impact.com";

function buildBasicAuth(): string {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  const key = process.env.IMPACT_API_KEY;
  if (!sid || !key) throw new Error("Missing IMPACT_ACCOUNT_SID or IMPACT_API_KEY");
  return Buffer.from(`${sid}:${key}`).toString("base64");
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

async function fetchAds(auth: string, sid: string): Promise<RawDeal[]> {
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
    const originalPrice = Number(item.OriginalPrice) || 0;
    const salePrice = Number(item.SalePrice) || 0;

    const discountPercent = item.Discount != null
      ? Number(item.Discount)
      : calcDiscount(originalPrice, salePrice);

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

  console.log(`[Impact /Ads] raw=${rawCount} returned=${deals.length}`);
  return deals;
}

async function fetchDeals(auth: string, sid: string): Promise<RawDeal[]> {
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
    const originalPrice = Number(item.OriginalPrice) || Number(item.Price) || 0;
    const salePrice = Number(item.SalePrice) || Number(item.DiscountedPrice) || 0;

    const discountPercent = item.DiscountPercent != null
      ? Number(item.DiscountPercent)
      : calcDiscount(originalPrice, salePrice);

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

async function fetchPromotions(auth: string, sid: string): Promise<RawDeal[]> {
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
    allItems.push(...(data.Promotions ?? data.Items ?? []));
  }

  console.log(`[Impact /Promotions] total raw items=${allItems.length}`);
  const deals: RawDeal[] = [];

  for (const item of allItems as Record<string, unknown>[]) {
    const discountPercent = Number(item.DiscountPercent) || 0;
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

  console.log(`[Impact /Promotions] returned=${deals.length}`);
  return deals;
}

export async function fetchImpactDeals(minDiscount = 0): Promise<RawDeal[]> {
  const auth = buildBasicAuth();
  const sid = getAccountSid();

  const [adsResult, promosResult] = await Promise.allSettled([
    fetchAds(auth, sid),
    fetchPromotions(auth, sid),
  ]);

  const all: RawDeal[] = [];

  if (adsResult.status === "fulfilled") all.push(...adsResult.value);
  if (promosResult.status === "fulfilled") all.push(...promosResult.value);

  const seen = new Set<string>();
  return all.filter((d) => {
    if (seen.has(d.networkId)) return false;
    seen.add(d.networkId);
    return true;
  });
}
