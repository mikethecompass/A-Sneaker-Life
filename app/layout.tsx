import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Anton, Inter } from "next/font/google";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
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

const BOTTOM_NAV = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21H15v-6H9v6H3V9.75z" />
      </svg>
    ),
  },
  {
    label: "Deals",
    href: "/deals",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-4-4 4-4m6 8l4-4-4-4" />
      </svg>
    ),
  },
  {
    label: "Releases",
    href: "/releases",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Videos",
    href: "/videos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black border-t border-white/10
                        flex items-center justify-around h-16 px-2">
          {BOTTOM_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 text-white/50 hover:text-accent
                         transition-colors min-w-0 flex-1 py-1"
            >
              {item.icon}
              <span className="text-[9px] uppercase tracking-wider leading-none">{item.label}</span>
            </Link>
          ))}
        </nav>
      </body>
    </html>
  );
}
