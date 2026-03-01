import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanity/client";
import type { Metadata } from "next";

export const revalidate = 300;

const RETAILERS = [
  { label: "Foot Locker", url: (q: string) => `https://www.footlocker.com/search?query=${encodeURIComponent(q)}`, tracking: "https://footlocker.7eer.net/c/1454343/228816/3057?u=" },
  { label: "Champs Sports", url: (q: string) => `https://www.champssports.com/search?query=${encodeURIComponent(q)}`, tracking: "https://champssports.7eer.net/c/1454343/228817/3057?u=" },
  { label: "adidas", url: (q: string) => `https://www.adidas.com/us/search?q=${encodeURIComponent(q)}`, tracking: "https://adidas.7eer.net/c/1454343/376195/4270?u=" },
  { label: "New Balance", url: (q: string) => `https://www.newbalance.com/search?q=${encodeURIComponent(q)}`, tracking: null },
  { label: "StockX", url: (q: string) => `https://stockx.com/search?s=${encodeURIComponent(q)}`, tracking: null },
  { label: "GOAT", url: (q: string) => `https://www.goat.com/search?query=${encodeURIComponent(q)}`, tracking: null },
];

function getRetailerLink(retailer: typeof RETAILERS[0], query: string) {
  const dest = retailer.url(query);
  if (retailer.tracking) return retailer.tracking + encodeURIComponent(dest);
  return dest;
}

async function getRelease(slug: string) {
  return sanityClient.fetch(`*[_type == "release" && (slug.current == $slug || _id == $slug)][0] {
    _id, title, slug, brand->{name}, colorway, sku, imageUrl,
    retailPrice, resalePrice, releaseDate, releaseTime, releaseType,
    gender, affiliateUrl, stockxUrl, goatUrl
  }`, { slug });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await getRelease(params.slug);
  if (!r) return { title: "Release Not Found" };
  return {
    title: `${r.title} — Release Date, Where to Buy & More | A Sneaker Life`,
    description: `${r.title} releases on ${new Date(r.releaseDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Retail price: ${r.retailPrice ? `$${r.retailPrice}` : "TBD"}. Find out where to buy, resale prices, and more.`,
  };
}

export async function generateStaticParams() {
  const releases = await sanityClient.fetch(`*[_type == "release"]{ slug, _id }`);
  return releases.map((r: any) => ({ slug: r.slug?.current ?? r._id }));
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default async function ReleasePage({ params }: { params: { slug: string } }) {
  const r = await getRelease(params.slug);
  if (!r) notFound();

  const buyLinks = [
    r.affiliateUrl && { label: "Nike / Official", url: r.affiliateUrl },
    r.stockxUrl && { label: "StockX", url: r.stockxUrl },
    r.goatUrl && { label: "GOAT", url: r.goatUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 uppercase tracking-widest mb-8 flex gap-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/releases" className="hover:text-white transition-colors">Releases</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-[200px]">{r.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Image */}
          <div className="relative aspect-square bg-white rounded-xl overflow-hidden">
            {r.imageUrl ? (
              <Image src={r.imageUrl} alt={r.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-xs text-gray-400 uppercase">No Image</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {r.brand && <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{r.brand.name}</p>}
            <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-6">{r.title}</h1>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-xs uppercase tracking-widest text-gray-500">Release Date</span>
                <span className="text-xs font-semibold">{formatDate(r.releaseDate)}</span>
              </div>
              {r.retailPrice > 0 && (
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Retail Price</span>
                  <span className="text-xs font-semibold text-green-400">${r.retailPrice}</span>
                </div>
              )}
              {r.resalePrice > 0 && (
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Resale Price</span>
                  <span className="text-xs font-semibold text-yellow-400">${r.resalePrice}</span>
                </div>
              )}
              {r.colorway && (
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Colorway</span>
                  <span className="text-xs font-semibold">{r.colorway}</span>
                </div>
              )}
              {r.sku && (
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Style Code</span>
                  <span className="text-xs font-semibold">{r.sku}</span>
                </div>
              )}
              {r.gender && (
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Gender</span>
                  <span className="text-xs font-semibold capitalize">{r.gender}</span>
                </div>
              )}
              {r.releaseType && (
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-xs uppercase tracking-widest text-gray-500">Release Type</span>
                  <span className="text-xs font-semibold capitalize">{r.releaseType}</span>
                </div>
              )}
            </div>

            {/* Buy Links */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Where to Buy</p>
              {RETAILERS.map((retailer) => (
                <a key={retailer.label} href={getRetailerLink(retailer, r.title)} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center justify-between w-full bg-white/5 border border-white/10 text-white text-xs uppercase tracking-widest px-4 py-3 rounded font-bold hover:bg-white hover:text-black transition-colors group">
                  <span>Shop {retailer.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50 group-hover:opacity-100"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Article Content */}
        <div className="border-t border-white/10 pt-10 prose prose-invert prose-sm max-w-none">
          <h2 className="text-lg font-bold mb-4">About the {r.title}</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            The <strong className="text-white">{r.title}</strong> is set to release on <strong className="text-white">{formatDate(r.releaseDate)}</strong>
            {r.retailPrice > 0 ? ` with a retail price of $${r.retailPrice}` : ""}. 
            {r.colorway ? ` This colorway features ${r.colorway}.` : ""}
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Whether you&apos;re looking to cop at retail or find the best resale price, A Sneaker Life keeps you updated on the latest sneaker releases. 
            Check back closer to the release date for live links and updated stock availability.
          </p>
          {r.resalePrice > 0 && (
            <p className="text-gray-400 leading-relaxed mb-4">
              Current resale prices for the {r.title} are sitting around <strong className="text-yellow-400">${r.resalePrice}</strong> on the secondary market.
            </p>
          )}
          <p className="text-xs text-gray-600 mt-8">
            #ad — Links on this page may be affiliate links. We may earn a commission at no extra cost to you.
          </p>
        </div>
      </div>
    </div>
  );
}
