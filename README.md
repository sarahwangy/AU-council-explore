# AU Council Explorer 🗺️

An open-source web app that aggregates local council data across **all of Australia** — Melbourne, Sydney, and every state — into a single searchable, interactive platform.

**Live demo:** [https://au-council-explore.vercel.app](https://au-council-explore.vercel.app) · **GitHub:** [sarahwangy/AU-council-explore](https://github.com/sarahwangy/AU-council-explore)

---

## Why I Built This

Moving to a new city, I wanted to know: which council area should I live in? Which suburbs have good childcare, libraries, parks? What's the median house price? What languages do people speak there?

Every council has its own website in a different format, and the ABS data is buried in spreadsheets. I wanted one platform to explore any Australian council — browse community events, compare demographics, and understand what life is actually like in each area.

---

## What You Can Explore

### Community Events & Services
- **Library events** — upcoming events from councils across Australia (storytime, workshops, exhibitions)
- **Childcare & playgroups** — local services for families
- **Hard rubbish collection** — scheduled dates by council
- **Hospitals & health facilities** — nearby health services by area

### Council Demographics (ABS 2021 Census)
- **Population** — total residents, growth rate, population density
- **Area size** — land area in km²
- **Education levels** — percentage with university degrees, vocational qualifications
- **Languages spoken** — top languages in the area (English, Mandarin, Vietnamese, etc.)
- **Median house price** — property market data by council

### Map & Compare
- **Interactive Australia-wide map** — all councils coloured by state/region (Mapbox GL JS)
- **Council pages** — deep-dive into any council: stats, events, facilities
- **Compare view** — side-by-side comparison of 2–3 councils across any dimension
- **Search & filter** — find councils by name, state, population size, or demographic feature

---

## Architecture

```mermaid
flowchart TD
    A[GitHub Actions<br/>daily cron] -->|scrape events| B[Library APIs<br/>mylibrary.digital · Humanitix · Eventbrite]
    A -->|scrape services| C[Childcare · Playgroups<br/>Hard Rubbish · Hospitals]
    D[ABS 2021 Census<br/>population · education<br/>language · area size] --> E
    E[Property data<br/>median house prices] --> F
    B --> F[(PostgreSQL<br/>Prisma)]
    C --> F
    D --> F
    F --> G[Next.js<br/>server components]
    G --> H[Mapbox GL<br/>Australia-wide map]
    G --> I[Council pages<br/>demographics + events]
    G --> J[Compare view<br/>side-by-side councils]
```

---

## Data Sources

| Data | Source | Update frequency |
|---|---|---|
| Council boundaries | ABS ASGS Ed 3 2021 | One-time |
| Population, area, education, language | ABS 2021 Census (G01, G09, G14) | 5-yearly |
| Median house prices | Property market data | Periodic |
| Library events (mylibrary.digital) | Kingston, Melton, Moonee Valley, Maroondah | Daily |
| Library events (Humanitix) | Wyndham | Daily |
| Library events (Eventbrite) | Merri-bek | Daily |
| Childcare & playgroups | State government directories | Weekly |
| Hard rubbish collection | Council websites | As published |
| Hospitals & health facilities | Health department data | Periodic |

---

## Coverage

- **Victoria** — all 79 LGAs including Melbourne metro and regional councils
- **New South Wales** — Sydney metro and regional councils
- **All states** — expanding to full national coverage

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 App Router + TypeScript |
| **Database** | PostgreSQL ([Neon](https://neon.tech)) + Prisma ORM |
| **Map** | Mapbox GL JS |
| **Styling** | Tailwind CSS v4 |
| **Scrapers** | Node.js + Cheerio, Eventbrite API, Humanitix API |
| **Automation** | GitHub Actions daily cron |
| **Deployment** | Vercel |

---

## Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (free tier: [Neon](https://neon.tech))
- Mapbox account (free tier)

### Steps

```bash
git clone https://github.com/sarahwangy/AU-council-explore
cd AU-council-explore
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

# Import ABS population data
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
3. Save as `public/australia-lgas.geojson`

---

## Roadmap

- [ ] Custom scrapers for remaining Melbourne councils (Boroondara, Frankston, Darebin, Yarra)
- [ ] Full NSW and QLD council coverage
- [ ] AI Chat (RAG) — natural language queries: "which council near Sydney has the most childcare?"
- [ ] Email subscriptions for weekly local event digests
- [ ] Multi-language support (Chinese, Vietnamese)
- [ ] Mobile-optimised council card view
