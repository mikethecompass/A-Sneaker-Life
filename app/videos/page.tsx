import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_VIDEOS_QUERY } from "@/lib/sanity/queries";
import { VideoGrid } from "@/components/videos/VideoGrid";
import type { VideoItem } from "@/components/videos/VideoGrid";

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
  title: "Sneaker Videos",
  description:
    "Watch the latest sneaker reviews, unboxings, and deal alerts from A Sneaker Life on YouTube.",
};

export default async function VideosPage() {
  const videos = await sanityClient.fetch<VideoItem[]>(ALL_VIDEOS_QUERY);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="section-heading">YouTube</p>
      <h1 className="text-2xl font-bold tracking-tight mb-8">Latest Videos</h1>

      <VideoGrid videos={videos} />

      {/* Subscribe CTA */}
      <div className="mt-16 border border-brand-gray-100 p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-brand-gray-400 mb-3">
          Stay Updated
        </p>
        <h2 className="text-lg font-bold mb-3">Subscribe on YouTube</h2>
        <p className="text-sm text-brand-gray-600 max-w-sm mx-auto mb-6">
          New sneaker reviews, unboxings, and deal breakdowns every week.
        </p>
        <a
          href={`https://youtube.com/channel/${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-brand-black text-brand-white text-xs uppercase
                     tracking-widest px-8 py-3 hover:bg-brand-gray-800 transition-colors"
        >
          Subscribe
        </a>
      </div>
    </div>
  );
}
