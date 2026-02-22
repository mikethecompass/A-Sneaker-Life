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

const RELEASE_TYPE_LABELS: Record<string, string> = {
  fcfs:    "FCFS",
  raffle:  "Raffle",
  snkrs:   "SNKRS",
  instore: "In-Store",
  online:  "Online",
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
  const typeLabel = releaseType ? RELEASE_TYPE_LABELS[releaseType] : null;

  return (
    <div className="flex items-center gap-4 sm:gap-5 py-4 border-b border-gray-100 last:border-0 group">

      {/* Thumbnail */}
      <Link
        href={`/releases/${slug.current}`}
        className="shrink-0 relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-gray-50 border border-gray-200 overflow-hidden"
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="100px" className="object-contain p-2" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-gray-300">No Image</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          {brand && (
            <span className="text-[11px] uppercase tracking-widest text-gray-400">
              {brand.name}
            </span>
          )}
          {typeLabel && (
            <span
              className="text-[10px] uppercase tracking-widest border border-gray-300 text-gray-500 px-1.5 py-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {typeLabel}
            </span>
          )}
          {released && (
            <span
              className="text-[10px] uppercase tracking-widest bg-gray-100 text-gray-400 px-1.5 py-0.5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Released
            </span>
          )}
        </div>

        <Link href={`/releases/${slug.current}`}>
          <h2
            className="text-base sm:text-lg font-bold leading-tight line-clamp-2 text-black group-hover:underline mb-0.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        </Link>

        <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
          {colorway && <span className="line-clamp-1">{colorway}</span>}
          {sku && <span className="hidden sm:inline">{sku}</span>}
          {releaseTime && !released && <span>{releaseTime}</span>}
        </div>
      </div>

      {/* Price + CTA */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        {retailPrice ? (
          <span className="text-lg font-bold text-black">
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
                className="text-[11px] uppercase tracking-widest border border-gray-300 text-gray-600 px-3 py-1.5 hover:border-black hover:text-black transition-colors whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)" }}
              >
                StockX
              </a>
            )}
            {affiliateUrl && (
              <a
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="text-[11px] uppercase tracking-widest bg-black text-white px-3 py-1.5 hover:bg-gray-800 transition-colors whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)" }}
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
            className="text-[11px] uppercase tracking-widest border border-black text-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Notify Me
          </a>
        ) : null}
      </div>
    </div>
  );
}
