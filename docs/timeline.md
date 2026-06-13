# Project Timeline

## 2026-06-10 — Initial Setup & Core Features (`main`)

**Branch:** `main`

### What Was Built
- **Project scaffold** — Next.js 16 App Router, Prisma 5 + Neon PostgreSQL, Tailwind CSS design system
- **Council list page** (`/councils`) — filterable by region with search
- **Council detail page** (`/councils/[slug]`) — overview tab, events tab, facilities tab
- **Events calendar** (`/events`) — filter by council, category, date range
- **Council compare page** (`/compare`) — side-by-side council stats
- **Interactive Mapbox homepage** — Victoria map with region colouring, clickable council polygons
- **API routes** — `/api/councils`, `/api/events` with filtering and pagination
- **Event scrapers** — `mylibrary.digital` (8 Melbourne councils), Humanitix (Wyndham), Eventbrite (Merri-bek)
- **GitHub Actions cron** — daily scrape at 1am AEST
- **ABS G01 demographic data** — import script, council demographics

### Key Problems Solved
- Mapbox council click navigation
- Council region classification (metro / interface / regional)
- ABS LGA code format mismatch fixed during data import

---

## 2026-06-12 — Victoria Expansion (`feat/victoria-expansion`)

**Branch:** `feat/victoria-expansion` (branched from `main`)

### What Was Built
- **Extended schema** — `Library`, `Subscriber`, `CouncilGuide`, `CouncilDemographics` models
- **Libraries page** (`/libraries`) — nearby search, open/closed status, favourites (localStorage)
- **School zone checker** (`/schools`) — address autocomplete, point-in-polygon lookup for VIC zones
- **Map enhancements** — library pins (📚), university pins (🎓), animated toggles, search bar
- **Council detail** — ABS demographics card, new-resident guide tab
- **Email subscription** — subscribe/unsubscribe flow with Resend
- **Event scrapers** — cron endpoint, event category classification, nav links for libraries/schools
- **More VIC councils seeded** — Geelong, Ballarat, Bendigo, Casey, Wyndham, Frankston with library branches and LGA boundaries
- **Events page improvements** — keyword search, library branch counts
- **AI Search page** (`/search`) — Claude Haiku powered, markdown rendering, web search via tool use, result caching, two-column layout
- **Councils search dropdown** — autocomplete after 3 chars
- **CSV export** — exportable council list with sources footer
- **My Events page** (`/my-events`) — favourited libraries, upcoming events, subscribe form

### Key Problems Solved
- Open/closed status from `hoursJson` (parsed `mon`–`sun` keys, `HH:MM-HH:MM` format)
- Timezone-aware event date formatting
- Mapbox click → internal council page vs external map

---

## 2026-06-13 — National Expansion (`feat/national-expansion`)

**Branch:** `feat/national-expansion` (branched from `feat/victoria-expansion`)

### Morning: National Map & Multi-State Data
- **National expansion** — all 8 states/territories on map; NSW LGA GeoJSON boundaries (ABS 2021)
- **Multi-state councils** — `state` field added to `Council` model; 20 NSW councils seeded with library links
- **`StateTabs` component** — reusable state filter tabs used across councils, events, libraries pages
- **`NonVicCouncilCard`** — external-link cards for non-VIC councils
- **Councils page** — state tabs, NSW region filter, non-VIC simplified layout
- **Libraries page** — state tabs, non-VIC notice with official library links
- **Events page** — state tabs, non-VIC notice
- **Map page** — fly-to-state, multi-state GeoJSON, all-state view
- **Map fixes** — VIC population/area data, map click opens internal council page, region stats summary

### Afternoon: Feature Polish
- **Library open/closed filter** — segmented button (All / 🟢 Open now / 🔴 Closed) on libraries list; groups with zero matches hidden
- **"Hours unknown" label** — council library detail shows "Hours unknown" instead of blank when no `hoursJson`
- **States overview page** (`/states`) — card view + sortable table toggle; columns: state, population, area, councils, libraries; footer totals row; clickable counts linking to filtered lists
- **Clear search on state switch** — library search input + results cleared when switching state tabs

### Afternoon: School Zone Map & All-State Support
- **School zone map** (`SchoolZoneMap.tsx`) — Mapbox GL JS; blue/green polygon fills; popups on click; fits bounds to zones; 📍 address pin
- **All-state school zone search** — VIC/NSW/QLD/SA/WA/TAS/NT/ACT tabs with state-aware geocoding
- **Per-state postcode range banner** — amber info panel showing postcode range + examples per state
- **Fixed broken school URLs** — QLD (`schoolzones.eq.edu.au`), SA (`education.sa.gov.au/...`), TAS (`education.tas.gov.au/...`)
- **Non-VIC map pin** — after searching any non-VIC state, 📍 pin still renders even with no zone polygons

### Evening: NSW / QLD / SA School Zone Data
- **Data download & conversion** — NSW Shapefile, QLD KML, SA Shapefile → normalized GeoJSON
  - NSW: 1,657 primary + 443 secondary zones (~27MB total)
  - QLD: 1,032 primary + 274 secondary zones (~32MB total)
  - SA: 84 primary + 46 secondary zones (~1.6MB total)
- **Conversion script** (`/tmp/convert-school-zones.py`) — `pyshp` for Shapefiles, `lxml` for KML; outputs normalized schema: `{ School_Name, ENTITY_CODE, zoneType }`
- **Multi-state zone API** (`/api/schools/zone`) — lazy per-state GeoJSON loading + module-level `Map` cache; returns `{ schools, suburb, zones, hasZoneData }`
- **Zone legend fix** — `hasPrimary`/`hasSecondary` checks prevent showing legend for states with no data

### Evening: My Events Cleanup & Events Debugging
- **Removed "Find Nearby Libraries"** from My Events page — removed `NearbyLibrary` interface, `getLibraryOpenStatus` function, `searchNearby` function, all related state variables, and the full JSX section
- **Events DB empty** — investigated: scrapers hadn't run. Ran `npx tsx scripts/run-scraper.ts`, got 396 events from kingston, melton, moonee-valley, maroondah
  - Failures: monash/bayside/stonnington/hume (Cloudflare protection), Humanitix (400 Bad Request), Eventbrite (400 — `page_size` param changed)

### Key Problems Solved
- `ogr2ogr`/GDAL binary linking error on macOS → switched to `pyshp` + `lxml` Python libraries
- QLD KML namespace: Google KML (`http://earth.google.com/kml/2.1`) not OGC KML
- TypeScript error: `Set<string>` does not support index access — fixed with `.has()`
- Prisma `select` + `include` conflict — removed `select`, used full `include`
- Large zone files (10–21MB) loaded lazily and cached; ~60MB total never loaded at once

---

## Branch Comparison

| | `main` | `feat/victoria-expansion` | `feat/national-expansion` |
|---|---|---|---|
| **Scope** | Melbourne metro VIC | All of Victoria | All 8 states/territories |
| **Councils** | ~10 Melbourne | ~20 VIC (metro + regional) | ~40 (VIC + 20 NSW + others) |
| **Map** | Melbourne zoom | Full Victoria | All-Australia with state fly-to |
| **Libraries** | Not present | VIC with nearby search, open hours | Multi-state tabs |
| **Schools** | Not present | VIC zone checker (text only) | All-state tabs, map with polygons, NSW/QLD/SA data |
| **Events** | VIC only | VIC only | VIC + non-VIC notice |
| **States page** | Not present | Not present | Card + sortable table |
| **AI Search** | Not present | Claude Haiku, markdown output | Same |
| **Data volume** | ~10 councils | ~20 councils, VIC zone GeoJSON | +NSW/QLD/SA school GeoJSON (~60MB) |

### Key Architectural Differences
- **`feat/national-expansion`** added `state` field to `Council` model requiring a DB migration
- **`feat/national-expansion`** uses lazy module-level `Map` caching for large GeoJSON files (prevents loading 60MB at startup)
- **`feat/victoria-expansion`** introduced the `LibraryBranch` and `hoursJson` pattern, reused in national branch
- Both expansion branches share the `StateTabs` component pattern introduced in `feat/national-expansion`
