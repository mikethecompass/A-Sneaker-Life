import { Suspense } from "react";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DEALS_QUERY, FEATURED_VIDEOS_QUERY } from "@/lib/sanity/queries";
import { DealFeed } from "@/components/deals/DealFeed";
import { VideoGrid } from "@/components/videos/VideoGrid";
import type { DealCardProps } from "@/components/deals/DealCard";
import type { VideoItem } from "@/components/videos/VideoGrid";

export const revalidate = 300;

async function getHomeData() {
  const [deals, videos] = await Promise.all([
    sanityClient.fetch<DealCardProps[]>(ALL_DEALS_QUERY).catch(() => [] as DealCardProps[]),
    sanityClient.fetch<VideoItem[]>(FEATURED_VIDEOS_QUERY).catch(() => [] as VideoItem[]),
  ]);

  return {
    featuredDeals: deals.slice(0, 8),
    hotDeals: deals.filter((d) => d.discountTier === 50).slice(0, 4),
    videos: videos.slice(0, 3),
  };
}

const STATS = [
  { value: "125K+", label: "Followers" },
  { value: "Daily", label: "Updated" },
  { value: "Free", label: "No Signup" },
];

export default async function HomePage() {
  const { featuredDeals, hotDeals, videos } = await getHomeData();

  return (
    <>
      {/* Hero — dark */}
      <section className="bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-4">
            Updated Daily
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none mb-4 text-white">
            Sneaker Deals.
            <br />
            <span className="text-accent">Every Day.</span>
          </h1>
          <p className="text-sm text-white/60 max-w-md mb-8">
            Curated discounts from Nike, Adidas, Jordan, New Balance and more —
            filtered by discount tier so you always find the best value.
          </p>

          {/* Social proof */}
          <div className="flex flex-wrap gap-6 mb-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/50 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/deals?tier=50"
              className="bg-accent text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl
                         hover:bg-accent-dark transition-colors"
            >
              50%+ Off Deals
            </Link>
            <Link
              href="/deals"
              className="border border-white/20 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl
                         hover:bg-white/10 transition-colors"
            >
              All Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Hot deals (50%+ off) */}
      {hotDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-heading">Fire Deals</p>
              <h2 className="text-lg font-bold tracking-tight">50%+ Off Right Now</h2>
            </div>
            <Link
              href="/deals?tier=50"
              className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>
          <Suspense fallback={<DealFeedSkeleton count={4} />}>
            <DealFeed deals={hotDeals} />
          </Suspense>
        </section>
      )}

      {/* Featured deals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-brand-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-heading">Today&apos;s Picks</p>
            <h2 className="text-lg font-bold tracking-tight">Featured Deals</h2>
          </div>
          <Link
            href="/deals"
            className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-accent transition-colors"
          >
            View all →
          </Link>
        </div>
        <Suspense fallback={<DealFeedSkeleton count={8} />}>
          <DealFeed
            deals={featuredDeals}
            emptyMessage="Deals are loading. Check back soon!"
          />
        </Suspense>
      </section>

      {/* Latest videos */}
      {videos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-brand-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="section-heading">YouTube</p>
              <h2 className="text-lg font-bold tracking-tight">Latest Videos</h2>
            </div>
            <Link
              href="/videos"
              className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-accent transition-colors"
            >
              View all →
            </Link>
          </div>
          <VideoGrid videos={videos} />
        </section>
      )}
    </>
  );
}

function DealFeedSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-brand-white rounded-2xl border border-brand-gray-100 p-4 animate-pulse">
          <div className="aspect-square bg-brand-gray-100 rounded-xl mb-4" />
          <div className="h-3 bg-brand-gray-100 rounded mb-2" />
          <div className="h-3 bg-brand-gray-100 rounded w-2/3 mb-4" />
          <div className="h-10 bg-brand-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
