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
  fcfs: "FCFS",
  raffle: "Raffle",
  snkrs: "SNKRS",
  instore: "In-Store",
  online: "Online",
};

const GENDER_LABELS: Record<string, string> = {
  mens: "Men's",
  womens: "Women's",
  gs: "GS",
  unisex: "Unisex",
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
  return new Date(dateStr) < today;
}

export function ReleaseCard({
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
  const genderLabel = gender ? GENDER_LABELS[gender] : null;

  return (
    <article className="bg-white rounded-2xl border border-brand-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Image */}
      <Link href={`/releases/${slug.current}`} className="block relative aspect-square bg-brand-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-gray-100">
            <span className="text-xs uppercase tracking-widest text-brand-gray-400">No Image</span>
          </div>
        )}

        {/* Release type badge */}
        {typeLabel && (
          <span className="absolute top-3 left-3 z-10 bg-[#111827] text-white text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}>
            {typeLabel}
          </span>
        )}

        {/* Released / Coming badge */}
        <span className={`absolute top-3 right-3 z-10 text-white text-[10px] px-2 py-0.5 rounded-full
          ${released ? "bg-brand-gray-600" : "bg-accent"}`}>
          {released ? "Released" : "Upcoming"}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4">
        {brand && (
          <p className="text-[10px] uppercase tracking-widest text-brand-gray-400 mb-0.5">
            {brand.name}
          </p>
        )}

        <Link href={`/releases/${slug.current}`}>
          <h2 className="text-base font-bold leading-snug line-clamp-2 mb-1 hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.03em" }}>
            {title}
          </h2>
        </Link>

        {colorway && (
          <p className="text-xs text-brand-gray-500 mb-0.5 line-clamp-1">{colorway}</p>
        )}

        {sku && (
          <p className="text-[10px] uppercase tracking-widest text-brand-gray-400 mb-3">{sku}</p>
        )}

        {/* Price + gender row */}
        <div className="flex items-center justify-between mb-3">
          {retailPrice ? (
            <span className="text-base font-bold text-accent">
              {formatPrice(retailPrice, currency)}
            </span>
          ) : (
            <span className="text-xs text-brand-gray-400">Price TBA</span>
          )}
          {genderLabel && (
            <span className="text-[10px] uppercase tracking-widest text-brand-gray-400">
              {genderLabel}
            </span>
          )}
        </div>

        {/* Release time */}
        {releaseTime && !released && (
          <p className="text-xs text-brand-gray-500 mb-3">{releaseTime}</p>
        )}

        {/* CTA buttons */}
        {released ? (
          <div className="flex gap-2">
            {stockxUrl && (
              <a
                href={stockxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-[#111827] text-white text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-black transition-colors"
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
                className="flex-1 text-center bg-accent text-white text-xs uppercase tracking-widest py-2.5 rounded-xl hover:bg-accent-dark transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Shop
              </a>
            )}
            {!stockxUrl && !affiliateUrl && (
              <span className="w-full text-center text-xs text-brand-gray-400 py-2.5">
                Links coming soon
              </span>
            )}
          </div>
        ) : (
          affiliateUrl ? (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn-green"
            >
              Notify Me →
            </a>
          ) : (
            <div className="w-full text-center bg-accent/10 text-accent text-xs uppercase tracking-widest py-2.5 rounded-xl"
                 style={{ fontFamily: "var(--font-display)" }}>
              Coming Soon
            </div>
          )
        )}
      </div>
    </article>
  );
}
