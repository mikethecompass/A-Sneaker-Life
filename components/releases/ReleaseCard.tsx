import Image from "next/image";
import Link from "next/link";

export interface ReleaseItem {
  _id: string;
  title: string;
  slug: { current: string };
  brand?: { _id: string; name: string; slug?: { current: string } };
  colorway?: string;
  sku?: string;
  imageUrl?: string;
  retailPrice?: number;
  currency?: string;
  releaseDate: string;
  releaseTime?: string;
  releaseType?: "fcfs" | "raffle" | "snkrs" | "instore" | "online";
  gender?: string;
  affiliateUrl?: string;
  stockxUrl?: string;
  goatUrl?: string;
}

const RELEASE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  fcfs:    { label: "FCFS",     color: "bg-blue-100 text-blue-700" },
  raffle:  { label: "Raffle",   color: "bg-purple-100 text-purple-700" },
  snkrs:   { label: "SNKRS",    color: "bg-orange-100 text-orange-700" },
  instore: { label: "In-Store", color: "bg-gray-100 text-gray-600" },
  online:  { label: "Online",   color: "bg-green-100 text-green-700" },
};

function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T12:00:00") < today;
}

export function ReleaseRow({
  title,
  slug,
  brand,
  colorway,
  sku,
  imageUrl,
  retailPrice,
  currency = "USD",
  releaseDate,
  releaseTime,
  releaseType,
  gender,
  affiliateUrl,
  stockxUrl,
}: ReleaseItem) {
  const released = isPast(releaseDate);
  const typeInfo = releaseType ? RELEASE_TYPE_LABELS[releaseType] : null;

  return (
    <div className="flex items-center gap-4 sm:gap-6 py-5 border-b border-gray-100 last:border-0 group">
      {/* Thumbnail */}
      <Link
        href={`/releases/${slug.current}`}
        className="shrink-0 relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="112px"
            className="object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-gray-300">No Image</span>
          </div>
        )}
      </Link>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {brand && (
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
              {brand.name}
            </span>
          )}
          {typeInfo && (
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          )}
          {released && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
              Released
            </span>
          )}
        </div>

        <Link href={`/releases/${slug.current}`}>
          <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-2 text-gray-900 group-hover:text-accent transition-colors mb-0.5">
            {title}
          </h2>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
          {colorway && <span className="line-clamp-1">{colorway}</span>}
          {sku && <span className="hidden sm:inline">{sku}</span>}
          {gender && <span className="capitalize hidden sm:inline">{gender === "mens" ? "Men's" : gender === "womens" ? "Women's" : gender}</span>}
          {releaseTime && !released && <span>{releaseTime}</span>}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        {retailPrice ? (
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(retailPrice, currency)}
          </span>
        ) : (
          <span className="text-sm text-gray-400">TBA</span>
        )}

        {released ? (
          <div className="flex gap-2">
            {stockxUrl && (
              <a
                href={stockxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                StockX
              </a>
            )}
            {affiliateUrl && (
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors whitespace-nowrap"
              >
                Shop
              </a>
            )}
          </div>
        ) : affiliateUrl ? (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition-colors whitespace-nowrap"
          >
            Notify Me
          </a>
        ) : null}
      </div>
    </div>
  );
}
