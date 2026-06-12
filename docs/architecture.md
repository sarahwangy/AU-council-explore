# Australia Council Explorer — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Map /   │  │ Councils │  │  Events  │  │   My Events      │   │
│  │  page.tsx│  │ list     │  │ /events  │  │  (localStorage)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTP / Next.js RSC
┌─────────────────────────────▼───────────────────────────────────────┐
│                    NEXT.JS 16 APP (Vercel)                          │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  App Router  (app/)                                        │    │
│  │  ┌──────────┐ ┌───────────────┐ ┌──────────┐ ┌─────────┐  │    │
│  │  │ /        │ │ /councils     │ │ /events  │ │/compare │  │    │
│  │  │ Map page │ │ [slug]/page   │ │ page.tsx │ │ page    │  │    │
│  │  │ (client) │ │ (RSC)         │ │ (RSC)    │ │ (RSC)   │  │    │
│  │  └──────────┘ └───────────────┘ └──────────┘ └─────────┘  │    │
│  │                                                            │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │  API Routes  (app/api/)                             │   │    │
│  │  │  GET /api/events   — list + filter events           │   │    │
│  │  │  GET /api/councils — council list with event counts │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────┐   ┌───────────────────────────────────────┐    │
│  │  next-intl     │   │  Prisma ORM (lib/prisma.ts)           │    │
│  │  EN / ZH i18n  │   │  Council · Event · CouncilStats       │    │
│  │  cookie-based  │   │  ScrapeLog                            │    │
│  └────────────────┘   └────────────────┬──────────────────────┘    │
└───────────────────────────────────────┬┴───────────────────────────┘
                                        │ PostgreSQL (TLS)
┌───────────────────────────────────────▼───────────────────────────┐
│                  NEON POSTGRESQL  (ap-southeast-2)                 │
│                                                                    │
│  councils       — 31 Melbourne LGAs, slug, region, population     │
│  events         — title, startAt, venue, source, councilId        │
│  council_stats  — age groups (G04), gender (G01), medianAge       │
│  scrape_logs    — per-run status, count, errors                   │
└────────────────────────────────────────────────────────────────────┘
```

## Data Pipeline

```
ABS 2021 Census (CSV)          Event Platforms
┌─────────────────────┐        ┌────────────────────────────────────┐
│ G01 — Gender/Pop    │        │ mylibrary.digital  (8 councils)    │
│ G04 — Age groups    │        │   4 via fetch · 4 via Playwright   │
└────────┬────────────┘        │ Humanitix API      (wyndham)       │
         │ scripts/            │ Eventbrite API     (merri-bek)     │
         │ import-abs.ts       └────────────┬───────────────────────┘
         │ import-abs-g04.ts                │ scripts/run-scraper.ts
         ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Neon PostgreSQL                             │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Components

```
AppNav (server)
  └── LocaleSwitcher (client) — writes locale cookie

Map page (client)
  └── Mapbox GL — GeoJSON LGA boundaries → coloured by region
      └── public/melbourne-lgas.geojson (31 features, lga_slug prop)

Council Detail (RSC)
  ├── FavoriteButton (client) — localStorage toggle
  ├── Demographics bar charts (age groups, gender)
  └── Events tab → /api/events?council=slug

My Events (client)
  ├── useFavorites hook — reads localStorage
  └── fetch /api/events?councils=id1,id2,...
```

## Key Tech Decisions

| Concern | Choice | Reason |
|---|---|---|
| Database | Neon PostgreSQL (free tier) | Serverless-friendly, no cold start issues |
| ORM | Prisma 5 | Type-safe, good Next.js integration |
| Map | Mapbox GL JS | Best free-tier offering for Australia |
| i18n | next-intl (cookie mode) | No URL restructuring needed |
| Favorites | localStorage | No auth required for MVP |
| Scraping | fetch + Playwright fallback | Cloudflare bypass for 4 CF-protected sites |
| Styling | Tailwind v4 | CSS-variable based theming |

## LGA Code Reference

ABS 2021 DataPack uses **ASGS Edition 3** codes (NOT 2016 Edition 2).  
All 31 Melbourne metro LGA codes verified against ABS community profiles.  
Example: `LGA24600` = Melbourne CBD, `LGA25250` = Merri-bek (formerly Moreland).

## Phases

- **Phase 1** ✅ Melbourne 31 councils, events, demographics, map, favorites, i18n
- **Phase 2** Ballarat + Bendigo (3 more scrapers)
- **Phase 3** Geelong
- **Phase 4** All Victoria (~80 LGAs)
- **Phase 5** NSW + QLD
- **Phase 6** Sydney metro
- **Phase 7** Adelaide, Perth, Brisbane
- **Phase 8** All 127 Australian councils
