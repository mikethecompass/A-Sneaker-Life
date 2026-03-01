/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "**.impactradius-event.com" },
      { protocol: "https", hostname: "**.cj.com" },
      { protocol: "https", hostname: "**.cjsecure.com" },
      { protocol: "https", hostname: "**.cjreview.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "images.stockx.com" },
      { protocol: "https", hostname: "**.scene7.com" },
      { protocol: "https", hostname: "dks.scene7.com" },
      { protocol: "https", hostname: "**.shopify.com" },
      { protocol: "https", hostname: "**.nike.com" },
      { protocol: "https", hostname: "**.adidas.com" },
      { protocol: "https", hostname: "**.footlocker.com" },
    ],
  },
};

export default nextConfig;
