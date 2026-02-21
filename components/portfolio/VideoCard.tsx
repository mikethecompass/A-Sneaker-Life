"use client";

import type { VideoEntry } from "@/data/videos";

const platformIcon: Record<string, string> = {
  tiktok: "TT",
  instagram: "IG",
  youtube: "YT",
};

export function VideoCard({
  video,
  onClick,
}: {
  video: VideoEntry;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-brand-gray-800
                 border border-white/5 hover:border-accent/40 transition-all duration-300 w-full text-left"
    >
      {/* Thumbnail or placeholder */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

      <div className="absolute inset-0 flex items-center justify-center bg-brand-gray-800">
        <span className="text-brand-gray-600 font-display text-lg uppercase tracking-wider">
          {video.brand}
        </span>
      </div>

      {/* Play button overlay */}
      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center">
          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
        <p className="text-white text-sm font-medium leading-tight mb-1 line-clamp-2">
          {video.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">{video.brand}</span>
          <div className="flex items-center gap-2">
            {video.views && (
              <span className="text-white/40 text-xs">{video.views} views</span>
            )}
          </div>
        </div>
      </div>

      {/* Platform badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
          {platformIcon[video.platform] ?? video.platform}
        </span>
      </div>

      {/* Category badge */}
      <div className="absolute top-3 right-3 z-20">
        <span className="bg-accent/80 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider">
          {video.category}
        </span>
      </div>
    </button>
  );
}
