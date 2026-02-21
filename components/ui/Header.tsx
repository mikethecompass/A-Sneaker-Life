import Link from "next/link";

const NAV_LINKS = [
  { label: "All Deals", href: "/deals" },
  { label: "50%+ Off", href: "/deals?tier=50" },
  { label: "30% Off", href: "/deals?tier=30" },
  { label: "20% Off", href: "/deals?tier=20" },
  { label: "Videos", href: "/videos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#111827] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-[10px] font-black uppercase leading-none">
              ASL
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              A Sneaker Life
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile — search icon placeholder */}
          <div className="md:hidden flex items-center gap-4">
            <Link
              href="/deals"
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white"
            >
              Deals
            </Link>
            <Link
              href="/videos"
              className="text-xs uppercase tracking-widest text-white/60 hover:text-white"
            >
              Videos
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
