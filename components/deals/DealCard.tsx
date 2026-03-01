import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { DiscountTier } from "@/lib/affiliates/types";

export interface DealCardProps {
  _id: string;
  title: string;
  slug: { current: string };
  brand?: { name: string };
  imageUrl?: string;
  affiliateUrl: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  discountTier: DiscountTier;
  currency?: string;
  expiresAt?: string | null;
}

function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function DealCard({
  title,
  slug,
  brand,
  imageUrl,
  affiliateUrl,
  originalPrice,
  salePrice,
  discountPercent,
  discountTier,
  currency = "USD",
  expiresAt,
}: DealCardProps) {
  const savings = originalPrice - salePrice;
  const isHot = discountTier === 50;
  const expiresLabel = expiresAt
    ? `Expires ${formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}`
    : null;

  return (
    <article className="deal-card group">
      {/* Image */}
      <Link href={`/deals/${slug.current}`} className="block relative aspect-square bg-brand-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest text-brand-gray-400">
              No Image
            </span>
          </div>
        )}

        {/* Discount badge */}
        <span className={`discount-badge ${isHot ? "tier-50" : ""}`}>
          {discountPercent}% off
        </span>
      </Link>

      {/* Content */}
      <div className="p-4">
        {brand && (
          <p className="text-xs uppercase tracking-widest text-brand-gray-400 mb-1">
            {brand.name}
          </p>
        )}

        <Link href={`/deals/${slug.current}`}>
          <h2 className="text-sm font-medium leading-snug line-clamp-2 mb-3 hover:underline">
            {title}
          </h2>
        </Link>

        {/* Pricing row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold">
            {formatPrice(salePrice, currency)}
          </span>
          <span className="text-xs text-brand-gray-400 line-through">
            {formatPrice(originalPrice, currency)}
          </span>
          <span className="text-xs text-brand-gray-600 ml-auto">
            Save {formatPrice(savings, currency)}
          </span>
        </div>

        {/* Expiry warning */}
        {expiresLabel && (
          <p className="text-xs text-brand-gray-400 mb-3">{expiresLabel}</p>
        )}

        {/* CTA */}
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full text-center bg-brand-black text-brand-white text-xs uppercase
                     tracking-widest py-2.5 hover:bg-brand-gray-800 transition-colors"
          aria-label={`Shop ${title} — ${formatPrice(salePrice, currency)}`}
        >
          Shop Deal
        </a>

        <p className="text-center text-[10px] text-brand-gray-400 mt-1.5">#ad</p>
      </div>
    </article>
  );
}
