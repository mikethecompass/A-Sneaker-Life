"use client";

import { useState, useMemo } from "react";
import { videos, brands, categories } from "@/data/videos";
import { VideoCard } from "./VideoCard";
import { VideoModal } from "./VideoModal";
import type { VideoEntry } from "@/data/videos";

export function VideoGrid() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      if (selectedBrand !== "All" && v.brand !== selectedBrand) return false;
      if (selectedCategory !== "All" && v.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedBrand, selectedCategory]);

  return (
    <section id="work" className="bg-brand-black py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="section-heading text-brand-gray-400">Portfolio</p>
          <h2 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wider">
            My Work
          </h2>
        </div>

        {/* Filters */}
        <div className="mb-10 space-y-4">
          {/* Brand filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {brands.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBrand(b)}
                className={`text-xs uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-colors font-display
                  ${selectedBrand === b
                    ? "bg-accent text-white border-accent"
                    : "border-white/10 text-brand-gray-400 hover:border-white/30 hover:text-white"
                  }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`text-xs uppercase tracking-[0.15em] px-4 py-2 rounded-full border transition-colors font-display
                  ${selectedCategory === c
                    ? "bg-white text-brand-black border-white"
                    : "border-white/10 text-brand-gray-400 hover:border-white/30 hover:text-white"
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Video grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => setActiveVideo(video)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-brand-gray-600 py-20 font-display text-xl uppercase tracking-wider">
            No videos match that filter
          </p>
        )}
      </div>

      {/* Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </section>
  );
}
