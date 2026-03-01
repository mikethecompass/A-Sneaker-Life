import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityClient } from "@/lib/sanity/client";
import { DEAL_BY_SLUG_QUERY, ALL_DEALS_QUERY } from "@/lib/sanity/queries";
import type { DealCardProps } from "@/components/deals/DealCard";
import { DealFeed } from "@/components/deals/DealFeed";
import type { DiscountTier } from "@/lib/affiliates/types";

export const revalidate = 300;

interface DealDetail extends DealCardProps {
  description?: string;
  sku?: string;
  colorway?: string;
  gender?: string;
  sizes?: string[];
  categories?: string[];
  network?: string;
}

interface DealPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  const deal = await sanityClient.fetch<DealDetail | null>(DEAL_BY_SLUG_QUERY, {
    slug: params.slug,
  });
  if (!deal) return { title: "Deal Not Found" };

  return {
    title: `${deal.discountPercent}% Off: ${deal.title}`,
    description:
      deal.description ||
      `${deal.brand?.name ?? ""} ${deal.title} now ${deal.discountPercent}% off — was $${deal.originalPrice}, now $${deal.salePrice}.`,
    openGraph: {
      images: deal.imageUrl ? [{ url: deal.imageUrl }] : [],
    },
  };
}

export async function generateStaticParams() {
  const deals = await sanityClient.fetch<{ slug: { current: string } }[]>(
    `*[_type == "deal"]{ slug }`
  );
  return deals.map((d) => ({ slug: d.slug.current }));
}

export default async function DealPage({ params }: DealPageProps) {
  const [deal, allDeals] = await Promise.all([
    sanityClient.fetch<DealDetail | null>(DEAL_BY_SLUG_QUERY, { slug: params.slug }),
    sanityClient.fetch<DealCardProps[]>(ALL_DEALS_QUERY),
  ]);

  if (!deal) notFound();

  const savings = deal.originalPrice - deal.salePrice;
  const related = allDeals
    .filter(
      (d) =>
        d._id !== deal._id &&
        (d.brand?.name === deal.brand?.name || d.discountTier === deal.discountTier)
    )
    .slice(0, 4);

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: deal?.currency ?? "USD",
    }).format(amount);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 bg-white min-h-screen text-gray-900">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 uppercase tracking-widest mb-8 flex gap-2">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/deals" className="hover:text-gray-900 transition-colors">Deals</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{deal.title}</span>
      </nav>

      {/* Main deal layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 border border-gray-200">
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-gray-500">
                No Image Available
              </span>
            </div>
          )}

          {/* Tier badge */}
          <span className={`discount-badge ${deal.discountTier === 50 ? "tier-50" : ""}`}>
            {deal.discountPercent}% off
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {deal.brand && (
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              {deal.brand.name}
            </p>
          )}

          <h1 className="text-xl sm:text-2xl font-bold leading-snug mb-6">{deal.title}</h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-3xl font-bold">{formatPrice(deal.salePrice)}</span>
            <span className="text-base text-gray-500 line-through">
              {formatPrice(deal.originalPrice)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            You save {formatPrice(savings)} ({deal.discountPercent}% off)
          </p>

          {/* Metadata pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {deal.sku && (
              <span className="text-xs border border-gray-200 px-3 py-1 text-gray-500">
                SKU: {deal.sku}
              </span>
            )}
            {deal.colorway && (
              <span className="text-xs border border-gray-200 px-3 py-1 text-gray-500">
                {deal.colorway}
              </span>
            )}
            {deal.gender && (
              <span className="text-xs border border-gray-200 px-3 py-1 text-gray-500 capitalize">
                {deal.gender}
              </span>
            )}
          </div>

          {/* Available sizes */}
          {deal.sizes && deal.sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                Available Sizes
              </p>
              <div className="flex flex-wrap gap-2">
                {deal.sizes.map((size) => (
                  <span
                    key={size}
                    className="text-xs border border-gray-200 px-2.5 py-1 text-gray-500"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expiry */}
          {deal.expiresAt && (
            <p className="text-xs text-gray-500 mb-6">
              Deal expires: {new Date(deal.expiresAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}

          {/* CTA */}
          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block w-full text-center bg-white text-black text-xs uppercase
                       tracking-widest py-4 hover:bg-gray-200 transition-colors mb-2"
          >
            Shop Deal — {formatPrice(deal.salePrice)}
          </a>

          {/* FTC Disclosure */}
          <p className="text-xs text-gray-500 text-center">
            #ad — Affiliate link. We may earn a commission at no extra cost to you.
          </p>

          {/* Description */}
          {deal.description && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
                Description
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {deal.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related deals */}
      {related.length > 0 && (
        <section>
          <div className="border-t border-gray-200 pt-10 mb-6">
            <p className="section-heading">More Like This</p>
            <h2 className="text-lg font-bold tracking-tight">Related Deals</h2>
          </div>
          <DealFeed deals={related} />
        </section>
      )}
    </div>
  );
}
