"use client";

import { useRouter, usePathname } from "next/navigation";

interface Brand {
  _id: string;
  name: string;
  slug?: { current: string };
}

interface ReleaseBrandFilterProps {
  brands: Brand[];
  activeBrand: string | null;
}

export function ReleaseBrandFilter({ brands, activeBrand }: ReleaseBrandFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleClick(slug: string | null) {
    if (slug) {
      router.push(`${pathname}?brand=${slug}`);
    } else {
      router.push(pathname);
    }
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <button
        onClick={() => handleClick(null)}
        className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
          !activeBrand
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
        }`}
      >
        All
      </button>
      {brands.map((brand) => (
        <button
          key={brand._id}
          onClick={() => handleClick(brand.slug?.current ?? null)}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
            activeBrand === brand.slug?.current
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
          }`}
        >
          {brand.name}
        </button>
      ))}
    </div>
  );
}
