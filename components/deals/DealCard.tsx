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
  publishedAt?: string | null;
}

function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "Just added";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: false })
      .replace("about ", "")
      .replace(" minutes", "m")
      .replace(" minute", "m")
      .replace(" hours", "h")
      .replace(" hour", "h")
      .replace(" days", "d")
      .replace(" day", "d");
  } catch {
    return "Just added";
  }
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
  publishedAt,
}: DealCardProps) {
  const savings = originalPrice - salePrice;
  const isHot = discountTier === 50;
  const timeLabel = timeAgo(publishedAt);
  const expiresLabel = expiresAt
    ? `Expires ${formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}`
    : null;

  return (
    <article className="deal-card group">
      {/* Image area */}
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
            <span className="text-xs uppercase tracking-widest text-brand-gray-400">No Image</span>
          </div>
        )}

        {/* Green discount badge */}
        <span className={`discount-badge ${isHot ? "tier-50" : ""}`}>
          {discountPercent}% OFF
        </span>

        {/* Time badge */}
        <span className="time-badge">{timeLabel}</span>
      </Link>

      {/* Content */}
      <div className="p-4">
        {brand && (
          <p className="text-[10px] uppercase tracking-widest text-brand-gray-400 mb-0.5">
            {brand.name}
          </p>
        )}

        <Link href={`/deals/${slug.current}`}>
          <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-3 hover:text-accent transition-colors">
            {title}
          </h2>
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-accent">
            {formatPrice(salePrice, currency)}
          </span>
          <span className="text-xs text-brand-gray-400 line-through">
            {formatPrice(originalPrice, currency)}
          </span>
        </div>
        <p className="text-xs text-accent font-medium mb-3">
          Save {formatPrice(savings, currency)}
        </p>

        {/* Expiry warning */}
        {expiresLabel && (
          <p className="text-xs text-brand-gray-400 mb-3">{expiresLabel}</p>
        )}

        {/* CTA */}
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="btn-green"
          aria-label={`Shop ${title} — ${formatPrice(salePrice, currency)}`}
        >
          Shop Deal →
        </a>

        <p className="text-center text-[10px] text-brand-gray-400 mt-1.5">#ad</p>
      </div>
    </article>
  );
}
