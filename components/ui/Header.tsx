"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Releases", href: "/releases" },
  { label: "Reviews", href: "/reviews" },
  { label: "Deals", href: "/deals" },
  { label: "Videos", href: "/videos" },
  { label: "Store", href: "https://shop.asneakerlife.com/collections/all", external: true },
];

const BRANDS = [
  "Nike", "Jordan", "adidas", "New Balance", "Puma", "Reebok", 
  "Converse", "Vans", "ASICS", "Under Armour", "Saucony", "Brooks"
];

export function Header() {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) { router.push(`/deals?q=${encodeURIComponent(query.trim())}`); setQuery(""); }
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#222]">
      {/* Top bar */}
      <div className="border-b border-gray-100 dark:border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold text-gray-900 dark:text-white">A Sneaker Life</span>
            <span className="text-gray-200 dark:text-[#333]">|</span>
            <Link href="/deals" className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Deals</Link>
            <Link href="/releases" className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Releases</Link>
          </div>
          <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sneakers..." className="w-full bg-gray-100 dark:bg-[#1a1a1a] rounded-full text-[11px] text-gray-900 dark:text-white placeholder-gray-400 pl-8 pr-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#333]" />
            </div>
          </form>
          <div className="flex items-center gap-3">
            <a href="https://youtube.com/@ASneakerLife" target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">YouTube</a>
            <a href="https://twitter.com/ASneakerLife" target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">X</a>
          </div>
        </div>
      </div>

      {/* Main header row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-center h-14">
          {/* Socials - left */}
          <div className="absolute left-0 flex items-center gap-3">
            <a href="https://instagram.com/asneakerlife" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://twitter.com/ASneakerLife" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://youtube.com/@ASneakerLife" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>

          {/* Logo - center */}
          <Link href="/" className="text-xl font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white hover:opacity-70 transition-opacity">
            A Sneaker Life
          </Link>

          {/* Dark mode - right */}
          <div className="absolute right-0 flex items-center gap-3">
            <button onClick={toggleDark} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Toggle dark mode">
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Category nav */}
        <nav className="flex items-center justify-center gap-8 border-t border-gray-100 dark:border-[#1a1a1a] h-10">
          {NAV_LINKS.map((link) => (
            link.external ? (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {link.label}
              </Link>
            )
          ))}
          {/* Brands dropdown */}
          <div className="relative group">
            <button className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1">
              Brands
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              {BRANDS.map((brand) => (
                <Link key={brand} href={`/deals?q=${encodeURIComponent(brand)}`}
                  className="block px-4 py-2 text-[11px] uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition-colors">
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
