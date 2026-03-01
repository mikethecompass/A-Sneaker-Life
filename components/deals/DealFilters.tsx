"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DISCOUNT_TIERS, DISCOUNT_TIER_LABELS } from "@/lib/utils/discount";
import type { DiscountTier } from "@/lib/affiliates/types";

export function DealFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTier = searchParams.get("tier")
    ? (parseInt(searchParams.get("tier")!, 10) as DiscountTier)
    : null;

  function setTier(tier: DiscountTier | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tier === null || tier === currentTier) {
      params.delete("tier");
    } else {
      params.set("tier", String(tier));
    }
    router.push(`/deals?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-brand-gray-400 mr-2 hidden sm:inline">
        Filter:
      </span>

      {/* "All" pill */}
      <button
        onClick={() => setTier(null)}
        className={`filter-pill ${currentTier === null ? "active" : ""}`}
      >
        All
      </button>

      {DISCOUNT_TIERS.map((tier) => (
        <button
          key={tier}
          onClick={() => setTier(tier)}
          className={`filter-pill ${currentTier === tier ? "active" : ""}`}
        >
          {DISCOUNT_TIER_LABELS[tier]}
        </button>
      ))}
    </div>
  );
}
