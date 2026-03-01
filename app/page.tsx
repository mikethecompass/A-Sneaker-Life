import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DEALS_QUERY, FEATURED_VIDEOS_QUERY, UPCOMING_RELEASES_QUERY } from "@/lib/sanity/queries";
import type { DealCardProps } from "@/components/deals/DealCard";
import type { VideoItem } from "@/components/videos/VideoGrid";
import type { ReleaseItem } from "@/components/releases/ReleaseCard";

export const revalidate = 60;

function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function daysUntil(dateStr: string): number {
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((new Date(dateStr + "T12:00:00").getTime() - today.getTime()) / 86400000);
}

async function getHomeData() {
  const [deals, videos, releases] = await Promise.all([
    sanityClient.fetch<DealCardProps[]>(ALL_DEALS_QUERY),
    sanityClient.fetch<VideoItem[]>(FEATURED_VIDEOS_QUERY),
    sanityClient.fetch<ReleaseItem[]>(UPCOMING_RELEASES_QUERY),
  ]);
  return {
    deals: deals.slice(0, 12),
    latestVideo: videos[0] ?? null,
    recentVideos: videos.slice(1, 4),
    upcomingReleases: releases.slice(0, 5),
  };
}

export default async function HomePage() {
  const { deals, latestVideo, recentVideos, upcomingReleases } = await getHomeData();

  return (
    <div className="bg-white min-h-screen text-gray-900">

      {/* YouTube Hero */}
      {latestVideo && (
        <section className="w-full">
          <div className="relative w-full max-w-3xl mx-auto" style={{ paddingBottom: "min(56.25%, 480px)" }}>
            <iframe
              src={`https://www.youtube.com/embed/${latestVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={latestVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-lg"
              style={{ border: "none" }}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold leading-tight line-clamp-1">{latestVideo.title}</h2>
            <Link href="/videos" className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap ml-6">
              All Videos →
            </Link>
          </div>
        </section>
      )}

      {/* Upcoming Releases */}
      {upcomingReleases.length > 0 && (
        <section className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs uppercase tracking-widest font-bold">Upcoming Releases</h2>
              <Link href="/releases" className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
                Full Calendar →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {upcomingReleases.map((release) => {
                const days = daysUntil(release.releaseDate);
                return (
                  <a key={release._id} href={release.stockxUrl ?? release.affiliateUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="shrink-0 w-36 group">
                    <div className="relative w-36 h-36 bg-white rounded-lg overflow-hidden mb-2">
                      {release.imageUrl ? (
                        <Image src={release.imageUrl} alt={release.title} fill sizes="144px" className="object-contain p-2" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-[9px] text-gray-500 uppercase">No Image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{release.brand?.name}</p>
                    <p className="text-xs font-semibold leading-tight line-clamp-2 group-hover:underline mb-1">{release.title}</p>
                    <div className="flex items-center gap-2">
                      {release.retailPrice && <span className="text-xs text-green-400 font-bold">{formatPrice(release.retailPrice)}</span>}
                      <span className="text-[10px] text-gray-500">{days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Deals Grid */}
      {deals.length > 0 && (
        <section className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest font-bold">Latest Deals</h2>
              <Link href="/deals" className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {deals.map((deal) => <DarkDealCard key={deal._id} deal={deal} />)}
            </div>
          </div>
        </section>
      )}

      {/* Videos Grid */}
      {recentVideos.length > 0 && (
        <section className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest font-bold">More Videos</h2>
              <Link href="/videos" className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentVideos.map((video) => (
                <a key={video._id} href={`https://youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="relative aspect-video bg-gray-900 overflow-hidden rounded-lg mb-3">
                    {video.thumbnailUrl && (
                      <Image src={video.thumbnailUrl} alt={video.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-0 h-0 ml-0.5 border-t-[7px] border-b-[7px] border-l-[12px] border-t-transparent border-b-transparent border-l-black" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:underline">{video.title}</h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function DarkDealCard({ deal }: { deal: DealCardProps }) {
  const { title, slug, brand, imageUrl, affiliateUrl, originalPrice, salePrice, discountPercent, currency = "USD" } = deal;
  return (
    <article className="group bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors">
      <Link href={`/deals/${slug.current}`} className="block relative aspect-square bg-white overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100"><span className="text-xs uppercase tracking-widest text-gray-500">No Image</span></div>
        )}
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded bg-black text-gray-900">
          {discountPercent}% off
        </span>
      </Link>
      <div className="p-3">
        {brand && <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{brand.name}</p>}
        <Link href={`/deals/${slug.current}`}>
          <h2 className="text-xs font-medium leading-snug line-clamp-2 mb-2 hover:underline text-gray-700">{title}</h2>
        </Link>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-bold text-gray-900">{formatPrice(salePrice, currency)}</span>
          <span className="text-[10px] text-gray-600 line-through">{formatPrice(originalPrice, currency)}</span>
        </div>
        <a href={affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
          className="block w-full text-center bg-white text-black text-[10px] uppercase tracking-widest py-2 rounded font-bold hover:bg-gray-200 transition-colors">
          Shop Deal
        </a>
      </div>
    </article>
  );
}
