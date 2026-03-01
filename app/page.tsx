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
    upcomingReleases: releases.slice(0, 6),
  };
}

export default async function HomePage() {
  const { deals, latestVideo, recentVideos, upcomingReleases } = await getHomeData();

  return (
    <div className="bg-[#fafafa] min-h-screen">

      {/* Hero - Video + Releases side by side */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Video - takes 2/3 */}
            {latestVideo && (
              <div className="lg:col-span-2">
                <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${latestVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title={latestVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                    style={{ border: "none" }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{latestVideo.title}</p>
                  <Link href="/videos" className="text-xs text-gray-400 hover:text-gray-900 transition-colors whitespace-nowrap ml-4 shrink-0">All Videos →</Link>
                </div>
              </div>
            )}

            {/* Upcoming Releases - takes 1/3 */}
            {upcomingReleases.length > 0 && (
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900">Drop Calendar</h2>
                  <Link href="/releases" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">View All →</Link>
                </div>
                <div className="space-y-3">
                  {upcomingReleases.slice(0, 4).map((release) => {
                    const days = daysUntil(release.releaseDate);
                    return (
                      <Link key={release._id} href={`/releases/${release.slug?.current ?? release._id}`} className="flex items-center gap-3 group">
                        <div className="relative w-14 h-14 bg-white rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          {release.imageUrl ? (
                            <Image src={release.imageUrl} alt={release.title} fill sizes="56px" className="object-contain p-1" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400">{release.brand?.name}</p>
                          <p className="text-xs font-semibold line-clamp-1 group-hover:underline">{release.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {release.retailPrice > 0 && <span className="text-[10px] text-green-600 font-bold">{formatPrice(release.retailPrice)}</span>}
                            <span className="text-[10px] text-gray-400">{days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      {deals.length > 0 && (
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">Latest Deals</h2>
                <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded font-bold">{deals.length}</span>
              </div>
              <Link href="/deals" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {deals.map((deal) => <DealCard key={deal._id} deal={deal} />)}
            </div>
          </div>
        </section>
      )}

      {/* More Videos */}
      {recentVideos.length > 0 && (
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">More Videos</h2>
              <Link href="/videos" className="text-xs text-gray-400 hover:text-gray-900 transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentVideos.map((video) => (
                <a key={video._id} href={`https://youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="relative aspect-video bg-gray-200 overflow-hidden rounded-xl mb-3">
                    {video.thumbnailUrl && (
                      <Image src={video.thumbnailUrl} alt={video.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <div className="w-0 h-0 ml-0.5 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-gray-900" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:underline text-gray-900">{video.title}</h3>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function DealCard({ deal }: { deal: DealCardProps }) {
  const { title, slug, brand, imageUrl, affiliateUrl, originalPrice, salePrice, discountPercent, currency = "USD" } = deal;
  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
      <Link href={`/deals/${slug.current}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain p-3 transition-transform duration-300 group-hover:scale-105" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-xs text-gray-300">No Image</span></div>
        )}
        <span className="absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-1 bg-gray-900 text-white rounded">
          {discountPercent}% off
        </span>
      </Link>
      <div className="p-3">
        {brand && <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{brand.name}</p>}
        <Link href={`/deals/${slug.current}`}>
          <h2 className="text-xs font-semibold leading-snug line-clamp-2 mb-2 hover:underline text-gray-800">{title}</h2>
        </Link>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-sm font-black text-gray-900">{formatPrice(salePrice, currency)}</span>
          <span className="text-[10px] text-gray-400 line-through">{formatPrice(originalPrice, currency)}</span>
        </div>
        <a href={affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
          className="block w-full text-center bg-gray-900 text-white text-[10px] uppercase tracking-widest py-2 rounded-lg font-bold hover:bg-black transition-colors">
          Shop Deal
        </a>
      </div>
    </article>
  );
}
