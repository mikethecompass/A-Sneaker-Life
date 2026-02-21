export type VideoEntry = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  platform: "tiktok" | "instagram" | "youtube";
  brand: string;
  category: string;
  date: string;
  views?: string;
};

// ─── SAMPLE VIDEOS ────────────────────────────────────────────────
// Replace these with your real content. For each video:
//   thumbnail – direct image URL (TikTok/IG screenshot, YouTube thumbnail)
//   videoUrl  – the public link to the video on its platform
//
// TIP: For TikTok thumbnails, you can screenshot the video and upload
// the image to your public folder (/public/thumbnails/video-name.jpg)
// ───────────────────────────────────────────────────────────────────

export const videos: VideoEntry[] = [
  {
    id: "1",
    title: "Nike Dunk Low Unboxing",
    thumbnail: "/thumbnails/sample-1.jpg",
    videoUrl: "https://www.tiktok.com/@asneakerlife",
    platform: "tiktok",
    brand: "Nike",
    category: "Unboxing",
    date: "2025-12-15",
    views: "32K",
  },
  {
    id: "2",
    title: "Jordan 4 On-Feet Review",
    thumbnail: "/thumbnails/sample-2.jpg",
    videoUrl: "https://www.tiktok.com/@asneakerlife",
    platform: "tiktok",
    brand: "Jordan",
    category: "Review",
    date: "2025-11-28",
    views: "18K",
  },
  {
    id: "3",
    title: "New Balance 550 Haul",
    thumbnail: "/thumbnails/sample-3.jpg",
    videoUrl: "https://www.instagram.com/asneakerlife",
    platform: "instagram",
    brand: "New Balance",
    category: "Haul",
    date: "2025-11-10",
    views: "12K",
  },
  {
    id: "4",
    title: "Adidas Samba Lifestyle",
    thumbnail: "/thumbnails/sample-4.jpg",
    videoUrl: "https://www.tiktok.com/@asneakerlife",
    platform: "tiktok",
    brand: "Adidas",
    category: "Lifestyle",
    date: "2025-10-20",
    views: "45K",
  },
  {
    id: "5",
    title: "Sneaker Rotation Winter 2025",
    thumbnail: "/thumbnails/sample-5.jpg",
    videoUrl: "https://www.youtube.com/@ASneakerLife",
    platform: "youtube",
    brand: "Multi-Brand",
    category: "Haul",
    date: "2025-10-05",
    views: "28K",
  },
  {
    id: "6",
    title: "Nike Air Max 90 Ad Spot",
    thumbnail: "/thumbnails/sample-6.jpg",
    videoUrl: "https://www.tiktok.com/@asneakerlife",
    platform: "tiktok",
    brand: "Nike",
    category: "Ad",
    date: "2025-09-18",
    views: "55K",
  },
  {
    id: "7",
    title: "Jordan 1 Low x Travis Scott",
    thumbnail: "/thumbnails/sample-7.jpg",
    videoUrl: "https://www.instagram.com/asneakerlife",
    platform: "instagram",
    brand: "Jordan",
    category: "Unboxing",
    date: "2025-09-02",
    views: "67K",
  },
  {
    id: "8",
    title: "Puma Suede XL Review",
    thumbnail: "/thumbnails/sample-8.jpg",
    videoUrl: "https://www.tiktok.com/@asneakerlife",
    platform: "tiktok",
    brand: "Puma",
    category: "Review",
    date: "2025-08-15",
    views: "9K",
  },
  {
    id: "9",
    title: "Back to School Sneaker Picks",
    thumbnail: "/thumbnails/sample-9.jpg",
    videoUrl: "https://www.youtube.com/@ASneakerLife",
    platform: "youtube",
    brand: "Multi-Brand",
    category: "Lifestyle",
    date: "2025-08-01",
    views: "21K",
  },
];

export const brands = [
  "All",
  "Nike",
  "Jordan",
  "Adidas",
  "New Balance",
  "Puma",
  "Multi-Brand",
];

export const categories = [
  "All",
  "Unboxing",
  "Review",
  "Haul",
  "Lifestyle",
  "Ad",
];

export const platforms = ["All", "tiktok", "instagram", "youtube"] as const;
