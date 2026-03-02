import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import type { Metadata } from "next";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Sneaker Reviews | A Sneaker Life",
  description: "Honest sneaker reviews with video, ratings, pros & cons, and where to buy links.",
};

async function getReviews() {
  return sanityClient.fetch(`*[_type == "review"] | order(publishedAt desc) {
    _id, title, slug, brand, shoeName, rating, summary, thumbnailUrl, publishedAt, retailPrice
  }`);
}

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Honest Takes</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Sneaker Reviews</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r: any) => (
            <Link key={r._id} href={`/reviews/${r.slug?.current}`} className="group bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-100 dark:border-[#222] hover:border-gray-300 dark:hover:border-[#444] hover:shadow-lg transition-all">
              <div className="relative aspect-video bg-gray-100 dark:bg-[#222] overflow-hidden">
                {r.thumbnailUrl ? (
                  <Image src={r.thumbnailUrl} alt={r.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                )}
                {r.rating && (
                  <span className="absolute top-2 right-2 bg-black/80 text-white text-xs font-black px-2 py-1 rounded">
                    {r.rating}/10
                  </span>
                )}
              </div>
              <div className="p-4">
                {r.brand && <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{r.brand}</p>}
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:underline">{r.title}</h2>
                {r.summary && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{r.summary}</p>}
                <div className="flex items-center justify-between">
                  {r.retailPrice ? <span className="text-xs font-bold text-green-600">${r.retailPrice}</span> : <span />}
                  <span className="text-xs text-gray-400">{new Date(r.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {reviews.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Reviews are being generated. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
