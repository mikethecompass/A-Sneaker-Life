import type { Metadata } from "next";
import "./globals.css";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `${profile.name} | UGC Creator Portfolio`,
  description: profile.tagline,
  keywords: [
    "UGC creator",
    "user generated content",
    "sneaker content creator",
    "TikTok creator",
    "brand partnerships",
    "vertical video",
    "product reviews",
    "unboxing videos",
  ],
  authors: [{ name: profile.name }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ugc-portfolio-lyart.vercel.app"
  ),
  openGraph: {
    type: "website",
    siteName: `${profile.name} — UGC`,
    locale: "en_US",
    title: `${profile.name} | UGC Creator`,
    description: profile.tagline,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-black">
        <main className="flex-1">{children}</main>
        <PortfolioFooter />
      </body>
    </html>
  );
}
