import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16">
      {/* Never miss a deal CTA */}
      <div className="bg-[#111827] py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white mb-2">
              Never miss a deal.
            </h2>
            <p className="text-sm text-white/60">
              Follow us on X for real-time sneaker deals dropped daily.
            </p>
          </div>
          <a
            href="https://twitter.com/ASneakerLife"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm font-bold
                       px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            Follow on X
          </a>
        </div>
      </div>

      {/* Links + disclosure */}
      <div className="border-t border-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Brand */}
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] mb-3">
                A Sneaker Life
              </p>
              <p className="text-xs text-brand-gray-400 leading-relaxed max-w-xs">
                Daily sneaker deals curated from top brands. The best discounts, no noise.
              </p>
            </div>

            {/* Shop */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-gray-400 mb-3">Shop</p>
              <ul className="space-y-2">
                {[
                  { label: "All Deals", href: "/deals" },
                  { label: "50%+ Off", href: "/deals?tier=50" },
                  { label: "30% Off", href: "/deals?tier=30" },
                  { label: "20% Off", href: "/deals?tier=20" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-brand-gray-600 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-gray-400 mb-3">Connect</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/ASneakerLife"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-gray-600 hover:text-accent transition-colors"
                  >
                    X / Twitter
                  </a>
                </li>
                <li>
                  <a
                    href={`https://youtube.com/channel/${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-gray-600 hover:text-accent transition-colors"
                  >
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Affiliate disclosure */}
          <div className="border-t border-brand-gray-100 pt-6">
            <p className="text-xs text-brand-gray-400 leading-relaxed max-w-2xl">
              <strong className="text-brand-gray-600">Affiliate Disclosure:</strong> A Sneaker Life
              participates in affiliate programs including Impact Radius and CJ Affiliate. We may
              earn a commission when you purchase through our links at no additional cost to you.
              All deals are independently selected.
            </p>
            <p className="text-xs text-brand-gray-400 mt-3">
              &copy; {year} A Sneaker Life. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
