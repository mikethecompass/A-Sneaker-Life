# A Sneaker Life

**asneakerlife.com** — Daily sneaker deals, curated automatically.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| CMS | Sanity v3 (embedded Studio at `/studio`) |
| Hosting | Vercel |
| Affiliate | Impact Radius + CJ Affiliate |
| Social | RobinReach → X/Twitter |
| Video | YouTube Data API v3 |
| Links | Switchy branded short links |
| Styles | Tailwind CSS — black & white minimal |

---

## Project Structure

```
app/
  page.tsx                    # Homepage — featured + hot deals
  deals/
    page.tsx                  # All deals with tier filter
    [slug]/page.tsx           # Individual deal page
  videos/page.tsx             # YouTube video grid
  studio/[[...index]]/        # Sanity Studio (embedded)
  api/
    deals/
      route.ts                # GET /api/deals — public deal feed
      sync/route.ts           # POST /api/deals/sync — cron: fetch + upsert deals
    twitter/
      post/route.ts           # POST /api/twitter/post — cron: tweet deals
    youtube/
      sync/route.ts           # POST /api/youtube/sync — cron: sync videos

lib/
  affiliates/
    impact.ts                 # Impact Radius API client
    cj.ts                     # CJ Affiliate API client
    types.ts                  # Shared types (RawDeal, NormalizedDeal, etc.)
  social/
    robinreach.ts             # RobinReach Twitter posting
  youtube/
    client.ts                 # YouTube Data API v3 client
  sanity/
    client.ts                 # Read + write Sanity clients
    queries.ts                # GROQ query strings
  utils/
    discount.ts               # Tier assignment, sorting, deduplication
    switchy.ts                # Switchy short link creation

sanity/
  schemaTypes/
    brand.ts                  # Brand document schema
    deal.ts                   # Deal document schema
    video.ts                  # Video document schema
    index.ts

components/
  deals/
    DealCard.tsx              # Individual deal card
    DealFeed.tsx              # Responsive deal grid
    DealFilters.tsx           # Tier filter pills (client component)
  videos/
    VideoGrid.tsx             # YouTube video grid
  ui/
    Header.tsx                # Sticky nav header
    Footer.tsx                # Footer with affiliate disclosure
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `IMPACT_API_KEY` | Impact Radius API key |
| `IMPACT_ACCOUNT_SID` | Impact Radius Account SID |
| `CJ_API_KEY` | CJ Affiliate bearer token |
| `CJ_WEBSITE_ID` | Your CJ website/property ID |
| `ROBINREACH_API_KEY` | RobinReach API key |
| `ROBINREACH_ACCOUNT_ID` | RobinReach account ID |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `YOUTUBE_CHANNEL_ID` | Your YouTube channel ID |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (production) |
| `SANITY_API_TOKEN` | Sanity write token |
| `CRON_SECRET` | Secret for Vercel cron auth |
| `SWITCHY_API_KEY` | Switchy API key |
| `SWITCHY_DOMAIN` | Your Switchy branded domain |

---

## Cron Schedule (vercel.json)

| Route | Schedule | Purpose |
|-------|----------|---------|
| `/api/deals/sync` | Every 4 hours | Fetch + upsert deals from Impact + CJ |
| `/api/twitter/post` | Every 6 hours | Post top deals to X via RobinReach |
| `/api/youtube/sync` | Every 12 hours | Sync latest YouTube videos |

Cron requests are authenticated via the `x-cron-secret` header matching `CRON_SECRET`.

---

## Discount Tiers

| Tier | Label | Badge Color |
|------|-------|------------|
| 10 | 10% Off | Black |
| 20 | 20% Off | Black |
| 30 | 30% Off | Black |
| 50 | 50%+ Off | Red |

---

## Sanity Studio

The studio is embedded at `/studio`. Access is available to anyone with the URL — add Sanity's auth settings to restrict to specific users.

Content types:
- **Deals** — Auto-populated by the sync cron; your wife can edit titles, add descriptions, flag featured deals
- **Videos** — Auto-populated from YouTube; can be featured for homepage
- **Brands** — Manage brand logos and metadata; mark brands as featured

---

## FTC Compliance

Every deal card shows `#ad` below the CTA button. Every tweet includes `#ad #affiliate`. The footer contains a full affiliate disclosure. This covers FTC requirements for affiliate marketing disclosure.

---

## Development

```bash
npm install
npm run dev          # Next.js dev server on :3000
npm run sanity       # Sanity Studio standalone (optional)
```

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import into Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy — crons activate automatically on Vercel Pro+
