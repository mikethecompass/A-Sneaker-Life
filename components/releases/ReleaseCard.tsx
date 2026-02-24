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
  resalePrice?: number;
  currency?: string;
  releaseDate: string;
  releaseTime?: string;
  releaseType?: "fcfs" | "raffle" | "snkrs" | "instore" | "online";
  gender?: string;
  affiliateUrl?: string;
  stockxUrl?: string;
  goatUrl?: string;
}

function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr + "T12:00:00") < today;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr + "T12:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatReleaseDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ReleaseRow({ title, slug, brand, colorway, sku, imageUrl, retailPrice, resalePrice, currency = "USD", releaseDate, releaseTime, affiliateUrl, stockxUrl }: ReleaseItem) {
  const released = isPast(releaseDate);
  const days = daysUntil(releaseDate);
  const url = stockxUrl ?? affiliateUrl ?? "#";

  return (
    <div className="flex items-center gap-4 sm:gap-5 py-4 border-b border-gray-100 last:border-0 group">
      <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-gray-50 border border-gray-100 rounded overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="100px" className="object-contain p-2" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-gray-300">No Image</span>
          </div>
        )}
      </a>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {brand && <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">{brand.name}</span>}
          {!released && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Upcoming</span>}
          {released && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Released</span>}
          {!released && days >= 0 && <span className="text-[11px] text-gray-500">{days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`}</span>}
        </div>

        <a href={url} target="_blank" rel="noopener noreferrer">
          <h2 className="text-base sm:text-lg font-bold leading-tight line-clamp-2 text-black group-hover:underline mb-0.5">{title}</h2>
        </a>

        <div className="flex flex-wrap gap-x-3 text-xs text-gray-400">
          {colorway && <span className="line-clamp-1">{colorway}</span>}
          {sku && <span className="hidden sm:inline">{sku}</span>}
          {releaseTime && !released && <span>{releaseTime}</span>}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1 min-w-[100px]">
        {retailPrice ? <span className="text-lg font-bold text-black">{formatPrice(retailPrice, currency)}</span> : null}
        <span className="text-sm font-semibold text-green-600">{formatReleaseDate(releaseDate)}</span>
        {resalePrice ? <span className="text-xs text-gray-400">Resale ~{formatPrice(resalePrice, currency)}</span> : null}
        <div className="mt-1">
          {stockxUrl && (
            <a href={stockxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full transition-colors whitespace-nowrap">
              StockX
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
