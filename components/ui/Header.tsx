import Link from "next/link";

const NAV_LINKS = [
  { label: "All Deals", href: "/deals" },
  { label: "50% Off", href: "/deals?tier=50" },
  { label: "30% Off", href: "/deals?tier=30" },
  { label: "20% Off", href: "/deals?tier=20" },
  { label: "Videos", href: "/videos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-white border-b border-brand-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-[0.2em] text-brand-black hover:text-brand-gray-600 transition-colors"
          >
            A Sneaker Life
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest text-brand-gray-600 hover:text-brand-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile nav — simplified */}
          <nav className="md:hidden flex items-center gap-4">
            <Link
              href="/deals"
              className="text-xs uppercase tracking-widest text-brand-gray-600 hover:text-brand-black"
            >
              Deals
            </Link>
            <Link
              href="/videos"
              className="text-xs uppercase tracking-widest text-brand-gray-600 hover:text-brand-black"
            >
              Videos
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
