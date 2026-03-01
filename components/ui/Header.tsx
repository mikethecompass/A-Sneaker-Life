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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          <Link href="/" className="text-sm font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors shrink-0">
            A Sneaker Life
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sneakers..."
                className="w-full bg-gray-100 border border-gray-200 rounded text-xs text-gray-900 placeholder-gray-400 px-4 py-2 pr-10 focus:outline-none focus:border-gray-400 transition-colors"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </div>
          </form>
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                {link.label}
              </Link>
            ))}
            <button onClick={() => setOpen(!open)} className="sm:hidden text-gray-500 hover:text-gray-900">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </nav>
        </div>
        {open && (
          <form onSubmit={handleSearch} className="pb-3 sm:hidden">
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sneakers..." autoFocus className="w-full bg-gray-100 border border-gray-200 rounded text-xs text-gray-900 placeholder-gray-400 px-4 py-2 focus:outline-none focus:border-gray-400" />
          </form>
        )}
      </div>
    </header>
  );
}
