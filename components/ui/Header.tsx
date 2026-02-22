import Link from "next/link";

const NAV_LINKS = [
  { label: "Deals", href: "/deals" },
  { label: "50%+ Off", href: "/deals?tier=50" },
  { label: "30% Off", href: "/deals?tier=30" },
  { label: "Releases", href: "/releases" },
  { label: "Videos", href: "/videos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-center justify-between h-[65px]">

          {/* Wordmark */}
          <Link
            href="/"
            className="text-white text-2xl tracking-widest hover:text-gray-300 transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A SNEAKER LIFE
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile — two key links */}
          <div className="md:hidden flex items-center gap-5">
            <Link
              href="/deals"
              className="text-[13px] uppercase tracking-widest text-gray-400 hover:text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Deals
            </Link>
            <Link
              href="/releases"
              className="text-[13px] uppercase tracking-widest text-gray-400 hover:text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Releases
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
