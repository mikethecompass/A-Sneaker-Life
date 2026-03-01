"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Deals", href: "/deals" },
  { label: "Releases", href: "/releases" },
  { label: "Videos", href: "/videos" },
];

export function Header() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/deals?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#111] border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-6">
          <Link href="/" className="text-base font-black uppercase tracking-[0.15em] text-white hover:text-gray-300 transition-colors shrink-0">
            A Sneaker Life
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden sm:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sneakers..."
                className="w-full bg-[#222] border border-[#333] rounded-full text-xs text-white placeholder-gray-500 px-4 py-2.5 pr-10 focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </div>
          </form>
          <nav className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-white transition-colors hidden sm:block">
                {link.label}
              </Link>
            ))}
            <button onClick={() => setOpen(!open)} className="sm:hidden text-gray-400 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </nav>
        </div>
        {open && (
          <form onSubmit={handleSearch} className="pb-4 sm:hidden">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sneakers..." autoFocus className="w-full bg-[#222] border border-[#333] rounded-full text-xs text-white placeholder-gray-500 px-4 py-2.5 focus:outline-none focus:border-gray-500" />
          </form>
        )}
      </div>
    </header>
  );
}
