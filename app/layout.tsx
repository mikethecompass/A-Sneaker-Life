import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "A Sneaker Life | Best Sneaker Deals",
    template: "%s | A Sneaker Life",
  },
  description:
    "The best sneaker deals updated daily. Nike, Adidas, Jordan, New Balance and more — filtered by 10%, 20%, 30%, and 50%+ off.",
  keywords: [
    "sneaker deals",
    "shoe sales",
    "Nike sale",
    "Adidas deals",
    "Jordan deals",
    "sneaker discounts",
    "kicks on sale",
  ],
  authors: [{ name: "A Sneaker Life" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://asneakerlife.com"),
  openGraph: {
    type: "website",
    siteName: "A Sneaker Life",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ASneakerLife",
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
