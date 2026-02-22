import Image from "next/image";

export interface VideoItem {
  _id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl?: string;
  description?: string;
  publishedAt?: string;
  viewCount?: number;
}

function formatViews(count?: number): string {
  if (!count) return "";
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (!videos.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-gray-400 uppercase tracking-widest">
          No videos yet — subscribe on YouTube!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <a
          key={video._id}
          href={`https://youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          {/* Thumbnail — no rounding */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden mb-3 border border-gray-200 group-hover:border-black transition-colors">
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-xs uppercase tracking-widest text-gray-400">YouTube</span>
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="w-12 h-12 bg-white flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-0 h-0 ml-1 border-t-[8px] border-b-[8px] border-l-[14px]
                                border-t-transparent border-b-transparent border-l-black" />
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold leading-snug line-clamp-2 text-black group-hover:underline mb-1">
            {video.title}
          </h3>
          {video.viewCount !== undefined && (
            <p className="text-xs text-gray-400">{formatViews(video.viewCount)}</p>
          )}
        </a>
      ))}
    </div>
  );
}
