import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanity/client";
import type { Metadata } from "next";

export const revalidate = 300;

async function getReview(slug: string) {
  return sanityClient.fetch(`*[_type == "review" && slug.current == $slug][0]`, { slug });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await getReview(params.slug);
  if (!r) return { title: "Review Not Found" };
  return {
    title: `${r.title} Review — Is It Worth It? | A Sneaker Life`,
    description: r.summary ?? `Watch the full ${r.title} review on A Sneaker Life.`,
    openGraph: { images: r.thumbnailUrl ? [{ url: r.thumbnailUrl }] : [] },
  };
}

export async function generateStaticParams() {
  const reviews = await sanityClient.fetch(`*[_type == "review"]{ slug }`);
  return reviews.map((r: any) => ({ slug: r.slug?.current })).filter((r: any) => r.slug);
}

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  const r = await getReview(params.slug);
  if (!r) notFound();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#111]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 uppercase tracking-widest mb-6 flex gap-2">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/reviews" className="hover:text-gray-900 dark:hover:text-white transition-colors">Reviews</Link>
          <span>/</span>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{r.title}</span>
        </nav>

        {r.brand && <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{r.brand}</p>}
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">{r.title}</h1>
        
        {r.rating && (
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded-full">
              <span className="text-sm font-black">{r.rating}</span>
              <span className="text-xs">/10</span>
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-widest">
              {r.rating >= 9 ? "🔥 Must Buy" : r.rating >= 7 ? "✓ Recommended" : r.rating >= 5 ? "~ Worth Considering" : "✗ Skip It"}
            </span>
          </div>
        )}

        {/* YouTube Video */}
        {r.youtubeId && (
          <div className="relative w-full rounded-xl overflow-hidden bg-black mb-8" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.youtube.com/embed/${r.youtubeId}?rel=0&modestbranding=1`}
              title={r.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review content */}
          <div className="md:col-span-2 space-y-6">
            {r.summary && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Overview</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.summary}</p>
              </div>
            )}

            {(r.pros?.length > 0 || r.cons?.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {r.pros?.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400 mb-3">Pros</h3>
                    <ul className="space-y-2">
                      {r.pros.map((pro: string, i: number) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>{pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {r.cons?.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-3">Cons</h3>
                    <ul className="space-y-2">
                      {r.cons.map((con: string, i: number) => (
                        <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✗</span>{con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {r.verdict && (
              <div className="border-l-4 border-gray-900 dark:border-white pl-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Verdict</h3>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.verdict}</p>
              </div>
            )}
          </div>

          {/* Buy links sidebar */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Where to Buy</h2>
            {r.retailPrice && (
              <p className="text-2xl font-black text-gray-900 dark:text-white mb-4">${r.retailPrice} <span className="text-sm font-normal text-gray-400">retail</span></p>
            )}
            <div className="space-y-2">
              {(r.affiliateLinks ?? []).map((link: any) => (
                <a key={link.retailer} href={link.url} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center justify-between w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs uppercase tracking-widest px-4 py-3 rounded-xl font-bold hover:opacity-80 transition-opacity">
                  <span>{link.retailer}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">#ad — Affiliate links. We may earn a commission at no extra cost to you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
