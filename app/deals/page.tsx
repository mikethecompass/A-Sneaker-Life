import { Suspense } from "react";
import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DEALS_QUERY, DEALS_BY_TIER_QUERY } from "@/lib/sanity/queries";
import { DealFeed } from "@/components/deals/DealFeed";
import { DealFilters } from "@/components/deals/DealFilters";
import type { DealCardProps } from "@/components/deals/DealCard";
import { DISCOUNT_TIER_LABELS } from "@/lib/utils/discount";
import type { DiscountTier } from "@/lib/affiliates/types";

export const revalidate = 300;

interface DealsPageProps {
  searchParams: { tier?: string; q?: string };
}

export async function generateMetadata({ searchParams }: DealsPageProps): Promise<Metadata> {
  const tier = searchParams.tier ? parseInt(searchParams.tier, 10) as DiscountTier : null;
  const tierLabel = tier ? DISCOUNT_TIER_LABELS[tier] : null;
  return {
    title: tierLabel ? `${tierLabel} Sneaker Deals` : "All Sneaker Deals",
    description: tierLabel
      ? `Shop sneakers ${tierLabel.toLowerCase()} from Nike, Adidas, Jordan, and more.`
      : "Browse all sneaker deals — Nike, Adidas, Jordan, New Balance and more. Updated daily.",
  };
}

async function getDeals(tier: DiscountTier | null, q?: string): Promise<DealCardProps[]> {
  let deals: DealCardProps[];
  if (tier) {
    deals = await sanityClient.fetch(DEALS_BY_TIER_QUERY, { tier });
  } else {
    deals = await sanityClient.fetch(ALL_DEALS_QUERY);
  }
  if (q) {
    const lower = q.toLowerCase();
    deals = deals.filter(d =>
      d.title?.toLowerCase().includes(lower) ||
      d.brand?.name?.toLowerCase().includes(lower)
    );
  }
  return deals;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const tierParam = searchParams.tier ? parseInt(searchParams.tier, 10) : null;
  const tier = (tierParam && [10, 20, 30, 50].includes(tierParam))
    ? tierParam as DiscountTier
    : null;
  const q = searchParams.q ?? undefined;

  const deals = await getDeals(tier, q);
  const heading = q ? `Results for "${q}"` : tier ? DISCOUNT_TIER_LABELS[tier] : "All Deals";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 bg-white min-h-screen text-gray-900">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Sneaker Deals</p>
        <h1 className="text-2xl font-bold tracking-tight mb-6 text-gray-900">{heading}</h1>

        {/* Filters */}
        <Suspense>
          <DealFilters />
        </Suspense>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">
        {deals.length} deal{deals.length !== 1 ? "s" : ""} found
      </p>

      {/* Deal grid */}
      <DealFeed deals={deals} />
    </div>
  );
}
