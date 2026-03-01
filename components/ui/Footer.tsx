import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#111] border-t border-[#222] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.15em] mb-3 text-white">A Sneaker Life</p>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">Daily sneaker deals curated from top brands. The best discounts, no noise.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Shop</p>
            <ul className="space-y-2">
              {[{ label: "All Deals", href: "/deals" }, { label: "Upcoming Releases", href: "/releases" }, { label: "Videos", href: "/videos" }].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-gray-400 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Connect</p>
            <ul className="space-y-2">
              <li><a href="https://twitter.com/ASneakerLife" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">X / Twitter</a></li>
              <li><a href="https://youtube.com/@ASneakerLife" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#222] pt-6">
          <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
            <strong className="text-gray-500">Affiliate Disclosure:</strong> A Sneaker Life participates in affiliate programs including Impact Radius and CJ Affiliate. We may earn a commission when you purchase through our links at no additional cost to you.
          </p>
          <p className="text-xs text-gray-600 mt-3">&copy; {year} A Sneaker Life. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
