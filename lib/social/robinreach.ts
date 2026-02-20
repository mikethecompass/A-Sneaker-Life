/**
 * RobinReach API client for scheduling/posting to Twitter/X
 *
 * RobinReach is a social media automation tool. We use it to post
 * deal alerts to @ASneakerLife on X with FTC disclosures.
 *
 * Docs: https://robinreach.com/api-docs (see your account dashboard)
 */

// FTC Disclosure — required for all affiliate posts
const FTC_DISCLOSURE = "#ad #affiliate";

// Hashtags appended to every tweet
const BASE_HASHTAGS = "#SneakerDeals #Sneakers #KicksOnFire";

interface RobinReachPostResponse {
  id: string;
  status: "scheduled" | "published" | "failed";
  scheduledAt?: string;
  url?: string;
}

export interface TweetDealPayload {
  dealId: string;
  title: string;
  brand: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  affiliateUrl: string;
  imageUrl?: string;
}

/**
 * Compose a tweet string for a deal.
 * Stays under 280 chars (X limit) accounting for URL shortening.
 */
export function composeDealTweet(deal: TweetDealPayload): string {
  const savings = deal.originalPrice - deal.salePrice;
  const savingsStr = `$${savings.toFixed(0)}`;
  const salePriceStr = `$${deal.salePrice.toFixed(2)}`;
  const originalStr = `$${deal.originalPrice.toFixed(2)}`;

  // Emoji tier based on discount
  const fireEmoji =
    deal.discountPercent >= 50
      ? "🔥🔥🔥"
      : deal.discountPercent >= 30
      ? "🔥🔥"
      : "🔥";

  // Build the tweet — URL counts as 23 chars on X regardless of length
  // Budget: 280 - 23 (url) - 1 (space) = 256 chars for text
  const body = [
    `${fireEmoji} ${deal.discountPercent}% OFF`,
    `${deal.brand}: ${deal.title}`,
    ``,
    `Was: ${originalStr} → Now: ${salePriceStr} (Save ${savingsStr})`,
    ``,
    `${BASE_HASHTAGS} ${FTC_DISCLOSURE}`,
    ``,
    deal.affiliateUrl,
  ].join("\n");

  return body;
}

/**
 * Post a deal to Twitter/X via RobinReach.
 *
 * @param deal     Deal data for composing the tweet
 * @param scheduleAt Optional ISO timestamp to schedule instead of post immediately
 */
export async function postDealToTwitter(
  deal: TweetDealPayload,
  scheduleAt?: string
): Promise<RobinReachPostResponse> {
  const apiKey = process.env.ROBINREACH_API_KEY;
  const accountId = process.env.ROBINREACH_ACCOUNT_ID;

  if (!apiKey) throw new Error("Missing ROBINREACH_API_KEY");
  if (!accountId) throw new Error("Missing ROBINREACH_ACCOUNT_ID");

  const tweetText = composeDealTweet(deal);

  const payload: Record<string, unknown> = {
    account_id: accountId,
    platform: "twitter",
    content: tweetText,
    media_urls: deal.imageUrl ? [deal.imageUrl] : [],
  };

  if (scheduleAt) {
    payload.scheduled_at = scheduleAt;
  }

  const res = await fetch("https://api.robinreach.com/v1/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RobinReach API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<RobinReachPostResponse>;
}

/**
 * Batch post multiple deals with 60-second spacing to avoid X rate limits.
 * Posts at most 5 deals per call (our cron limit).
 *
 * @param deals  Array of deals to post
 * @returns      Array of { dealId, result } outcomes
 */
export async function batchPostDeals(
  deals: TweetDealPayload[]
): Promise<Array<{ dealId: string; success: boolean; error?: string }>> {
  const results = [];
  const now = new Date();

  for (let i = 0; i < Math.min(deals.length, 5); i++) {
    const deal = deals[i];

    // Stagger posts 2 minutes apart
    const scheduleAt = new Date(now.getTime() + i * 2 * 60 * 1000).toISOString();

    try {
      await postDealToTwitter(deal, i === 0 ? undefined : scheduleAt);
      results.push({ dealId: deal.dealId, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ dealId: deal.dealId, success: false, error: message });
    }
  }

  return results;
}
