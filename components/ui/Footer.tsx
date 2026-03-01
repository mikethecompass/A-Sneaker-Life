import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] mb-3">
              A Sneaker Life
            </p>
            <p className="text-xs text-brand-gray-400 leading-relaxed max-w-xs">
              Daily sneaker deals curated from top brands. We keep it simple: the
              best discounts, no noise.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="section-heading">Shop</p>
            <ul className="space-y-2">
              {[
                { label: "All Deals", href: "/deals" },
                { label: "50%+ Off", href: "/deals?tier=50" },
                { label: "30% Off", href: "/deals?tier=30" },
                { label: "20% Off", href: "/deals?tier=20" },
                { label: "10% Off", href: "/deals?tier=10" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-brand-gray-600 hover:text-brand-black transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="section-heading">Connect</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com/ASneakerLife"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-gray-600 hover:text-brand-black transition-colors"
                >
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href={`https://youtube.com/channel/${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-gray-600 hover:text-brand-black transition-colors"
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
            <strong className="text-brand-gray-600">Affiliate Disclosure:</strong> A
            Sneaker Life participates in affiliate programs including Impact Radius and
            CJ Affiliate. We may earn a commission when you purchase through our
            links at no additional cost to you. All deals are independently selected.
          </p>
          <p className="text-xs text-brand-gray-400 mt-3">
            &copy; {year} A Sneaker Life. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
