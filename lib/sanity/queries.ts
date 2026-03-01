import { groq } from "next-sanity";

// ─── Deal queries ──────────────────────────────────────────────────────────────

export const ALL_DEALS_QUERY = groq`
  *[_type == "deal" && !(_id in path("drafts.**"))] | order(discountPercent desc) {
    _id,
    title,
    slug,
    brand->{name, logo},
    imageUrl,
    affiliateUrl,
    originalPrice,
    salePrice,
    discountPercent,
    discountTier,
    currency,
    expiresAt,
    categories,
    network,
    networkId,
    tweetedAt,
    publishedAt
  }
`;

export const DEALS_BY_TIER_QUERY = groq`
  *[_type == "deal" && discountTier == $tier && !(_id in path("drafts.**"))]
  | order(discountPercent desc)
  [0...50] {
    _id,
    title,
    slug,
    brand->{name, logo},
    imageUrl,
    affiliateUrl,
    originalPrice,
    salePrice,
    discountPercent,
    discountTier,
    currency,
    expiresAt,
    categories,
    network,
    tweetedAt
  }
`;

export const DEAL_BY_SLUG_QUERY = groq`
  *[_type == "deal" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    description,
    brand->{name, logo, website},
    imageUrl,
    affiliateUrl,
    originalPrice,
    salePrice,
    discountPercent,
    discountTier,
    currency,
    expiresAt,
    categories,
    sku,
    colorway,
    gender,
    sizes,
    network,
    tweetedAt,
    publishedAt
  }
`;

export const UNTWEETED_DEALS_QUERY = groq`
  *[_type == "deal" && !defined(tweetedAt) && !(_id in path("drafts.**"))]
  | order(discountPercent desc)
  [0...5] {
    _id,
    title,
    brand->{name},
    affiliateUrl,
    originalPrice,
    salePrice,
    discountPercent,
    imageUrl
  }
`;

// ─── Video queries ─────────────────────────────────────────────────────────────

export const ALL_VIDEOS_QUERY = groq`
  *[_type == "video" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    description,
    publishedAt,
    viewCount,
    likeCount,
    tags
  }
`;

export const FEATURED_VIDEOS_QUERY = groq`
  *[_type == "video" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...6] {
    _id,
    title,
    youtubeId,
    thumbnailUrl,
    description,
    publishedAt,
    viewCount
  }
`;

// ─── Brand queries ─────────────────────────────────────────────────────────────

export const ALL_BRANDS_QUERY = groq`
  *[_type == "brand" && !(_id in path("drafts.**"))] | order(name asc) {
    _id,
    name,
    logo,
    website,
    featured
  }
`;


export const UPCOMING_RELEASES_QUERY = `*[_type == "release" && releaseDate >= now()] | order(releaseDate asc) {
  _id, title, slug, brand->{_id, name, slug}, colorway, sku, imageUrl,
  retailPrice, resalePrice, releaseDate, releaseTime, releaseType,
  gender, affiliateUrl, stockxUrl, goatUrl
}`;
