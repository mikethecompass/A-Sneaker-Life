import type { SneakerLookupResult, AffiliateLink } from "@/types/vault";

const SNEAKER_DB_BASE = "https://api.thesneakerdatabase.com/v1";

export async function lookupByUPC(upc: string): Promise<SneakerLookupResult | null> {
  try {
    const res = await fetch(
      `${SNEAKER_DB_BASE}/sneakers?limit=1&upc=${encodeURIComponent(upc)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const sneaker = data?.results?.[0];
    if (!sneaker) return null;
    return mapSneakerDBResult(sneaker);
  } catch {
    return null;
  }
}

export async function lookupBySKU(sku: string): Promise<SneakerLookupResult | null> {
  try {
    const res = await fetch(
      `${SNEAKER_DB_BASE}/sneakers?limit=1&styleId=${encodeURIComponent(sku)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const sneaker = data?.results?.[0];
    if (!sneaker) return null;
    return mapSneakerDBResult(sneaker);
  } catch {
    return null;
  }
}

export async function searchSneakers(query: string): Promise<SneakerLookupResult[]> {
  try {
    const res = await fetch(
      `${SNEAKER_DB_BASE}/sneakers?limit=8&name=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.results || []).map(mapSneakerDBResult);
  } catch {
    return [];
  }
}

export function generateAffiliateLinks(sneaker: SneakerLookupResult): AffiliateLink[] {
  const brand = sneaker.brand?.toLowerCase() || "";
  const skuEncoded = encodeURIComponent(sneaker.sku || sneaker.name);
  const links: AffiliateLink[] = [];

  const accountSid = process.env.IMPACT_ACCOUNT_SID || "";

  // Foot Locker — Impact Radius (all brands)
  links.push({
    retailer: "Foot Locker",
    url: `https://www.footlocker.com/search?query=${skuEncoded}&cm_mmc=AFF-_-IMPACT-_-${accountSid}-_-VAULT`,
  });

  // Champs Sports — Impact Radius
  links.push({
    retailer: "Champs Sports",
    url: `https://www.champssports.com/search?query=${skuEncoded}&cm_mmc=AFF-_-IMPACT-_-${accountSid}-_-VAULT`,
  });

  if (brand.includes("adidas") || brand.includes("yeezy")) {
    links.push({
      retailer: "adidas",
      url: `https://www.adidas.com/us/search?q=${skuEncoded}`,
    });
  }

  if (brand.includes("new balance")) {
    links.push({
      retailer: "New Balance",
      url: `https://www.newbalance.com/search?q=${skuEncoded}`,
    });
  }

  // StockX for price reference
  links.push({
    retailer: "StockX",
    url: `https://stockx.com/search?s=${skuEncoded}`,
  });

  return links;
}

function mapSneakerDBResult(sneaker: Record<string, unknown>): SneakerLookupResult {
  const resellPrices = sneaker.lowestResellPrice as Record<string, string> | undefined;
  const media = sneaker.media as Record<string, string> | undefined;
  return {
    name: (sneaker.title as string) || (sneaker.name as string) || "",
    brand: (sneaker.brand as string) || "",
    colorway: (sneaker.colorway as string) || "",
    sku: (sneaker.styleId as string) || (sneaker.sku as string) || "",
    releaseDate: sneaker.releaseDate as string | undefined,
    retailPrice: sneaker.retailPrice ? parseInt(sneaker.retailPrice as string) : undefined,
    marketPrice: resellPrices?.stockX
      ? parseInt(resellPrices.stockX)
      : resellPrices?.goat
      ? parseInt(resellPrices.goat)
      : undefined,
    imageUrl: media?.imageUrl || (sneaker.thumbnail as string),
    upc: sneaker.upc as string | undefined,
  };
}
