import type { DiscountTier, NormalizedDeal, RawDeal } from "@/lib/affiliates/types";

/**
 * The four discount tiers displayed on the site.
 * Each tier badge shows deals at/above that threshold.
 */
export const DISCOUNT_TIERS: DiscountTier[] = [10, 20, 30, 50];

export const DISCOUNT_TIER_LABELS: Record<DiscountTier, string> = {
  10: "10% Off",
  20: "20% Off",
  30: "30% Off",
  50: "50%+ Off",
};

/**
 * Assign a deal to the highest applicable discount tier.
 * A deal at 55% off goes into the 50 tier.
 * A deal at 25% off goes into the 20 tier.
 */
export function assignDiscountTier(discountPercent: number): DiscountTier | null {
  if (discountPercent >= 50) return 50;
  if (discountPercent >= 30) return 30;
  if (discountPercent >= 20) return 20;
  if (discountPercent >= 10) return 10;
  return null;
}

/**
 * Filter an array of normalized deals to those belonging to a specific tier.
 */
export function filterByTier(deals: NormalizedDeal[], tier: DiscountTier): NormalizedDeal[] {
  return deals.filter((d) => d.discountTier === tier);
}

/**
 * Sort deals: higher discount first, then by recency (no expiresAt = bottom).
 */
export function sortDeals(deals: NormalizedDeal[]): NormalizedDeal[] {
  return [...deals].sort((a, b) => {
    // Primary: higher discount first
    if (b.discountPercent !== a.discountPercent) {
      return b.discountPercent - a.discountPercent;
    }
    // Secondary: sooner expiry first (urgency)
    if (a.expiresAt && b.expiresAt) {
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    }
    if (a.expiresAt) return -1;
    if (b.expiresAt) return 1;
    return 0;
  });
}

/**
 * Normalize a RawDeal into a NormalizedDeal by assigning tier + slugging.
 * Returns null if the deal doesn't meet the minimum discount threshold.
 */
export function normalizeDeal(raw: RawDeal, affiliateUrl: string): NormalizedDeal | null {
  const tier = assignDiscountTier(raw.discountPercent);
  if (!tier) return null;

  return {
    ...raw,
    affiliateUrl,
    discountTier: tier,
    slug: `${raw.network}-${raw.networkId}`,
  };
}

/**
 * Deduplicate deals by networkId+network composite key.
 */
export function deduplicateDeals(deals: NormalizedDeal[]): NormalizedDeal[] {
  const seen = new Set<string>();
  return deals.filter((d) => {
    const key = `${d.network}:${d.networkId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
