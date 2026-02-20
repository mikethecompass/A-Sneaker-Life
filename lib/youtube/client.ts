/**
 * YouTube Data API v3 client
 *
 * Fetches the channel's latest videos and their statistics.
 * We sync these into Sanity so the frontend can display them
 * without hitting the YouTube API on every page load.
 *
 * Docs: https://developers.google.com/youtube/v3/docs
 */

const YT_BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideoItem {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  tags: string[];
}

interface YTSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
    };
  };
}

interface YTVideoStatistics {
  viewCount?: string;
  likeCount?: string;
}

interface YTVideoItem {
  id: string;
  snippet: {
    tags?: string[];
  };
  statistics: YTVideoStatistics;
}

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY");
  return key;
}

function channelId(): string {
  const id = process.env.YOUTUBE_CHANNEL_ID;
  if (!id) throw new Error("Missing YOUTUBE_CHANNEL_ID");
  return id;
}

/**
 * Fetch the latest N videos from the channel's uploads.
 */
export async function fetchLatestVideos(maxResults = 20): Promise<YouTubeVideoItem[]> {
  // Step 1: Search for channel uploads (ordered by date)
  const searchParams = new URLSearchParams({
    part: "id,snippet",
    channelId: channelId(),
    order: "date",
    type: "video",
    maxResults: String(maxResults),
    key: apiKey(),
  });

  const searchRes = await fetch(
    `${YT_BASE_URL}/search?${searchParams}`,
    { next: { revalidate: 3600 } }
  );

  if (!searchRes.ok) {
    const body = await searchRes.text();
    throw new Error(`YouTube search error ${searchRes.status}: ${body}`);
  }

  const searchData = await searchRes.json();
  const searchItems: YTSearchItem[] = searchData.items ?? [];

  if (!searchItems.length) return [];

  // Step 2: Fetch statistics for all video IDs in one request
  const videoIds = searchItems.map((item) => item.id.videoId).join(",");

  const statsParams = new URLSearchParams({
    part: "statistics,snippet",
    id: videoIds,
    key: apiKey(),
  });

  const statsRes = await fetch(
    `${YT_BASE_URL}/videos?${statsParams}`,
    { next: { revalidate: 3600 } }
  );

  if (!statsRes.ok) {
    const body = await statsRes.text();
    throw new Error(`YouTube videos error ${statsRes.status}: ${body}`);
  }

  const statsData = await statsRes.json();
  const statsMap = new Map<string, YTVideoItem>(
    (statsData.items ?? []).map((v: YTVideoItem) => [v.id, v])
  );

  // Step 3: Merge search results with statistics
  return searchItems.map((item): YouTubeVideoItem => {
    const stats = statsMap.get(item.id.videoId);
    const thumbnail =
      item.snippet.thumbnails.maxres?.url ??
      item.snippet.thumbnails.high?.url ??
      item.snippet.thumbnails.medium?.url ??
      `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`;

    return {
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: thumbnail,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(stats?.statistics?.viewCount ?? "0", 10),
      likeCount: parseInt(stats?.statistics?.likeCount ?? "0", 10),
      tags: stats?.snippet?.tags ?? [],
    };
  });
}
