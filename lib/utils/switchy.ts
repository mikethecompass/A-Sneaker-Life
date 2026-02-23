/**
 * Switchy short link creation
 *
 * Switchy (switchy.io) is a link management platform that wraps
 * affiliate URLs into branded short links for tracking and clean sharing.
 *
 * Docs: https://switchy.io/api-docs
 *
 * Each deal gets a Switchy short link using the deal's slug as the
 * custom back-half, falling back to a Switchy-generated short code.
 */

interface SwitchyCreateResponse {
  id: string;
  short_url: string;
  long_url: string;
  domain: string;
  custom_slug: string | null;
}

const SWITCHY_API_BASE = "https://app.switchy.io/api/v1";

/**
 * Create (or retrieve existing) Switchy short link for an affiliate URL.
 *
 * @param longUrl    The raw affiliate deep-link
 * @param customSlug Preferred back-half (e.g. "nike-air-max-deal-abc123")
 * @returns          The branded short URL string
 */
export async function createSwitchyLink(
  longUrl: string,
  customSlug?: string
): Promise<string> {
  const apiKey = process.env.SWITCHY_API_KEY;
  const domain = process.env.SWITCHY_DOMAIN ?? "links.asneakerlife.com";

  if (!apiKey) {
    console.warn("SWITCHY_API_KEY not set – returning raw affiliate URL");
    return longUrl;
  }

  const body: Record<string, string> = {
    long_url: longUrl,
    domain,
  };

  if (customSlug) {
    // Truncate slug to Switchy's 50-char limit
    body.custom_slug = customSlug.slice(0, 50);
  }

  let res: Response;
  try {
    res = await fetch(`${SWITCHY_API_BASE}/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Switchy network error – returning raw URL:", err);
    return longUrl;
  }

  if (!res.ok) {
    const text = await res.text();

    // 422 = slug already taken — fetch the existing link instead
    if (res.status === 422 && customSlug) {
      return (await fetchExistingLink(domain, customSlug, apiKey)) ?? longUrl;
    }

    console.error(`Switchy API error ${res.status}: ${text}`);
    return longUrl;
  }

  const data: SwitchyCreateResponse = await res.json();
  return data.short_url;
}

async function fetchExistingLink(
  domain: string,
  slug: string,
  apiKey: string
): Promise<string | null> {
  const params = new URLSearchParams({ domain, custom_slug: slug });
  const res = await fetch(`${SWITCHY_API_BASE}/links?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const link = Array.isArray(data.links) ? data.links[0] : null;
  return link?.short_url ?? null;
}

/**
 * Build a Switchy link slug from deal metadata.
 * Format: {brand}-{truncated-title}-{networkId}
 */
export function buildSwitchySlug(brand: string, title: string, networkId: string): string {
  const brandPart = brand.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
  const titlePart = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const idPart = networkId.slice(0, 8);
  return `${brandPart}-${titlePart}-${idPart}`;
}
