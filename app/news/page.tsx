import Link from "next/link";
import Image from "next/image";
import { sanityClient } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import type { Metadata } from "next";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Sneaker News | A Sneaker Life",
  description:
    "The latest sneaker news — releases, collabs, and industry updates from Nike, Adidas, Jordan, and more.",
};

async function getNewsArticles() {
  return sanityClient.fetch(
    `*[_type == "newsArticle" && status == "published"] | order(publishedAt desc) {
      _id, title, slug, excerpt, heroImage, brand, publishedAt
    }`
  );
}

export default async function NewsPage() {
  const articles = await getNewsArticles();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Latest Updates</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
            Sneaker News
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a: any) => (
            <Link
              key={a._id}
              href={`/news/${a.slug?.current}`}
              className="group bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-100 dark:border-[#222] hover:border-gray-300 dark:hover:border-[#444] hover:shadow-lg transition-all"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-[#222] overflow-hidden">
                {a.heroImage ? (
                  <Image
                    src={urlFor(a.heroImage).width(800).height(450).url()}
                    alt={a.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                {a.brand && (
                  <span className="inline-block text-[10px] uppercase tracking-widest text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-2 py-0.5 rounded-full mb-2">
                    {a.brand}
                  </span>
                )}
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:underline">
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{a.excerpt}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest">
                    Read More →
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No news articles yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
