import { Suspense } from "react";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DEALS_QUERY, FEATURED_VIDEOS_QUERY, UPCOMING_RELEASES_QUERY } from "@/lib/sanity/queries";
import { DealFeed } from "@/components/deals/DealFeed";
import { VideoGrid } from "@/components/videos/VideoGrid";
import type { DealCardProps } from "@/components/deals/DealCard";
import type { VideoItem } from "@/components/videos/VideoGrid";

export const revalidate = 300;

interface Release {
  _id: string;
  title: string;
  slug?: { current: string };
  brand?: { name: string };
  colorway?: string;
  imageUrl?: string;
  retailPrice?: number;
  currency?: string;
  releaseDate?: string;
  releaseType?: string;
  affiliateUrl?: string;
}

async function getHomeData() {
  const today = new Date().toISOString().split("T")[0];
  const [deals, videos, releases] = await Promise.all([
    sanityClient.fetch<DealCardProps[]>(ALL_DEALS_QUERY).catch(() => [] as DealCardProps[]),
    sanityClient.fetch<VideoItem[]>(FEATURED_VIDEOS_QUERY).catch(() => [] as VideoItem[]),
    sanityClient.fetch<Release[]>(UPCOMING_RELEASES_QUERY, { from: today }).catch(() => [] as Release[]),
  ]);

  return {
    heroDeals: deals.slice(0, 5),
    latestDeals: deals.slice(0, 8),
    hotDeals: deals.filter((d) => d.discountTier === 50).slice(0, 4),
    videos: videos.slice(0, 6),
    upcomingReleases: releases.slice(0, 8),
    jordanReleases: releases.filter((r) =>
      r.brand?.name?.toLowerCase().includes("jordan") ||
      r.title?.toLowerCase().includes("jordan") ||
      r.title?.toLowerCase().includes("air jordan")
    ).slice(0, 4),
  };
}

function formatReleaseDate(dateStr?: string) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function HomePage() {
  const { heroDeals, latestDeals, hotDeals, videos, upcomingReleases, jordanReleases } =
    await getHomeData();

  const heroMain = heroDeals[0];
  const heroSide = heroDeals.slice(1, 5);

  return (
    <div className="bg-white min-h-screen">

      {/* ── Top ticker bar ── */}
      <div className="bg-black text-white text-[11px] uppercase tracking-widest text-center py-2 font-semibold">
        Sneaker Release Dates &nbsp;·&nbsp; Air Jordan Releases &nbsp;·&nbsp; Best Sneaker Deals Daily
      </div>

      {/* ── Hero editorial grid ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-5 pt-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200">

          {/* Main hero card */}
          <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-gray-200">
            {heroMain ? (
              <a
                href={heroMain.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block group"
              >
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  {heroMain.imageUrl ? (
                    <img
                      src={heroMain.imageUrl}
                      alt={heroMain.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">👟</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                      {heroMain.discountPercent}% Off
                    </span>
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                      {heroMain.brand?.name ?? "Sneaker Deal"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight mb-2 group-hover:underline" style={{ fontFamily: "var(--font-display)" }}>
                    {heroMain.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    <span className="text-black font-bold text-lg">${heroMain.salePrice}</span>
                    <span className="line-through ml-2">${heroMain.originalPrice}</span>
                  </p>
                </div>
              </a>
            ) : (
              <div className="aspect-[16/9] bg-gray-50 flex flex-col items-center justify-center gap-3 p-8">
                <span className="text-5xl">👟</span>
                <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest text-center">
                  Deals loading — check back soon
                </p>
              </div>
            )}
          </div>

          {/* Side cards stack */}
          <div className="flex flex-col divide-y divide-gray-200">
            {heroSide.length > 0 ? heroSide.map((deal) => (
              <a
                key={deal._id}
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex gap-3 p-4 group hover:bg-gray-50 transition-colors"
              >
                <div className="w-20 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
                  {deal.imageUrl ? (
                    <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="bg-black text-white text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mr-1">
                    {deal.discountPercent}% Off
                  </span>
                  <p className="text-[13px] font-bold leading-snug mt-1 line-clamp-2 group-hover:underline">
                    {deal.title}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-bold">${deal.salePrice}</span>
                    <span className="text-gray-400 line-through ml-1 text-xs">${deal.originalPrice}</span>
                  </p>
                </div>
              </a>
            )) : (
              <div className="flex-1 flex items-center justify-center p-6 text-gray-300 text-sm">
                More deals coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Air Jordan Release Dates ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Air Jordan Release Dates
          </h2>
          <Link href="/releases?brand=jordan" className="text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
            View All →
          </Link>
        </div>

        {jordanReleases.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {jordanReleases.map((release) => (
              <div key={release._id} className="border border-gray-200 group hover:border-black transition-colors">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {release.imageUrl ? (
                    <img src={release.imageUrl} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">👟</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                      {formatReleaseDate(release.releaseDate)}
                    </span>
                    {release.retailPrice && (
                      <span className="text-[11px] font-bold">${release.retailPrice}</span>
                    )}
                  </div>
                  <p className="text-[13px] font-bold leading-snug line-clamp-2">{release.title}</p>
                  {release.colorway && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{release.colorway}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-gray-200">
                <div className="aspect-square bg-gray-50 flex items-center justify-center text-gray-200 text-4xl">👟</div>
                <div className="p-3">
                  <p className="text-[12px] text-gray-300 font-semibold">Jordan Release</p>
                  <p className="text-[11px] text-gray-200 mt-1">Coming soon</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Sneaker Release Dates ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Sneaker Release Dates
          </h2>
          <Link href="/releases" className="text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
            Full Calendar →
          </Link>
        </div>

        {upcomingReleases.length > 0 ? (
          <div className="divide-y divide-gray-100 border border-gray-200">
            {upcomingReleases.map((release) => (
              <div key={release._id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* Date column */}
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                    {release.releaseDate
                      ? new Date(release.releaseDate + "T12:00:00").toLocaleDateString("en-US", { month: "short" })
                      : "TBD"}
                  </p>
                  <p className="text-2xl font-black leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    {release.releaseDate
                      ? new Date(release.releaseDate + "T12:00:00").getDate()
                      : "—"}
                  </p>
                </div>
                {/* Image */}
                <div className="w-14 h-14 flex-shrink-0 bg-gray-100 overflow-hidden">
                  {release.imageUrl ? (
                    <img src={release.imageUrl} alt={release.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">👟</div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
                    {release.brand?.name ?? "Sneaker"}
                  </p>
                  <p className="text-[14px] font-bold leading-snug truncate">{release.title}</p>
                  {release.colorway && (
                    <p className="text-[11px] text-gray-400">{release.colorway}</p>
                  )}
                </div>
                {/* Price + CTA */}
                <div className="text-right flex-shrink-0">
                  {release.retailPrice && (
                    <p className="text-[13px] font-bold">${release.retailPrice}</p>
                  )}
                  {release.releaseType && (
                    <span className="text-[9px] uppercase tracking-widest text-gray-400 border border-gray-200 px-1.5 py-0.5">
                      {release.releaseType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-[10px] text-gray-200 uppercase tracking-widest">MON</p>
                  <p className="text-2xl font-black text-gray-200" style={{ fontFamily: "var(--font-display)" }}>--</p>
                </div>
                <div className="w-14 h-14 flex-shrink-0 bg-gray-50 flex items-center justify-center text-xl text-gray-200">👟</div>
                <div className="flex-1">
                  <p className="text-[12px] text-gray-200 font-semibold">Release Calendar Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Best Deals (50%+ off) ── */}
      {hotDeals.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
                50%+ Off Deals
              </h2>
              <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                Fire
              </span>
            </div>
            <Link href="/deals?tier=50" className="text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
              View All →
            </Link>
          </div>
          <Suspense fallback={<DealFeedSkeleton count={4} />}>
            <DealFeed deals={hotDeals} />
          </Suspense>
        </section>
      )}

      {/* ── Latest Deals ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
            Latest Sneaker Deals
          </h2>
          <Link href="/deals" className="text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
            View All →
          </Link>
        </div>
        <Suspense fallback={<DealFeedSkeleton count={8} />}>
          <DealFeed
            deals={latestDeals}
            emptyMessage="Deals are loading. Check back soon!"
          />
        </Suspense>
      </section>

      {/* ── Latest Videos ── */}
      {videos.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-5 py-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
              Latest Videos
            </h2>
            <Link href="/videos" className="text-[12px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
              View All →
            </Link>
          </div>
          <VideoGrid videos={videos} />
        </section>
      )}

    </div>
  );
}

function DealFeedSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 p-4 animate-pulse">
          <div className="aspect-square bg-gray-100 mb-4" />
          <div className="h-3 bg-gray-100 rounded mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}
