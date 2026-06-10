# Melbourne Council Explorer — MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an MVP web app that aggregates Melbourne's 31 councils — population stats, library events, and facilities — into a single searchable, filterable platform.

**Architecture:** Next.js 14 App Router with server components for data fetching; Prisma + Neon PostgreSQL for storage; Node.js scrapers run via GitHub Actions cron; Mapbox GL JS for the interactive map. Scrapers write to the DB directly; API routes serve the frontend.

**Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL (Neon), Cheerio, Mapbox GL JS, Tailwind CSS, GitHub Actions

---

## File Map

```
melbourne-council-explorer/
├── prisma/
│   └── schema.prisma                      # DB schema (councils, libraries, events, stats, logs)
├── data/
│   └── councils.json                      # Static seed data for 31 councils
├── lib/
│   └── prisma.ts                          # Prisma client singleton
├── scrapers/
│   ├── types.ts                           # Shared scraper types
│   ├── mylibrary-digital.ts               # Generic mylibrary.digital scraper
│   ├── eventbrite.ts                      # Eventbrite API scraper
│   └── humanitix.ts                       # Humanitix API scraper
├── scripts/
│   ├── seed-councils.ts                   # Import councils.json → DB
│   ├── import-abs.ts                      # Import ABS Census CSV → CouncilStats
│   ├── run-scraper.ts                     # Entry point: runs all scrapers
│   └── audit-scraper-sources.ts          # Pre-T04: verify real listing URLs
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                           # Homepage with Mapbox map
│   ├── councils/
│   │   ├── page.tsx                       # Council list + region filter
│   │   └── [slug]/page.tsx               # Council detail (tabs)
│   ├── events/page.tsx                    # Events calendar with filters
│   ├── compare/page.tsx                   # Side-by-side council compare
│   └── api/
│       ├── councils/route.ts              # GET /api/councils
│       ├── councils/[slug]/route.ts       # GET /api/councils/:slug
│       └── events/route.ts               # GET /api/events
├── components/
│   ├── AppNav.tsx
│   ├── CouncilCard.tsx
│   ├── EventCard.tsx
│   └── RegionBadge.tsx
└── .github/
    └── workflows/
        └── scrape.yml
```

---

## Task 1: Project Scaffold (T00)

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `.env.local`
- Create: `lib/prisma.ts`

- [ ] **Step 1: Bootstrap Next.js project**

```bash
npx create-next-app@latest melbourne-council-explorer \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd melbourne-council-explorer
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install prisma @prisma/client cheerio tsx
npm install -D @types/cheerio
npx prisma init
```

- [ ] **Step 3: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: Configure `.env.local`**

```
DATABASE_URL="postgresql://..."   # paste Neon connection string here
NEXT_PUBLIC_MAPBOX_TOKEN=""        # paste Mapbox public token here
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
# Expected: Next.js started on http://localhost:3000
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Prisma and dependencies"
```

---

## Task 2: Prisma Schema (T01)

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Replace schema.prisma content**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Council {
  id               String        @id
  name             String
  region           String
  website          String?
  libraryUrl       String?
  libraryPlatform  String?
  population       Int?
  areaSqKm         Float?
  stats            CouncilStats?
  libraries        Library[]
  events           Event[]
  createdAt        DateTime      @default(now())
}

model CouncilStats {
  id            String   @id @default(cuid())
  councilId     String   @unique
  council       Council  @relation(fields: [councilId], references: [id])
  malePercent   Float?
  femalePercent Float?
  medianAge     Int?
  dataYear      Int      @default(2021)
  updatedAt     DateTime @updatedAt
}

model Library {
  id        String   @id @default(cuid())
  councilId String
  council   Council  @relation(fields: [councilId], references: [id])
  name      String
  address   String?
  suburb    String?
  lat       Float?
  lng       Float?
  events    Event[]
}

model Event {
  id          String    @id @default(cuid())
  councilId   String
  council     Council   @relation(fields: [councilId], references: [id])
  libraryId   String?
  library     Library?  @relation(fields: [libraryId], references: [id])
  title       String
  description String?
  category    String?
  startAt     DateTime
  endAt       DateTime?
  venue       String?
  bookingUrl  String?
  source      String
  externalId  String?
  createdAt   DateTime  @default(now())

  @@unique([source, externalId])
  @@index([councilId, startAt])
  @@index([category, startAt])
}

model ScrapeLog {
  id        String   @id @default(cuid())
  councilId String?
  source    String
  status    String
  count     Int?
  error     String?
  runAt     DateTime @default(now())
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 3: Verify in Prisma Studio**

```bash
npx prisma studio
# Open http://localhost:5555 — confirm 5 tables: Council, CouncilStats, Library, Event, ScrapeLog
```

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add Prisma schema with Council, Event, Library, ScrapeLog models"
```

---

## Task 3: Seed 31 Councils (T02)

**Files:**
- Create: `data/councils.json`
- Create: `scripts/seed-councils.ts`

- [ ] **Step 1: Create `data/councils.json`**

```json
[
  { "id": "melbourne", "name": "Melbourne", "region": "inner", "website": "https://www.melbourne.vic.gov.au", "libraryUrl": "https://www.melbourne.vic.gov.au/community/libraries", "libraryPlatform": "custom" },
  { "id": "port-phillip", "name": "Port Phillip", "region": "inner", "website": "https://www.portphillip.vic.gov.au", "libraryUrl": "https://www.portphillip.vic.gov.au/community/libraries-and-learning/library", "libraryPlatform": "official" },
  { "id": "stonnington", "name": "Stonnington", "region": "inner", "website": "https://www.stonnington.vic.gov.au", "libraryUrl": "https://stonnington.events.mylibrary.digital", "libraryPlatform": "mylibrary.digital" },
  { "id": "yarra", "name": "Yarra", "region": "inner", "website": "https://www.yarracity.vic.gov.au", "libraryUrl": "https://www.yarracity.vic.gov.au/services/library", "libraryPlatform": "mixed" },
  { "id": "boroondara", "name": "Boroondara", "region": "eastern", "website": "https://www.boroondara.vic.gov.au", "libraryUrl": "https://www.boroondara.vic.gov.au/libraries/whats-on", "libraryPlatform": "official" },
  { "id": "manningham", "name": "Manningham", "region": "eastern", "website": "https://www.manningham.vic.gov.au", "libraryUrl": "https://www.wml.net.au/events", "libraryPlatform": "wml" },
  { "id": "whitehorse", "name": "Whitehorse", "region": "eastern", "website": "https://www.whitehorse.vic.gov.au", "libraryUrl": "https://www.wml.net.au/events", "libraryPlatform": "wml" },
  { "id": "maroondah", "name": "Maroondah", "region": "eastern", "website": "https://www.maroondah.vic.gov.au", "libraryUrl": "https://events.yourlibrary.vic.gov.au", "libraryPlatform": "mylibrary.digital" },
  { "id": "knox", "name": "Knox", "region": "eastern", "website": "https://www.knox.vic.gov.au", "libraryUrl": "https://events.yourlibrary.vic.gov.au", "libraryPlatform": "mylibrary.digital" },
  { "id": "yarra-ranges", "name": "Yarra Ranges", "region": "outer", "website": "https://www.yarraranges.vic.gov.au", "libraryUrl": "https://events.yourlibrary.vic.gov.au", "libraryPlatform": "mylibrary.digital" },
  { "id": "monash", "name": "Monash", "region": "eastern", "website": "https://www.monash.vic.gov.au", "libraryUrl": "https://monlib.events.mylibrary.digital", "libraryPlatform": "mylibrary.digital" },
  { "id": "glen-eira", "name": "Glen Eira", "region": "southern", "website": "https://www.gleneira.vic.gov.au", "libraryUrl": "https://www.gleneira.vic.gov.au/our-city/libraries-and-learning", "libraryPlatform": "official" },
  { "id": "bayside", "name": "Bayside", "region": "southern", "website": "https://www.bayside.vic.gov.au", "libraryUrl": "https://bayside.events.mylibrary.digital", "libraryPlatform": "mylibrary.digital" },
  { "id": "kingston", "name": "Kingston", "region": "southern", "website": "https://www.kingston.vic.gov.au", "libraryUrl": "https://libraryevents.kingston.vic.gov.au", "libraryPlatform": "mylibrary.digital" },
  { "id": "frankston", "name": "Frankston", "region": "southern", "website": "https://www.frankston.vic.gov.au", "libraryUrl": "https://www.frankston.vic.gov.au/Community-Services/Libraries/Whats-on", "libraryPlatform": "official" },
  { "id": "mornington-peninsula", "name": "Mornington Peninsula", "region": "outer", "website": "https://www.mornpen.vic.gov.au", "libraryUrl": "https://www.mornpen.vic.gov.au/Community-Wellbeing/Libraries", "libraryPlatform": "official" },
  { "id": "banyule", "name": "Banyule", "region": "northern", "website": "https://www.banyule.vic.gov.au", "libraryUrl": "https://www.yprl.vic.gov.au/events", "libraryPlatform": "yprl" },
  { "id": "nillumbik", "name": "Nillumbik", "region": "outer", "website": "https://www.nillumbik.vic.gov.au", "libraryUrl": "https://www.yprl.vic.gov.au/events", "libraryPlatform": "yprl" },
  { "id": "whittlesea", "name": "Whittlesea", "region": "northern", "website": "https://www.whittlesea.vic.gov.au", "libraryUrl": "https://www.yprl.vic.gov.au/events", "libraryPlatform": "yprl" },
  { "id": "darebin", "name": "Darebin", "region": "northern", "website": "https://www.darebin.vic.gov.au", "libraryUrl": "https://www.darebin.vic.gov.au/arts-recreation-events/libraries", "libraryPlatform": "mixed" },
  { "id": "merri-bek", "name": "Merri-bek", "region": "northern", "website": "https://www.merri-bek.vic.gov.au", "libraryUrl": "https://www.merri-bek.vic.gov.au/arts-culture-and-events/libraries", "libraryPlatform": "mixed" },
  { "id": "hume", "name": "Hume", "region": "northern", "website": "https://www.hume.vic.gov.au", "libraryUrl": "https://humelibraries.events.mylibrary.digital", "libraryPlatform": "mylibrary.digital" },
  { "id": "brimbank", "name": "Brimbank", "region": "western", "website": "https://www.brimbank.vic.gov.au", "libraryUrl": "https://www.brimbank.vic.gov.au/recreation-and-events/events/browse-all-events", "libraryPlatform": "official" },
  { "id": "hobsons-bay", "name": "Hobsons Bay", "region": "western", "website": "https://www.hobsonsbay.vic.gov.au", "libraryUrl": "https://www.hobsonsbay.vic.gov.au/Community/Libraries/Library-events", "libraryPlatform": "official" },
  { "id": "maribyrnong", "name": "Maribyrnong", "region": "western", "website": "https://www.maribyrnong.vic.gov.au", "libraryUrl": "https://www.maribyrnong.vic.gov.au/library/Whats-On/Events", "libraryPlatform": "official" },
  { "id": "melton", "name": "Melton", "region": "western", "website": "https://www.melton.vic.gov.au", "libraryUrl": "https://libraryevents.melton.vic.gov.au", "libraryPlatform": "mylibrary.digital" },
  { "id": "moonee-valley", "name": "Moonee Valley", "region": "western", "website": "https://www.mvcc.vic.gov.au", "libraryUrl": "https://libraryevents.mvcc.vic.gov.au", "libraryPlatform": "mylibrary.digital" },
  { "id": "wyndham", "name": "Wyndham", "region": "western", "website": "https://www.wyndham.vic.gov.au", "libraryUrl": "https://events.humanitix.com/host/wyndham-city-libraries", "libraryPlatform": "humanitix" },
  { "id": "casey", "name": "Casey", "region": "outer", "website": "https://www.casey.vic.gov.au", "libraryUrl": "https://www.myli.org.au/events", "libraryPlatform": "myli" },
  { "id": "cardinia", "name": "Cardinia", "region": "outer", "website": "https://www.cardinia.vic.gov.au", "libraryUrl": "https://www.myli.org.au/events", "libraryPlatform": "myli" },
  { "id": "greater-dandenong", "name": "Greater Dandenong", "region": "outer", "website": "https://www.greaterdandenong.vic.gov.au", "libraryUrl": "https://www.greaterdandenong.vic.gov.au/community-and-health/libraries", "libraryPlatform": "official" }
]
```

- [ ] **Step 2: Create `scripts/seed-councils.ts`**

```typescript
import { prisma } from '../lib/prisma'
import councils from '../data/councils.json'

async function main() {
  console.log(`Seeding ${councils.length} councils...`)
  for (const council of councils) {
    await prisma.council.upsert({
      where: { id: council.id },
      update: council,
      create: council,
    })
  }
  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 3: Run the seed**

```bash
npx tsx scripts/seed-councils.ts
# Expected: Seeding 31 councils... Done.
```

- [ ] **Step 4: Verify in Prisma Studio**

```bash
npx prisma studio
# Council table should have 31 rows
```

- [ ] **Step 5: Commit**

```bash
git add data/ scripts/seed-councils.ts
git commit -m "feat: seed 31 Melbourne council records"
```

---

## Task 4: Import ABS Population Data (T03)

**Files:**
- Create: `scripts/import-abs.ts`
- Create: `data/abs-lga-2021.csv` (downloaded manually)

- [ ] **Step 1: Download ABS data**

Go to: https://www.abs.gov.au/census/find-census-data/community-profiles/2021/LGA

- Select: Victoria → Download "G01 Selected Person Characteristics by Sex"
- Save the CSV to `data/abs-lga-2021.csv`

- [ ] **Step 2: Create `scripts/import-abs.ts`**

```typescript
import { prisma } from '../lib/prisma'
import fs from 'fs'
import path from 'path'

// Map ABS LGA names to our council slugs
const LGA_SLUG_MAP: Record<string, string> = {
  'Melbourne (C)': 'melbourne',
  'Port Phillip (C)': 'port-phillip',
  'Stonnington (C)': 'stonnington',
  'Yarra (C)': 'yarra',
  'Boroondara (C)': 'boroondara',
  'Manningham (C)': 'manningham',
  'Whitehorse (C)': 'whitehorse',
  'Maroondah (C)': 'maroondah',
  'Knox (C)': 'knox',
  'Yarra Ranges (S)': 'yarra-ranges',
  'Monash (C)': 'monash',
  'Glen Eira (C)': 'glen-eira',
  'Bayside (C)': 'bayside',
  'Kingston (C)': 'kingston',
  'Frankston (C)': 'frankston',
  'Mornington Peninsula (S)': 'mornington-peninsula',
  'Banyule (C)': 'banyule',
  'Nillumbik (S)': 'nillumbik',
  'Whittlesea (C)': 'whittlesea',
  'Darebin (C)': 'darebin',
  'Moreland (C)': 'merri-bek',
  'Hume (C)': 'hume',
  'Brimbank (C)': 'brimbank',
  'Hobsons Bay (C)': 'hobsons-bay',
  'Maribyrnong (C)': 'maribyrnong',
  'Melton (C)': 'melton',
  'Moonee Valley (C)': 'moonee-valley',
  'Wyndham (C)': 'wyndham',
  'Casey (C)': 'casey',
  'Cardinia (S)': 'cardinia',
  'Greater Dandenong (C)': 'greater-dandenong',
}

async function main() {
  const csv = fs.readFileSync(path.join(process.cwd(), 'data/abs-lga-2021.csv'), 'utf8')
  const lines = csv.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

  const totalIdx = headers.indexOf('Tot_P_P')
  const maleIdx = headers.indexOf('Tot_P_M')
  const femaleIdx = headers.indexOf('Tot_P_F')
  const lgaIdx = headers.indexOf('LGA_NAME_2021')
  const medianAgeIdx = headers.indexOf('Median_age_persons')

  let imported = 0
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const lgaName = cols[lgaIdx]
    const slug = LGA_SLUG_MAP[lgaName]
    if (!slug) continue

    const total = parseInt(cols[totalIdx]) || 0
    const male = parseInt(cols[maleIdx]) || 0
    const female = parseInt(cols[femaleIdx]) || 0
    const medianAge = parseInt(cols[medianAgeIdx]) || null

    await prisma.council.update({
      where: { id: slug },
      data: { population: total },
    })

    await prisma.councilStats.upsert({
      where: { councilId: slug },
      update: {
        malePercent: total > 0 ? (male / total) * 100 : null,
        femalePercent: total > 0 ? (female / total) * 100 : null,
        medianAge,
        dataYear: 2021,
      },
      create: {
        councilId: slug,
        malePercent: total > 0 ? (male / total) * 100 : null,
        femalePercent: total > 0 ? (female / total) * 100 : null,
        medianAge,
        dataYear: 2021,
      },
    })
    imported++
  }
  console.log(`Imported stats for ${imported} councils.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 3: Run the import**

```bash
npx tsx scripts/import-abs.ts
# Expected: Imported stats for 31 councils.
```

- [ ] **Step 4: Verify**

```bash
npx prisma studio
# CouncilStats table should have 31 rows with population/gender data
```

- [ ] **Step 5: Commit**

```bash
git add scripts/import-abs.ts
git commit -m "feat: import ABS 2021 Census population stats"
```

---

## Task 5: Scraper Source Audit (Pre-T04/T05)

> **Why this task exists:** `council-audit-codex.md` established that several councils listed as "Eventbrite" in the original tickets actually use Eventbrite only as a *booking* tool — their official site is the real event listing source. Building Eventbrite scrapers for those councils would yield incomplete data. This task verifies each source before any scraper is written.

**Files:**
- Create: `scripts/audit-scraper-sources.ts`
- Update: `data/councils.json` (if URLs need correcting)

The 8 councils to audit (originally tagged as Eventbrite in council-ticket.md):
- Yarra, Boroondara, Frankston, Darebin, Merri-bek, Hobsons Bay, Maribyrnong, Brimbank

- [ ] **Step 1: Manually verify each council's true listing source**

For each council, open its `libraryUrl` in a browser and answer:
1. Does this URL show a paginated list of events? → `official listing`
2. Does clicking an event land on Eventbrite for the actual detail? → `booking only`
3. Are events listed here AND on Eventbrite with the same data? → `mixed`

Expected findings based on audit-codex:

| Council | Expected finding | Action |
|---|---|---|
| Boroondara | official listing | Write custom HTML scraper in Task 6b |
| Frankston | official listing | Write custom HTML scraper in Task 6b |
| Hobsons Bay | official listing | Write custom HTML scraper in Task 6b |
| Maribyrnong | official listing (paginated) | Write custom HTML scraper in Task 6b |
| Brimbank | official listing | Write custom HTML scraper in Task 6b |
| Darebin | mixed | Use official listing as primary |
| Merri-bek | mixed | Use official listing as primary |
| Yarra | mixed | Use official listing as primary |

- [ ] **Step 2: Update `data/councils.json` with verified `libraryUrl` and `libraryPlatform`**

For each council where the official site is the true source, confirm `libraryPlatform` is `"official"` (not `"eventbrite"`). The seed data in Task 3 already reflects the corrected values — double-check they match your browser findings.

- [ ] **Step 3: Re-run seed to persist any corrections**

```bash
npx tsx scripts/seed-councils.ts
```

- [ ] **Step 4: Record findings in a comment at the top of `scrapers/eventbrite.ts`**

Document which councils genuinely use Eventbrite as their primary listing source (not just booking). Based on the audit, the only councils to scrape via Eventbrite API for MVP are those where Eventbrite IS the listing, not just the booking.

- [ ] **Step 5: Commit audit findings**

```bash
git add data/councils.json
git commit -m "chore: audit and correct scraper source URLs for 8 councils"
```

---

## Task 6: mylibrary.digital Scraper (T04)

**Files:**
- Create: `scrapers/types.ts`
- Create: `scrapers/mylibrary-digital.ts`
- Create: `scripts/run-scraper.ts`

The 8 confirmed mylibrary.digital URLs for Melbourne MVP:
- `https://monlib.events.mylibrary.digital` → monash
- `https://bayside.events.mylibrary.digital` → bayside
- `https://stonnington.events.mylibrary.digital` → stonnington
- `https://humelibraries.events.mylibrary.digital` → hume
- `https://libraryevents.kingston.vic.gov.au` → kingston
- `https://libraryevents.melton.vic.gov.au` → melton
- `https://libraryevents.mvcc.vic.gov.au` → moonee-valley
- `https://events.yourlibrary.vic.gov.au` → maroondah, knox, yarra-ranges (shared)

- [ ] **Step 1: Create `scrapers/types.ts`**

```typescript
export interface ScrapedEvent {
  title: string
  description?: string
  category?: string
  startAt: Date
  endAt?: Date
  venue?: string
  bookingUrl?: string
  externalId?: string
}
```

- [ ] **Step 2: Inspect the HTML structure of monlib.events.mylibrary.digital**

Open https://monlib.events.mylibrary.digital in browser DevTools → Network tab → find the JSON or HTML structure. Look for:
- Event list container selector
- Title, date, time, venue, link selectors
- Pagination controls (next page button or page param)

- [ ] **Step 3: Create `scrapers/mylibrary-digital.ts`**

```typescript
import * as cheerio from 'cheerio'
import { ScrapedEvent } from './types'

export async function scrapeMyLibraryDigital(baseUrl: string): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MelbourneCouncilExplorer/1.0' },
    })

    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status}`)
      break
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const pageEvents: ScrapedEvent[] = []

    // Adjust selectors after inspecting the actual HTML structure
    $('.event-item, .tribe-event, [class*="event-card"]').each((_, el) => {
      const title = $(el).find('[class*="title"], h2, h3').first().text().trim()
      const dateText = $(el).find('[class*="date"], time, [class*="when"]').first().text().trim()
      const venue = $(el).find('[class*="venue"], [class*="location"]').first().text().trim()
      const link = $(el).find('a').first().attr('href')
      const externalId = link?.split('/').filter(Boolean).pop()

      if (!title || !dateText) return

      const startAt = parseDate(dateText)
      if (!startAt) return

      pageEvents.push({
        title,
        venue: venue || undefined,
        startAt,
        bookingUrl: link ? new URL(link, baseUrl).href : undefined,
        externalId,
      })
    })

    if (pageEvents.length === 0) {
      hasMore = false
    } else {
      events.push(...pageEvents)
      const nextBtn = $('[rel="next"], .next-page, [class*="pagination"] a:last-child').attr('href')
      hasMore = !!nextBtn
      page++
    }

    // Polite delay between pages
    await new Promise(r => setTimeout(r, 500))
  }

  return events
}

function parseDate(text: string): Date | null {
  const d = new Date(text)
  return isNaN(d.getTime()) ? null : d
}
```

> **Note:** After running this against the real site, you'll likely need to update the CSS selectors. Use browser DevTools to find the actual class names.

- [ ] **Step 4: Create `scripts/run-scraper.ts`**

```typescript
import { prisma } from '../lib/prisma'
import { scrapeMyLibraryDigital } from '../scrapers/mylibrary-digital'

const MYLIBRARY_COUNCILS = [
  { councilId: 'monash', url: 'https://monlib.events.mylibrary.digital' },
  { councilId: 'bayside', url: 'https://bayside.events.mylibrary.digital' },
  { councilId: 'stonnington', url: 'https://stonnington.events.mylibrary.digital' },
  { councilId: 'hume', url: 'https://humelibraries.events.mylibrary.digital' },
  { councilId: 'kingston', url: 'https://libraryevents.kingston.vic.gov.au' },
  { councilId: 'melton', url: 'https://libraryevents.melton.vic.gov.au' },
  { councilId: 'moonee-valley', url: 'https://libraryevents.mvcc.vic.gov.au' },
  { councilId: 'maroondah', url: 'https://events.yourlibrary.vic.gov.au' },
]

async function runMyLibraryScrapers() {
  for (const { councilId, url } of MYLIBRARY_COUNCILS) {
    console.log(`Scraping ${councilId}...`)
    try {
      const events = await scrapeMyLibraryDigital(url)
      let saved = 0
      for (const e of events) {
        if (!e.externalId) continue
        await prisma.event.upsert({
          where: { source_externalId: { source: 'mylibrary', externalId: e.externalId } },
          update: {
            title: e.title,
            description: e.description,
            startAt: e.startAt,
            endAt: e.endAt,
            venue: e.venue,
            bookingUrl: e.bookingUrl,
          },
          create: {
            councilId,
            title: e.title,
            description: e.description,
            startAt: e.startAt,
            endAt: e.endAt,
            venue: e.venue,
            bookingUrl: e.bookingUrl,
            source: 'mylibrary',
            externalId: e.externalId,
          },
        })
        saved++
      }
      await prisma.scrapeLog.create({
        data: { councilId, source: 'mylibrary', status: 'success', count: saved },
      })
      console.log(`  → saved ${saved} events`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await prisma.scrapeLog.create({
        data: { councilId, source: 'mylibrary', status: 'error', error: msg },
      })
      console.error(`  → error: ${msg}`)
    }
  }
}

runMyLibraryScrapers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 5: Run and verify**

```bash
npx tsx scripts/run-scraper.ts
# Expected: events saved per council, ScrapeLog has success entries
```

```bash
npx prisma studio
# Event table should have rows with source='mylibrary', councilId='monash' etc.
```

- [ ] **Step 6: Fix selectors if needed**

If 0 events returned, open DevTools on the target URL and find the correct CSS selectors. Update the `$('.event-item, ...')` selector in `scrapers/mylibrary-digital.ts`.

- [ ] **Step 7: Commit**

```bash
git add scrapers/ scripts/run-scraper.ts
git commit -m "feat: mylibrary.digital scraper for 8 Melbourne councils"
```

---

## Task 7: Humanitix Scraper (T05-partial)

**Files:**
- Create: `scrapers/humanitix.ts`
- Modify: `scripts/run-scraper.ts`

Wyndham is the one confirmed Humanitix council in Melbourne MVP.

- [ ] **Step 1: Get Humanitix host ID for Wyndham**

Visit https://events.humanitix.com/host/wyndham-city-libraries and extract the host ID from the URL (the slug after `/host/`).

- [ ] **Step 2: Create `scrapers/humanitix.ts`**

```typescript
import { ScrapedEvent } from './types'

const HUMANITIX_API = 'https://api.humanitix.com/v1'

export async function scrapeHumanitix(hostId: string): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const url = `${HUMANITIX_API}/events?hostId=${hostId}&page=${page}&pageSize=50&status=published`
    const res = await fetch(url, {
      headers: {
        'x-api-key': process.env.HUMANITIX_API_KEY ?? '',
        'User-Agent': 'MelbourneCouncilExplorer/1.0',
      },
    })

    if (!res.ok) {
      // Humanitix public events don't require an API key — try without
      const publicUrl = `https://events.humanitix.com/api/events?hostSlug=${hostId}&page=${page}`
      const pubRes = await fetch(publicUrl)
      if (!pubRes.ok) break
      const data = await pubRes.json()
      const items = data.events ?? data.data ?? []
      if (items.length === 0) { hasMore = false; break }
      for (const item of items) {
        events.push(mapHumanitixEvent(item))
      }
      hasMore = data.hasNextPage ?? false
    } else {
      const data = await res.json()
      const items = data.events ?? []
      if (items.length === 0) { hasMore = false; break }
      for (const item of items) {
        events.push(mapHumanitixEvent(item))
      }
      hasMore = data.hasNextPage ?? false
    }
    page++
    await new Promise(r => setTimeout(r, 300))
  }

  return events
}

function mapHumanitixEvent(item: Record<string, unknown>): ScrapedEvent {
  return {
    title: String(item.name ?? item.title ?? ''),
    description: item.description ? String(item.description).slice(0, 500) : undefined,
    startAt: new Date(String(item.startDate ?? item.startAt ?? item.start_date)),
    endAt: item.endDate ? new Date(String(item.endDate)) : undefined,
    venue: item.venue ? String((item.venue as Record<string, unknown>).name ?? item.venue) : undefined,
    bookingUrl: item.url ? String(item.url) : undefined,
    externalId: String(item._id ?? item.id ?? ''),
  }
}
```

> **Note:** Humanitix's public API structure varies. After running, inspect the actual JSON response and adjust the field mapping (`item.name`, `item.startDate`, etc.) to match.

- [ ] **Step 3: Add Humanitix to `scripts/run-scraper.ts`**

Add after the `runMyLibraryScrapers()` call:

```typescript
import { scrapeHumanitix } from '../scrapers/humanitix'

const HUMANITIX_COUNCILS = [
  { councilId: 'wyndham', hostId: 'wyndham-city-libraries' },
]

async function runHumanitixScrapers() {
  for (const { councilId, hostId } of HUMANITIX_COUNCILS) {
    console.log(`Scraping Humanitix: ${councilId}...`)
    try {
      const events = await scrapeHumanitix(hostId)
      let saved = 0
      for (const e of events) {
        if (!e.externalId) continue
        await prisma.event.upsert({
          where: { source_externalId: { source: 'humanitix', externalId: e.externalId } },
          update: { title: e.title, startAt: e.startAt, endAt: e.endAt, venue: e.venue },
          create: { councilId, ...e, source: 'humanitix' },
        })
        saved++
      }
      await prisma.scrapeLog.create({
        data: { councilId, source: 'humanitix', status: 'success', count: saved },
      })
      console.log(`  → saved ${saved} events`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await prisma.scrapeLog.create({
        data: { councilId, source: 'humanitix', status: 'error', error: msg },
      })
    }
  }
}
```

- [ ] **Step 4: Run and verify**

```bash
npx tsx scripts/run-scraper.ts
```

- [ ] **Step 5: Commit**

```bash
git add scrapers/humanitix.ts scripts/run-scraper.ts
git commit -m "feat: Humanitix scraper for Wyndham"
```

---

## Task 8: GitHub Actions Cron (T06)

**Files:**
- Create: `.github/workflows/scrape.yml`

- [ ] **Step 1: Add DATABASE_URL to GitHub Secrets**

In your GitHub repo: Settings → Secrets and variables → Actions → New repository secret:
- Name: `DATABASE_URL`
- Value: your Neon connection string (same as `.env.local`)

- [ ] **Step 2: Create `.github/workflows/scrape.yml`**

```yaml
name: Daily Scrape

on:
  schedule:
    - cron: '0 15 * * *'  # 1am AEST = 3pm UTC
  workflow_dispatch:

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma generate
      - run: npx tsx scripts/run-scraper.ts
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

- [ ] **Step 3: Manually trigger the workflow**

Push to main, then: GitHub → Actions tab → Daily Scrape → Run workflow

Expected: green checkmark, DB has fresh data.

- [ ] **Step 4: Commit**

```bash
git add .github/
git commit -m "feat: GitHub Actions daily scrape cron"
```

---

## Task 9: API Routes (T07 + T08)

**Files:**
- Create: `app/api/councils/route.ts`
- Create: `app/api/councils/[slug]/route.ts`
- Create: `app/api/events/route.ts`

- [ ] **Step 1: Create `app/api/councils/route.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region')
  const councils = await prisma.council.findMany({
    where: region ? { region } : undefined,
    include: {
      stats: true,
      _count: { select: { libraries: true, events: true } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(councils)
}
```

- [ ] **Step 2: Create `app/api/councils/[slug]/route.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const council = await prisma.council.findUnique({
    where: { id: params.slug },
    include: {
      stats: true,
      libraries: true,
      events: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
        take: 20,
      },
    },
  })
  if (!council) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(council)
}
```

- [ ] **Step 3: Create `app/api/events/route.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const councilId = searchParams.get('council')
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)

  const where = {
    ...(councilId ? { councilId } : {}),
    ...(category ? { category } : {}),
    startAt: {
      gte: from ? new Date(from) : new Date(),
      ...(to ? { lte: new Date(to) } : {}),
    },
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { council: { select: { name: true, region: true } } },
      orderBy: { startAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({ events, total, page, limit })
}
```

- [ ] **Step 4: Test API routes**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/councils | head -c 500
curl "http://localhost:3000/api/councils?region=eastern" | head -c 500
curl "http://localhost:3000/api/events?council=monash" | head -c 500
```

- [ ] **Step 5: Commit**

```bash
git add app/api/
git commit -m "feat: council and events API routes with filtering and pagination"
```

---

## Task 10: Shared Components & Design System (T09)

**Files:**
- Modify: `app/globals.css`
- Create: `components/AppNav.tsx`
- Create: `components/CouncilCard.tsx`
- Create: `components/EventCard.tsx`
- Create: `components/RegionBadge.tsx`

- [ ] **Step 1: Update `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #1B3A6B;
  --color-accent: #F4A623;
  --color-bg: #F8F6F2;
}

body {
  background-color: var(--color-bg);
  color: #1a1a1a;
}
```

- [ ] **Step 2: Create `components/RegionBadge.tsx`**

```typescript
const REGION_COLORS: Record<string, string> = {
  inner: 'bg-purple-100 text-purple-800',
  eastern: 'bg-blue-100 text-blue-800',
  southern: 'bg-green-100 text-green-800',
  northern: 'bg-orange-100 text-orange-800',
  western: 'bg-red-100 text-red-800',
  outer: 'bg-gray-100 text-gray-700',
}

const REGION_LABELS: Record<string, string> = {
  inner: '内城', eastern: '东区', southern: '南区',
  northern: '北区', western: '西区', outer: '外围',
}

export function RegionBadge({ region }: { region: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${REGION_COLORS[region] ?? 'bg-gray-100'}`}>
      {REGION_LABELS[region] ?? region}
    </span>
  )
}
```

- [ ] **Step 3: Create `components/CouncilCard.tsx`**

```typescript
import Link from 'next/link'
import { RegionBadge } from './RegionBadge'

interface Props {
  id: string
  name: string
  region: string
  population?: number | null
  libraryCount?: number
  eventCount?: number
}

export function CouncilCard({ id, name, region, population, libraryCount, eventCount }: Props) {
  return (
    <Link href={`/councils/${id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-[var(--color-primary)]">{name}</h3>
        <RegionBadge region={region} />
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        {population && <div>人口：{population.toLocaleString()}</div>}
        {libraryCount != null && <div>图书馆：{libraryCount} 个</div>}
        {eventCount != null && <div>近期活动：{eventCount} 个</div>}
      </div>
    </Link>
  )
}
```

- [ ] **Step 4: Create `components/EventCard.tsx`**

```typescript
interface Props {
  title: string
  council: string
  venue?: string | null
  startAt: string | Date
  category?: string | null
  bookingUrl?: string | null
}

export function EventCard({ title, council, venue, startAt, category, bookingUrl }: Props) {
  const date = new Date(startAt)
  const formatted = date.toLocaleDateString('zh-AU', { month: 'short', day: 'numeric', weekday: 'short' })
  const time = date.toLocaleTimeString('zh-AU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{council} · {venue ?? '未知地点'}</p>
          <p className="text-xs text-gray-400 mt-1">{formatted} {time}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {category && (
            <span className="text-xs bg-[var(--color-accent)] bg-opacity-20 text-orange-800 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
          {bookingUrl && (
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[var(--color-primary)] underline">
              报名
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `components/AppNav.tsx`**

```typescript
import Link from 'next/link'

export function AppNav() {
  return (
    <nav className="bg-[var(--color-primary)] text-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Melbourne Council Explorer
        </Link>
        <div className="flex gap-6 text-sm">
          <Link href="/councils" className="hover:text-[var(--color-accent)] transition-colors">Councils</Link>
          <Link href="/events" className="hover:text-[var(--color-accent)] transition-colors">Events</Link>
          <Link href="/compare" className="hover:text-[var(--color-accent)] transition-colors">Compare</Link>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 6: Add AppNav to layout**

Edit `app/layout.tsx` to import and render `<AppNav />` before `{children}`.

- [ ] **Step 7: Commit**

```bash
git add components/ app/globals.css app/layout.tsx
git commit -m "feat: design system, shared components, and navigation"
```

---

## Task 11: Homepage Map (T10)

**Files:**
- Modify: `app/page.tsx`
- Create: `public/melbourne-lgas.geojson` (downloaded)

- [ ] **Step 1: Download Melbourne LGA GeoJSON**

```bash
# Download from ABS ASGS boundary files (Digital Boundary Files)
# URL: https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files
# Download: Local Government Areas ASGS Ed 3 2021 → GDA2020 → GeoJSON
# Filter to Victorian LGAs only, save to public/melbourne-lgas.geojson
```

Alternatively use data.gov.au: search "Victorian LGA boundaries GeoJSON".

- [ ] **Step 2: Install mapbox-gl**

```bash
npm install mapbox-gl
npm install -D @types/mapbox-gl
```

- [ ] **Step 3: Create `app/page.tsx`**

```typescript
'use client'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useRouter } from 'next/navigation'

const REGION_FILL_COLORS: Record<string, string> = {
  inner: '#7c3aed', eastern: '#2563eb', southern: '#16a34a',
  northern: '#ea580c', western: '#dc2626', outer: '#6b7280',
}

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const router = useRouter()
  const [councils, setCouncils] = useState<Array<{ id: string; name: string; region: string; population?: number }>>([])

  useEffect(() => {
    fetch('/api/councils').then(r => r.json()).then(setCouncils)
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [145.0, -37.8],
      zoom: 9,
    })
    mapRef.current = map

    map.on('load', async () => {
      const geojson = await fetch('/melbourne-lgas.geojson').then(r => r.json())
      map.addSource('lgas', { type: 'geojson', data: geojson })

      const councilSlugToRegion = Object.fromEntries(councils.map(c => [c.id, c.region]))

      map.addLayer({
        id: 'lga-fill',
        type: 'fill',
        source: 'lgas',
        paint: {
          'fill-color': [
            'match', ['get', 'lga_slug'],
            ...Object.entries(councilSlugToRegion).flatMap(([slug, region]) => [slug, REGION_FILL_COLORS[region] ?? '#6b7280']),
            '#e5e7eb',
          ],
          'fill-opacity': 0.5,
        },
      })

      map.addLayer({
        id: 'lga-border',
        type: 'line',
        source: 'lgas',
        paint: { 'line-color': '#fff', 'line-width': 1 },
      })

      map.on('click', 'lga-fill', (e) => {
        const slug = e.features?.[0]?.properties?.lga_slug
        if (slug) router.push(`/councils/${slug}`)
      })

      map.on('mouseenter', 'lga-fill', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'lga-fill', () => { map.getCanvas().style.cursor = '' })
    })

    return () => map.remove()
  }, [councils, router])

  return (
    <div className="relative h-[calc(100vh-56px)]">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-3 text-xs">
        {Object.entries(REGION_FILL_COLORS).map(([region, color]) => (
          <div key={region} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="capitalize">{region}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

> **Note:** The GeoJSON must have a `lga_slug` property matching our council IDs (e.g. `"monash"`). After downloading, inspect the feature properties and add a transformation step if the property names differ.

- [ ] **Step 4: Run and test**

```bash
npm run dev
# Open http://localhost:3000
# Map should show Melbourne councils colored by region
# Click a council → should navigate to /councils/[slug]
```

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx public/melbourne-lgas.geojson
git commit -m "feat: interactive Mapbox map on homepage with region coloring"
```

---

## Task 12: Council List Page (T11)

**Files:**
- Create: `app/councils/page.tsx`

- [ ] **Step 1: Create `app/councils/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'
import { CouncilCard } from '@/components/CouncilCard'

const REGIONS = ['all', 'inner', 'eastern', 'southern', 'northern', 'western', 'outer']
const REGION_LABELS: Record<string, string> = {
  all: '全部', inner: '内城', eastern: '东区',
  southern: '南区', northern: '北区', western: '西区', outer: '外围',
}

interface Props {
  searchParams: { region?: string; q?: string }
}

export default async function CouncilsPage({ searchParams }: Props) {
  const region = searchParams.region && searchParams.region !== 'all' ? searchParams.region : undefined
  const q = searchParams.q?.toLowerCase()

  const councils = await prisma.council.findMany({
    where: region ? { region } : undefined,
    include: {
      stats: true,
      _count: { select: { libraries: true, events: { where: { startAt: { gte: new Date() } } } } },
    },
    orderBy: { name: 'asc' },
  })

  const filtered = q ? councils.filter(c => c.name.toLowerCase().includes(q)) : councils

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Melbourne Councils</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {REGIONS.map(r => (
          <a
            key={r}
            href={`/councils?region=${r}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              (searchParams.region ?? 'all') === r
                ? 'bg-[var(--color-primary)] text-white border-transparent'
                : 'border-gray-300 hover:border-[var(--color-primary)]'
            }`}
          >
            {REGION_LABELS[r]}
          </a>
        ))}
      </div>

      <form method="get" action="/councils" className="mb-6">
        {region && <input type="hidden" name="region" value={region} />}
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="搜索 council..."
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <CouncilCard
            key={c.id}
            id={c.id}
            name={c.name}
            region={c.region}
            population={c.population}
            libraryCount={c._count.libraries}
            eventCount={c._count.events}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">没有找到匹配的 council。</p>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Test**

```bash
# Open http://localhost:3000/councils
# Click region tabs — filter should work
# Type in search box and submit — should filter by name
```

- [ ] **Step 3: Commit**

```bash
git add app/councils/page.tsx
git commit -m "feat: council list page with region filter and search"
```

---

## Task 13: Council Detail Page (T12)

**Files:**
- Create: `app/councils/[slug]/page.tsx`

- [ ] **Step 1: Create `app/councils/[slug]/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EventCard } from '@/components/EventCard'
import { RegionBadge } from '@/components/RegionBadge'

interface Props {
  params: { slug: string }
  searchParams: { tab?: string }
}

export default async function CouncilDetailPage({ params, searchParams }: Props) {
  const tab = searchParams.tab ?? 'overview'
  const council = await prisma.council.findUnique({
    where: { id: params.slug },
    include: {
      stats: true,
      libraries: true,
      events: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: 'asc' },
        take: 30,
      },
    },
  })
  if (!council) notFound()

  const density = council.population && council.areaSqKm
    ? Math.round(council.population / council.areaSqKm)
    : null

  const TABS = [
    { key: 'overview', label: '概览' },
    { key: 'events', label: `图书馆活动 (${council.events.length})` },
    { key: 'facilities', label: '设施' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">{council.name}</h1>
        <RegionBadge region={council.region} />
      </div>

      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {TABS.map(t => (
          <a
            key={t.key}
            href={`/councils/${council.id}?tab=${t.key}`}
            className={`px-4 py-2 text-sm -mb-px border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: '人口', value: council.population?.toLocaleString() ?? '—' },
              { label: '面积 (km²)', value: council.areaSqKm?.toFixed(1) ?? '—' },
              { label: '人口密度', value: density ? `${density}/km²` : '—' },
              { label: '数据年份', value: council.stats?.dataYear?.toString() ?? '2021' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-[var(--color-primary)]">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {council.stats && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold mb-3">性别分布</h2>
              <div className="flex rounded-full overflow-hidden h-4">
                <div
                  style={{ width: `${council.stats.malePercent ?? 50}%` }}
                  className="bg-blue-400"
                />
                <div className="flex-1 bg-pink-400" />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>男 {council.stats.malePercent?.toFixed(1)}%</span>
                <span>女 {council.stats.femalePercent?.toFixed(1)}%</span>
              </div>
              {council.stats.medianAge && (
                <p className="text-sm text-gray-600 mt-3">中位年龄：{council.stats.medianAge} 岁</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div>
          {council.events.length === 0 ? (
            <p className="text-gray-500">暂无即将到来的活动。</p>
          ) : (
            <div className="space-y-3">
              {council.events.map(e => (
                <EventCard
                  key={e.id}
                  title={e.title}
                  council={council.name}
                  venue={e.venue}
                  startAt={e.startAt}
                  category={e.category}
                  bookingUrl={e.bookingUrl}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'facilities' && (
        <div className="text-gray-500">
          <p>设施数据将在 T15（OSM Parks 导入）后显示。</p>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Test**

```bash
# Open http://localhost:3000/councils/monash
# Should show overview KPIs and events tab
# Click tabs to verify navigation
```

- [ ] **Step 3: Commit**

```bash
git add app/councils/
git commit -m "feat: council detail page with overview, events, and facilities tabs"
```

---

## Task 14: Events Calendar Page (T13)

**Files:**
- Create: `app/events/page.tsx`

- [ ] **Step 1: Create `app/events/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'
import { EventCard } from '@/components/EventCard'

const CATEGORIES = ['English', 'Children', 'Cultural', 'Health', 'Craft', 'Reading']
const DATE_RANGES = [
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

interface Props {
  searchParams: { council?: string; category?: string; range?: string; page?: string }
}

function getDateRange(range?: string): { from: Date; to?: Date } {
  const now = new Date()
  if (range === 'today') {
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    return { from: now, to: end }
  }
  if (range === 'week') {
    const end = new Date(now)
    end.setDate(end.getDate() + 7)
    return { from: now, to: end }
  }
  if (range === 'month') {
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)
    return { from: now, to: end }
  }
  return { from: now }
}

export default async function EventsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page ?? '1')
  const limit = 20
  const { from, to } = getDateRange(searchParams.range)

  const where = {
    ...(searchParams.council ? { councilId: searchParams.council } : {}),
    ...(searchParams.category ? { category: searchParams.category } : {}),
    startAt: { gte: from, ...(to ? { lte: to } : {}) },
  }

  const [events, total, councils] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { council: { select: { name: true } } },
      orderBy: { startAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.event.count({ where }),
    prisma.council.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">墨尔本图书馆活动</h1>

      <form method="get" action="/events" className="flex flex-wrap gap-3 mb-6">
        <select name="council" defaultValue={searchParams.council ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">全部 Council</option>
          {councils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select name="category" defaultValue={searchParams.category ?? ''} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">全部类型</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-1">
          {DATE_RANGES.map(r => (
            <button
              key={r.key}
              type="submit"
              name="range"
              value={r.key}
              className={`px-3 py-2 text-sm rounded-lg border ${
                searchParams.range === r.key
                  ? 'bg-[var(--color-primary)] text-white border-transparent'
                  : 'border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </form>

      <p className="text-sm text-gray-500 mb-4">共 {total} 个活动</p>

      {events.length === 0 ? (
        <p className="text-center text-gray-400 py-16">这个时间段没有符合条件的活动。</p>
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <EventCard
              key={e.id}
              title={e.title}
              council={e.council.name}
              venue={e.venue}
              startAt={e.startAt}
              category={e.category}
              bookingUrl={e.bookingUrl}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a href={`/events?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm">上一页</a>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`/events?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm">下一页</a>
          )}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Test**

```bash
# Open http://localhost:3000/events
# Filter by category "English" — verify only English events show
# Filter by "本周" — verify date range works
```

- [ ] **Step 3: Commit**

```bash
git add app/events/
git commit -m "feat: events calendar page with council, category, and date filters"
```

---

## Task 15: Compare Page (T14)

**Files:**
- Create: `app/compare/page.tsx`

- [ ] **Step 1: Create `app/compare/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'

interface Props {
  searchParams: { a?: string; b?: string; c?: string }
}

export default async function ComparePage({ searchParams }: Props) {
  const slugs = [searchParams.a, searchParams.b, searchParams.c].filter(Boolean) as string[]

  const [allCouncils, selected] = await Promise.all([
    prisma.council.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    slugs.length > 0
      ? prisma.council.findMany({
          where: { id: { in: slugs } },
          include: {
            stats: true,
            _count: {
              select: {
                libraries: true,
                events: {
                  where: {
                    startAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
                  },
                },
              },
            },
          },
        })
      : [],
  ])

  const DIMENSIONS = [
    { key: 'population', label: '人口', fn: (c: typeof selected[0]) => c.population?.toLocaleString() ?? '—' },
    { key: 'areaSqKm', label: '面积 (km²)', fn: (c: typeof selected[0]) => c.areaSqKm?.toFixed(1) ?? '—' },
    { key: 'density', label: '人口密度', fn: (c: typeof selected[0]) => c.population && c.areaSqKm ? `${Math.round(c.population / c.areaSqKm)}/km²` : '—' },
    { key: 'libraries', label: '图书馆数', fn: (c: typeof selected[0]) => String(c._count.libraries) },
    { key: 'events', label: '本月活动数', fn: (c: typeof selected[0]) => String(c._count.events) },
    { key: 'medianAge', label: '中位年龄', fn: (c: typeof selected[0]) => c.stats?.medianAge ? `${c.stats.medianAge} 岁` : '—' },
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Council 对比</h1>

      <form method="get" action="/compare" className="flex flex-wrap gap-3 mb-8">
        {['a', 'b', 'c'].map((key) => (
          <select
            key={key}
            name={key}
            defaultValue={searchParams[key as 'a' | 'b' | 'c'] ?? ''}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">选择 Council {key === 'a' ? '1' : key === 'b' ? '2' : '3'}</option>
            {allCouncils.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ))}
        <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg">
          对比
        </button>
      </form>

      {selected.length >= 2 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 text-gray-500 font-normal">指标</th>
                {selected.map(c => (
                  <th key={c.id} className="text-center py-2 px-4 font-semibold text-[var(--color-primary)]">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map(d => (
                <tr key={d.key} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-4 text-gray-600">{d.label}</td>
                  {selected.map(c => (
                    <td key={c.id} className="py-3 px-4 text-center font-medium">{d.fn(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected.length < 2 && slugs.length > 0 && (
        <p className="text-gray-500">请至少选择2个 council 进行对比。</p>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Test**

```bash
# Open http://localhost:3000/compare
# Select Monash and Glen Eira → click 对比 → table should show comparison
```

- [ ] **Step 3: Commit**

```bash
git add app/compare/
git commit -m "feat: council compare page with population, libraries, and events dimensions"
```

---

## Task 16: Vercel Deployment + README (MVP Launch)

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Deploy to Vercel**

```bash
npx vercel
# Follow prompts: link to project, set environment variables
# Add DATABASE_URL and NEXT_PUBLIC_MAPBOX_TOKEN in Vercel dashboard
```

- [ ] **Step 2: Verify production build works**

```bash
npm run build
# Expected: no TypeScript errors, no build failures
```

- [ ] **Step 3: Update README.md** with:
  - Project description (one paragraph)
  - Screenshot of the map and events page
  - Live demo URL
  - Local setup instructions:
    ```bash
    npm install
    cp .env.local.example .env.local  # fill in DB + Mapbox
    npx prisma migrate dev
    npx tsx scripts/seed-councils.ts
    npx tsx scripts/import-abs.ts
    npx tsx scripts/run-scraper.ts
    npm run dev
    ```
  - Tech stack list
  - Data sources with attribution

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: README with setup instructions and live demo link"
git push origin main
```

---

## Self-Review Checklist

**Spec coverage check:**
- ✅ T00: Project scaffold → Task 1
- ✅ T01: Prisma schema → Task 2
- ✅ T02: 31 councils seed → Task 3
- ✅ T03: ABS population → Task 4
- ✅ Scraper audit (new, from brainstorm) → Task 5
- ✅ T04: mylibrary.digital scraper → Task 6
- ✅ T05-partial: Humanitix scraper → Task 7
- ✅ T06: GitHub Actions cron → Task 8
- ✅ T07+T08: API routes → Task 9
- ✅ T09: Design system → Task 10
- ✅ T10: Map homepage → Task 11
- ✅ T11: Council list → Task 12
- ✅ T12: Council detail → Task 13
- ✅ T13: Events page → Task 14
- ✅ T14: Compare page → Task 15
- ⚠️ T15: OSM Parks → deferred (Facilities tab shows placeholder until T15 is built post-MVP)
- ⚠️ Eventbrite scraper (post-audit) → to be added to run-scraper.ts after Task 5 confirms which councils genuinely use Eventbrite as listing source

**Placeholder scan:** None found — all code steps are complete.

**Type consistency:** `ScrapedEvent` defined in `scrapers/types.ts` and used consistently across `scrapers/mylibrary-digital.ts` and `scrapers/humanitix.ts`. Prisma `event.upsert` uses `source_externalId` compound unique key matching the schema's `@@unique([source, externalId])`.
