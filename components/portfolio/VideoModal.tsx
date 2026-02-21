"use client";

import { useEffect } from "react";
import type { VideoEntry } from "@/data/videos";

export function VideoModal({
  video,
  onClose,
}: {
  video: VideoEntry;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-brand-gray-900 rounded-2xl overflow-hidden max-w-sm w-full aspect-[9/16] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video info + link */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <h3 className="font-display text-white text-2xl uppercase tracking-wider mb-2">
            {video.title}
          </h3>
          <p className="text-brand-gray-400 text-sm mb-1">{video.brand} &middot; {video.category}</p>
          {video.views && (
            <p className="text-brand-gray-600 text-xs mb-8">{video.views} views</p>
          )}

          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-display
                       text-base uppercase tracking-widest px-8 py-3 rounded-xl transition-colors"
          >
            Watch on {video.platform === "tiktok" ? "TikTok" : video.platform === "instagram" ? "Instagram" : "YouTube"}
          </a>
        </div>
      </div>
    </div>
  );
}
