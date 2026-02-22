import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-black text-white">
      {/* CTA bar */}
      <div className="border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-5 py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2
              className="text-3xl text-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              NEVER MISS A DROP.
            </h2>
            <p className="text-sm text-gray-400">
              Follow us on X for real-time sneaker deals and releases.
            </p>
          </div>
          <a
            href="https://twitter.com/ASneakerLife"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white text-white text-sm uppercase
                       tracking-widest px-6 py-3 hover:bg-white hover:text-black transition-colors whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            Follow on X
          </a>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p
              className="text-white text-base mb-4 tracking-wider"
              style={{ fontFamily: "var(--font-display)" }}
            >
              A SNEAKER LIFE
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Daily sneaker deals and release dates curated from top brands.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Deals</p>
            <ul className="space-y-2.5">
              {[
                { label: "All Deals", href: "/deals" },
                { label: "50%+ Off", href: "/deals?tier=50" },
                { label: "30% Off", href: "/deals?tier=30" },
                { label: "20% Off", href: "/deals?tier=20" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Explore</p>
            <ul className="space-y-2.5">
              {[
                { label: "Release Calendar", href: "/releases" },
                { label: "Videos", href: "/videos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Connect</p>
            <ul className="space-y-2.5">
              <li>
                <a href="https://twitter.com/ASneakerLife" target="_blank" rel="noopener noreferrer"
                   className="text-xs text-gray-400 hover:text-white transition-colors">
                  X / Twitter
                </a>
              </li>
              <li>
                <a href={`https://youtube.com/channel/${process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID ?? ""}`}
                   target="_blank" rel="noopener noreferrer"
                   className="text-xs text-gray-400 hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:justify-between gap-3">
          <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
            <strong className="text-gray-500">Affiliate Disclosure:</strong> A Sneaker Life participates
            in affiliate programs. We may earn a commission when you purchase through our links at no
            additional cost to you.
          </p>
          <p className="text-xs text-gray-600 shrink-0">&copy; {year} A Sneaker Life</p>
        </div>
      </div>
    </footer>
  );
}
