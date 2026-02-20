import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-32 text-center">
      <p className="text-xs uppercase tracking-widest text-brand-gray-400 mb-4">404</p>
      <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-sm text-brand-gray-600 mb-8">
        This deal may have expired. Check out today&apos;s active deals.
      </p>
      <Link
        href="/deals"
        className="inline-block bg-brand-black text-brand-white text-xs uppercase
                   tracking-widest px-8 py-3 hover:bg-brand-gray-800 transition-colors"
      >
        Browse All Deals
      </Link>
    </div>
  );
}
