/**
 * Impact Radius (Impact.com) API client
 *
 * Fetches product catalog items from approved advertisers via the
 * Catalogs → Catalog Items endpoints, then returns items on sale.
 */

import type { RawDeal } from "./types";

const IMPACT_BASE_URL = "https://api.impact.com";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function buildBasicAuth(): string {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  const key = process.env.IMPACT_API_KEY;
  if (!sid || !key) throw new Error("Missing IMPACT_ACCOUNT_SID or IMPACT_API_KEY");
  return Buffer.from(`${sid}:${key}`).toString("base64");
}

function getAccountSid(): string {
  const sid = process.env.IMPACT_ACCOUNT_SID;
  if (!sid) throw new Error("Missing IMPACT_ACCOUNT_SID");
  return sid;
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

function headers(auth: string) {
  return { Authorization: `Basic ${auth}`, Accept: "application/json" };
}

/* ── Types for raw API responses ─────────────────────────────────────────── */

interface CatalogEntry {
  Id: string;
  Name: string;
  AdvertiserId?: string;
  AdvertiserName?: string;
}

interface CatalogItemRaw {
  CatalogItemId?: string;
  Id?: string;
  Name?: string;
  Description?: string;
  Url?: string;
  ImageUrl?: string;
  OriginalPrice?: string | number;
  CurrentPrice?: string | number;
  SalePrice?: string | number;
  Currency?: string;
  Manufacturer?: string;
  BrandName?: string;
  Labels?: string[];
  Categories?: string[];
  Sku?: string;
  SKU?: string;
}

/* ── Step 1: Fetch all available catalog IDs ─────────────────────────────── */

async function fetchCatalogs(auth: string, sid: string): Promise<CatalogEntry[]> {
  const url = `${IMPACT_BASE_URL}/Mediapartners/${sid}/Catalogs`;

  const res = await fetch(url, {
    headers: headers(auth),
    next: { revalidate: 3600 },
  });

  console.log(`[Impact /Catalogs] status=${res.status}`);
  if (!res.ok) {
    console.error(`[Impact /Catalogs] error:`, await res.text());
    return [];
  }

  const data = await res.json();
  const catalogs: CatalogEntry[] = data.Catalogs ?? [];
  console.log(
    `[Impact /Catalogs] found ${catalogs.length} catalog(s):`,
    catalogs.map((c) => `${c.Id} (${c.Name})`).join(", ")
  );
  return catalogs;
}

/* ── Step 2: Fetch items from a single catalog ───────────────────────────── */

async function fetchCatalogItems(
  auth: string,
  sid: string,
  catalog: CatalogEntry
): Promise<RawDeal[]> {
  const params = new URLSearchParams({ PageSize: "100" });
  const url = `${IMPACT_BASE_URL}/Mediapartners/${sid}/Catalogs/${catalog.Id}/Items?${params}`;

  const res = await fetch(url, {
    headers: headers(auth),
    next: { revalidate: 1800 },
  });

  console.log(
    `[Impact Catalog ${catalog.Id} "${catalog.Name}"] status=${res.status}`
  );
  if (!res.ok) {
    console.error(
      `[Impact Catalog ${catalog.Id}] error:`,
      await res.text()
    );
    return [];
  }

  const data = await res.json();
  const items: CatalogItemRaw[] = data.Items ?? [];
  console.log(
    `[Impact Catalog ${catalog.Id}] total items returned: ${items.length}`
  );

  const deals: RawDeal[] = [];

  for (const item of items) {
    const originalPrice = Number(item.OriginalPrice) || 0;
    const salePrice =
      Number(item.CurrentPrice) || Number(item.SalePrice) || 0;

    // Only include items that are actually on sale
    if (salePrice <= 0 || originalPrice <= 0 || salePrice >= originalPrice) {
      continue;
    }

    const itemId = item.CatalogItemId ?? item.Id ?? "";
    const brand =
      item.Manufacturer ?? item.BrandName ?? catalog.AdvertiserName ?? "";
    const trackingUrl = item.Url ?? "";

    if (!trackingUrl) continue;

    deals.push({
      networkId: `cat-${catalog.Id}-${itemId}`,
      network: "impact",
      title: item.Name ?? "",
      description: item.Description ?? "",
      brand,
      imageUrl: item.ImageUrl ?? "",
      rawAffiliateUrl: trackingUrl,
      originalPrice,
      salePrice,
      discountPercent: calcDiscount(originalPrice, salePrice),
      currency: item.Currency ?? "USD",
      expiresAt: null,
      categories: item.Labels ?? item.Categories ?? [],
      sku: item.Sku ?? item.SKU,
      slug: slugify(`${brand}-${item.Name}-${itemId}`),
    });
  }

  console.log(
    `[Impact Catalog ${catalog.Id}] on-sale items: ${deals.length}`
  );
  return deals;
}

/* ── Public API ──────────────────────────────────────────────────────────── */

export async function fetchImpactDeals(minDiscount = 0): Promise<RawDeal[]> {
  const auth = buildBasicAuth();
  const sid = getAccountSid();

  // 1. Discover all catalogs
  const catalogs = await fetchCatalogs(auth, sid);
  if (catalogs.length === 0) {
    console.warn("[Impact] No catalogs found — check account approval status");
    return [];
  }

  // 2. Fetch items from every catalog in parallel
  const results = await Promise.allSettled(
    catalogs.map((cat) => fetchCatalogItems(auth, sid, cat))
  );

  const all: RawDeal[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // 3. Deduplicate by networkId and apply minimum discount filter
  const seen = new Set<string>();
  return all.filter((d) => {
    if (seen.has(d.networkId)) return false;
    seen.add(d.networkId);
    return d.discountPercent >= minDiscount;
  });
}
