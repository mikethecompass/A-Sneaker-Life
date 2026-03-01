import Link from "next/link";

const NAV_LINKS = [
  { label: "Deals", href: "/deals" },
  { label: "Releases", href: "/releases" },
  { label: "Videos", href: "/videos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-gray-400 transition-colors">
            A Sneaker Life
          </Link>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
