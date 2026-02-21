import type { Metadata } from "next";
import { Suspense } from "react";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_RELEASES_QUERY, ALL_BRANDS_QUERY } from "@/lib/sanity/queries";
import { ReleaseCard } from "@/components/releases/ReleaseCard";
import type { ReleaseItem } from "@/components/releases/ReleaseCard";
import { ReleaseBrandFilter } from "@/components/releases/ReleaseBrandFilter";

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: "Sneaker Release Calendar",
  description:
    "Upcoming sneaker releases from Nike, Jordan, Adidas, New Balance and more. Dates, prices, and where to buy.",
};

interface Brand {
  _id: string;
  name: string;
  slug?: { current: string };
}

interface ReleasesPageProps {
  searchParams: { brand?: string };
}

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00"); // noon to avoid TZ shift
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(releases: ReleaseItem[]): [string, ReleaseItem[]][] {
  const map = new Map<string, ReleaseItem[]>();
  for (const r of releases) {
    const key = r.releaseDate;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries());
}

function isUpcoming(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) >= today;
}

export default async function ReleasesPage({ searchParams }: ReleasesPageProps) {
  const [allReleases, brands] = await Promise.all([
    sanityClient.fetch<ReleaseItem[]>(ALL_RELEASES_QUERY).catch(() => [] as ReleaseItem[]),
    sanityClient.fetch<Brand[]>(ALL_BRANDS_QUERY).catch(() => [] as Brand[]),
  ]);

  // Filter by brand slug if provided
  const activeBrand = searchParams.brand ?? null;
  const filtered = activeBrand
    ? allReleases.filter((r) => r.brand?.slug?.current === activeBrand)
    : allReleases;

  const upcoming = filtered.filter((r) => isUpcoming(r.releaseDate));
  const past = filtered.filter((r) => !isUpcoming(r.releaseDate)).slice(-12).reverse();

  const upcomingGroups = groupByDate(upcoming);
  const pastGroups = groupByDate(past);

  // Only show brands that have at least one release
  const brandsWithReleases = brands.filter((b) =>
    allReleases.some((r) => r.brand?._id === b._id)
  );

  return (
    <>
      {/* Dark hero */}
      <section className="bg-[#111827]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-xs uppercase tracking-[0.25em] text-accent mb-3"
             style={{ fontFamily: "var(--font-display)" }}>
            Sneaker Calendar
          </p>
          <h1 className="text-5xl md:text-6xl text-white mb-2">
            Release Calendar
          </h1>
          <p className="text-sm text-white/60">
            Upcoming drops from Nike, Jordan, Adidas, New Balance and more.
          </p>
        </div>
      </section>

      {/* Brand filters */}
      <div className="border-b border-brand-gray-100 bg-white sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
          <Suspense>
            <ReleaseBrandFilter brands={brandsWithReleases} activeBrand={activeBrand} />
          </Suspense>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm text-brand-gray-400 uppercase tracking-widest">
              No releases found. Check back soon!
            </p>
          </div>
        )}

        {/* Upcoming */}
        {upcomingGroups.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl mb-8 text-brand-black">Upcoming Drops</h2>
            {upcomingGroups.map(([date, releases]) => (
              <div key={date} className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl text-brand-black">{formatDateHeading(date)}</h3>
                  <div className="flex-1 h-px bg-brand-gray-100" />
                  <span className="text-xs text-brand-gray-400 uppercase tracking-widest">
                    {releases.length} drop{releases.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {releases.map((r) => (
                    <ReleaseCard key={r._id} {...r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently released */}
        {pastGroups.length > 0 && (
          <div>
            <h2 className="text-3xl mb-8 text-brand-gray-600">Recently Released</h2>
            {pastGroups.map(([date, releases]) => (
              <div key={date} className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl text-brand-gray-500">{formatDateHeading(date)}</h3>
                  <div className="flex-1 h-px bg-brand-gray-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {releases.map((r) => (
                    <ReleaseCard key={r._id} {...r} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
