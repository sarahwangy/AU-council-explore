# Melbourne Council Explorer

An open-source web app that aggregates Melbourne's 31 local councils — library events, population stats, and community facilities — into a single searchable, filterable platform.

**Live demo:** [deploy URL here]

## Features

- **Interactive map** — 31 Melbourne council areas colored by region (Mapbox GL JS)
- **Council pages** — population stats from ABS 2021 Census, upcoming library events, area demographics
- **Events calendar** — aggregated library events from 4+ councils, filterable by council, category, and date
- **Compare** — side-by-side comparison of any 2–3 councils across population, libraries, and activity

## Data sources

| Data | Source | Update frequency |
|---|---|---|
| Council boundaries | ABS ASGS Ed 3 2021 | One-time |
| Population stats | ABS 2021 Census (G01) | 5-yearly |
| Library events (mylibrary.digital) | Kingston, Melton, Moonee Valley, Maroondah | Daily (GitHub Actions) |
| Library events (Humanitix) | Wyndham | Daily |
| Library events (Eventbrite) | Merri-bek | Daily (requires token) |

## Local setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (free tier: [Neon](https://neon.tech))
- Mapbox account (free tier) for the map

### Steps

```bash
git clone https://github.com/your-username/melbourne-council-explorer
cd melbourne-council-explorer
npm install

# Copy env template and fill in your values
cp .env.local.example .env.local
# DATABASE_URL=postgresql://...
# NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
# EVENTBRITE_TOKEN=xxx (optional)

# Run DB migrations
npx prisma migrate dev

# Seed councils
npx tsx scripts/seed-councils.ts

# Import ABS population data (download CSV first — see scripts/import-abs.ts for instructions)
npx tsx scripts/import-abs.ts

# Run scrapers to populate events
npx tsx scripts/run-scraper.ts

# Start dev server
npm run dev
```

### GeoJSON boundaries

Download LGA boundaries for the homepage map:
1. Go to [ABS Digital Boundary Files](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files)
2. Download "Local Government Areas ASGS Ed 3 2021 GDA2020" → GeoJSON
3. Filter to Victorian LGAs, add `lga_slug` property matching council IDs (e.g. `monash`, `glen-eira`)
4. Save as `public/melbourne-lgas.geojson`

## Tech stack

- **Framework:** Next.js 14 App Router + TypeScript
- **Database:** PostgreSQL via [Neon](https://neon.tech) + Prisma ORM
- **Map:** Mapbox GL JS
- **Styling:** Tailwind CSS v4
- **Scrapers:** Node.js + Cheerio (HTML), Eventbrite API, Humanitix API
- **Automation:** GitHub Actions daily cron

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set environment variables: `DATABASE_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `EVENTBRITE_TOKEN`
4. Add `DATABASE_URL` and `EVENTBRITE_TOKEN` as GitHub secrets for the daily scrape Action

## Roadmap

- Custom HTML scrapers for Boroondara, Maribyrnong, Brimbank
- Headless browser scrapers for Frankston, Hobsons Bay, Darebin, Yarra (Cloudflare-protected)
- OSM Parks/facilities data
- AI Chat (RAG) — natural language queries over council data
- Multi-language support (Chinese/Vietnamese)
- Email subscriptions for weekly activity digests
- Expand to Sydney, Brisbane, Adelaide, Perth
