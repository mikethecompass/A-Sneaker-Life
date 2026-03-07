/**
 * RobinReach API client for scheduling/posting to Twitter/X
 */

interface RobinReachPostResponse {
  status: boolean;
  post_id: number;
  post_status: string;
  message: string;
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

export function composeDealTweet(deal: TweetDealPayload): string {
  const salePrice = `$${deal.salePrice.toFixed(0)}`;
  const origPrice = `$${deal.originalPrice.toFixed(0)}`;
  const pct = deal.discountPercent;

  // Twitter counts URLs as 23 chars regardless of actual length
  const urlPlaceholderLen = 23;
  const suffix = " //Ad";
  const buyLine = "BUY HERE → ";

  // Try full format first
  const brandName = deal.brand.length > 20 ? deal.brand.substring(0, 17) + "..." : deal.brand;
  let titleName = deal.title.length > 45 ? deal.title.substring(0, 42) + "..." : deal.title;

  let headline = pct >= 40
    ? `🔥 ${pct}% OFF the ${brandName} "${titleName}"`
    : `PRICE DROP: ${pct}% OFF the ${brandName} "${titleName}"`;

  let priceLine = `Now ${salePrice} (was ${origPrice})`;
  let tweet = `${headline}\n${priceLine}\n\n${buyLine}${deal.affiliateUrl}${suffix}`;

  if (tweet.length <= 280) return tweet;

  // Try shorter title
  titleName = deal.title.length > 30 ? deal.title.substring(0, 27) + "..." : deal.title;
  headline = `${pct}% OFF: ${brandName} "${titleName}"`;
  tweet = `${headline}\n${salePrice} (was ${origPrice})\n\n${buyLine}${deal.affiliateUrl}${suffix}`;

  if (tweet.length <= 280) return tweet;

  // Minimal format
  titleName = deal.title.length > 25 ? deal.title.substring(0, 22) + "..." : deal.title;
  tweet = `${pct}% OFF ${brandName} "${titleName}"\n${salePrice}\n${deal.affiliateUrl}${suffix}`;

  if (tweet.length <= 280) return tweet;

  // Last resort — just the essentials
  tweet = `${pct}% OFF — Now ${salePrice}\n${deal.affiliateUrl}${suffix}`;
  return tweet.substring(0, 280);
}

export async function postDealToTwitter(
  deal: TweetDealPayload,
  publishTime: string
): Promise<RobinReachPostResponse> {
  const apiKey = process.env.ROBINREACH_API_KEY;
  const brandId = process.env.ROBINREACH_BRAND_ID;
  const profileId = process.env.ROBINREACH_ACCOUNT_ID;

  if (!apiKey) throw new Error("Missing ROBINREACH_API_KEY");
  if (!brandId) throw new Error("Missing ROBINREACH_BRAND_ID");
  if (!profileId) throw new Error("Missing ROBINREACH_ACCOUNT_ID");

  const tweetText = composeDealTweet(deal);

  const payload: Record<string, unknown> = {
    content: tweetText,
    social_profile_ids: [parseInt(profileId)],
    post_status: "schedule",
    publish_time: publishTime,
  };

  if (deal.imageUrl) {
    payload.media_urls = [deal.imageUrl];
  }

  const res = await fetch(
    `https://robinreach.com/api/v1/posts?api_key=${apiKey}&brand_id=${brandId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`RobinReach API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<RobinReachPostResponse>;
}

export async function batchPostDeals(
  deals: TweetDealPayload[]
): Promise<Array<{ dealId: string; success: boolean; error?: string }>> {
  const results = [];
  const now = new Date();

  for (let i = 0; i < Math.min(deals.length, 5); i++) {
    const deal = deals[i];
    const publishTime = new Date(now.getTime() + (i + 1) * 5 * 60 * 1000).toISOString();

    try {
      await postDealToTwitter(deal, publishTime);
      results.push({ dealId: deal.dealId, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ dealId: deal.dealId, success: false, error: message });
    }
  }

  return results;
}
