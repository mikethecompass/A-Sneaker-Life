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
    <div className="flex items-center gap-2 whitespace-nowrap pb-0.5">
      <button
        onClick={() => handleClick(null)}
        className={`filter-pill ${!activeBrand ? "active" : ""}`}
      >
        All Brands
      </button>
      {brands.map((brand) => (
        <button
          key={brand._id}
          onClick={() => handleClick(brand.slug?.current ?? null)}
          className={`filter-pill ${activeBrand === brand.slug?.current ? "active" : ""}`}
        >
          {brand.name}
        </button>
      ))}
    </div>
  );
}
