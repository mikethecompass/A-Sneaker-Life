import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";

export const revalidate = 300;

export const metadata = {
  title: "Upcoming Sneaker Releases | A Sneaker Life",
  description: "Full sneaker release calendar. Find release dates, retail prices, and where to buy upcoming Nike, Jordan, adidas, and New Balance drops.",
};

async function getReleases() {
  return sanityClient.fetch(`*[_type == "release"] | order(releaseDate asc) {
    _id, title, slug, brand->{name}, colorway, imageUrl,
    retailPrice, releaseDate, releaseType, gender
  }`);
}

function formatPrice(p: number) {
  return p ? `$${p}` : "TBD";
}

function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function ReleasesPage() {
  const releases = await getReleases();

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Drop Calendar</p>
          <h1 className="text-2xl font-bold">Upcoming Sneaker Releases</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {releases.map((r: any) => (
            <Link key={r._id} href={`/releases/${r.slug?.current ?? r._id}`} className="group">
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden mb-3">
                {r.imageUrl ? (
                  <Image src={r.imageUrl} alt={r.title} fill sizes="200px" className="object-contain p-2" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-[9px] text-gray-400 uppercase">No Image</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-0.5">{r.brand?.name}</p>
              <p className="text-xs font-semibold leading-tight line-clamp-2 group-hover:underline mb-1">{r.title}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400 font-bold">{formatPrice(r.retailPrice)}</span>
                <span className="text-[10px] text-gray-500">{formatDate(r.releaseDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
