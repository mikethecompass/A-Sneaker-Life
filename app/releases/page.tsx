import type { Metadata } from "next";
import { Suspense } from "react";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_RELEASES_QUERY, ALL_BRANDS_QUERY } from "@/lib/sanity/queries";
import { ReleaseRow } from "@/components/releases/ReleaseCard";
import type { ReleaseItem } from "@/components/releases/ReleaseCard";
import { ReleaseBrandFilter } from "@/components/releases/ReleaseBrandFilter";

export const revalidate = 3600;

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
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateStr + "T12:00:00");
  return {
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
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
  return new Date(dateStr + "T12:00:00") >= today;
}

export default async function ReleasesPage({ searchParams }: ReleasesPageProps) {
  const [allReleases, brands] = await Promise.all([
    sanityClient.fetch<ReleaseItem[]>(ALL_RELEASES_QUERY).catch(() => [] as ReleaseItem[]),
    sanityClient.fetch<Brand[]>(ALL_BRANDS_QUERY).catch(() => [] as Brand[]),
  ]);

  const activeBrand = searchParams.brand ?? null;
  const filtered = activeBrand
    ? allReleases.filter((r) => r.brand?.slug?.current === activeBrand)
    : allReleases;

  const upcoming = filtered.filter((r) => isUpcoming(r.releaseDate));
  const past = filtered.filter((r) => !isUpcoming(r.releaseDate)).slice(-20).reverse();

  const upcomingGroups = groupByDate(upcoming);
  const pastGroups = groupByDate(past);

  const brandsWithReleases = brands.filter((b) =>
    allReleases.some((r) => r.brand?._id === b._id)
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-5 pt-10 pb-6">
          <h1
            className="text-5xl sm:text-6xl text-black mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            RELEASE CALENDAR
          </h1>
          <p className="text-sm text-gray-500">
            Upcoming drops from Nike, Jordan, Adidas, New Balance and more
          </p>
        </div>
      </div>

      {/* Brand filter bar */}
      <div className="border-b border-gray-200 bg-white sticky top-14 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 overflow-x-auto">
          <Suspense>
            <ReleaseBrandFilter brands={brandsWithReleases} activeBrand={activeBrand} />
          </Suspense>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-widest">
              No releases found — check back soon
            </p>
          </div>
        )}

        {/* Upcoming */}
        {upcomingGroups.length > 0 && (
          <section className="mb-12">
            <h2
              className="text-xs uppercase tracking-widest text-gray-400 mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Upcoming Drops
            </h2>
            {upcomingGroups.map(([date, releases]) => {
              const { day, month, weekday } = formatDateShort(date);
              return (
                <div key={date} className="mb-8">
                  {/* Date header */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl text-black"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {month} {day}
                      </span>
                      <span className="text-sm text-gray-400 uppercase tracking-widest"
                            style={{ fontFamily: "var(--font-display)" }}>
                        {weekday}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 uppercase tracking-widest"
                          style={{ fontFamily: "var(--font-display)" }}>
                      {releases.length} {releases.length === 1 ? "drop" : "drops"}
                    </span>
                  </div>

                  {/* Release rows */}
                  <div className="border border-gray-200 divide-y divide-gray-100 px-4">
                    {releases.map((r) => (
                      <ReleaseRow key={r._id} {...r} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Recently released */}
        {pastGroups.length > 0 && (
          <section>
            <h2
              className="text-xs uppercase tracking-widest text-gray-400 mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Recently Released
            </h2>
            {pastGroups.map(([date, releases]) => {
              const { day, month, weekday } = formatDateShort(date);
              return (
                <div key={date} className="mb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl text-gray-400"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {month} {day}
                      </span>
                      <span className="text-sm text-gray-300 uppercase tracking-widest"
                            style={{ fontFamily: "var(--font-display)" }}>
                        {weekday}
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <div className="border border-gray-200 divide-y divide-gray-100 px-4">
                    {releases.map((r) => (
                      <ReleaseRow key={r._id} {...r} />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
