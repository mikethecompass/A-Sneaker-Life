import { Suspense } from "react";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DEALS_QUERY, FEATURED_VIDEOS_QUERY } from "@/lib/sanity/queries";
import { DealFeed } from "@/components/deals/DealFeed";
import { VideoGrid } from "@/components/videos/VideoGrid";
import type { DealCardProps } from "@/components/deals/DealCard";
import type { VideoItem } from "@/components/videos/VideoGrid";

export const revalidate = 300; // Revalidate every 5 minutes

async function getHomeData() {
  const [deals, videos] = await Promise.all([
    sanityClient.fetch<DealCardProps[]>(ALL_DEALS_QUERY),
    sanityClient.fetch<VideoItem[]>(FEATURED_VIDEOS_QUERY),
  ]);

  return {
    // Show the top 8 deals on homepage
    featuredDeals: deals.slice(0, 8),
    // Hottest deals (50%+ tier)
    hotDeals: deals.filter((d) => d.discountTier === 50).slice(0, 4),
    videos: videos.slice(0, 3),
  };
}

export default async function HomePage() {
  const { featuredDeals, hotDeals, videos } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <section className="border-b border-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <p className="section-heading">Daily Sneaker Deals</p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none mb-6">
            The Best
            <br />
            Sneaker Deals.
            <br />
            <span className="text-brand-gray-400">Every Day.</span>
          </h1>
          <p className="text-sm text-brand-gray-600 max-w-md mb-8">
            Curated discounts from Nike, Adidas, Jordan, New Balance and more —
            filtered by discount tier so you always find the best value.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/deals?tier=50"
              className="bg-brand-black text-brand-white text-xs uppercase tracking-widest px-6 py-3
                         hover:bg-brand-gray-800 transition-colors"
            >
              50%+ Off Deals
            </Link>
            <Link
              href="/deals"
              className="border border-brand-black text-brand-black text-xs uppercase tracking-widest px-6 py-3
                         hover:bg-brand-black hover:text-brand-white transition-colors"
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
              className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-brand-black
                         transition-colors"
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
            className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-brand-black
                       transition-colors"
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
              className="text-xs uppercase tracking-widest text-brand-gray-400 hover:text-brand-black
                         transition-colors"
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-brand-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-brand-white p-4 animate-pulse">
          <div className="aspect-square bg-brand-gray-100 mb-4" />
          <div className="h-3 bg-brand-gray-100 rounded mb-2" />
          <div className="h-3 bg-brand-gray-100 rounded w-2/3 mb-4" />
          <div className="h-8 bg-brand-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}
