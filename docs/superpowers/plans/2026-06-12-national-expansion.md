# National Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Victoria-only council explorer to all Australian states, with full data for VIC and lightweight (website-link-only) coverage for NSW, QLD, SA, WA, TAS, ACT, NT — without changing any existing VIC UI.

**Architecture:** Add a `state` field to the `Council` model (defaulting to "VIC" so existing data is unaffected). Each non-VIC council stores one library record with only a URL. All pages gain a `StateTabs` component that filters by state via URL params; non-VIC paths show simplified read-only layouts. The map lazy-loads state GeoJSON on tab switch.

**Tech Stack:** Next.js 16 App Router, Prisma 5 + Neon PostgreSQL, Tailwind CSS v4, Mapbox GL JS, `tsx` for seed scripts.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `prisma/schema.prisma` | Modify | Add `state String @default("VIC")` to Council |
| `components/StateTabs.tsx` | Create | Reusable state filter tabs for all pages |
| `components/NonVicCouncilCard.tsx` | Create | Council card for non-VIC councils |
| `scripts/seed-nsw-councils.ts` | Create | Seed 20 NSW councils + 1 library each |
| `scripts/download-nsw-lga-geojson.ts` | Create | Fetch NSW LGA boundaries from ABS |
| `public/nsw-lgas.geojson` | Generated | NSW boundary polygons (run download script) |
| `app/page.tsx` | Modify | Add state tabs, multi-state GeoJSON, fly-to-state |
| `app/councils/page.tsx` | Modify | Add state filter, non-VIC card list |
| `app/councils/[slug]/page.tsx` | Modify | Add non-VIC simplified layout (early return) |
| `app/events/page.tsx` | Modify | Add state filter, non-VIC notice |
| `app/libraries/page.tsx` | Modify | Add state filter, non-VIC notice |
| `app/api/councils/route.ts` | Modify | Accept `?state=` filter |

---

## Task 1: Schema — add `state` field

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add `state` field to Council model**

In `prisma/schema.prisma`, find the Council model and add `state` after `region`:

```prisma
model Council {
  id               String        @id
  name             String
  region           String
  state            String        @default("VIC")   // ← add this line
  website          String?
  // ... rest unchanged
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_state_to_council
```

Expected output: `Your database is now in sync with your schema.`

- [ ] **Step 3: Regenerate client**

```bash
npx prisma generate
```

- [ ] **Step 4: Verify existing VIC councils are unaffected**

```bash
npx tsx --env-file=.env.local -e "
const { prisma } = require('./lib/prisma')
prisma.council.count({ where: { state: 'VIC' } })
  .then(n => console.log('VIC councils:', n))
  .finally(() => prisma.\$disconnect())
"
```

Expected: `VIC councils: 34` (or however many are seeded)

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add state field to Council model (default VIC)"
```

---

## Task 2: StateTabs component

**Files:**
- Create: `components/StateTabs.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/StateTabs.tsx
'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const STATES = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'] as const
export type StateCode = typeof STATES[number]

interface Props {
  basePath: string        // e.g. "/councils", "/events"
  preserveParams?: string[] // other params to keep, e.g. ['region', 'q']
}

export function StateTabs({ basePath, preserveParams = [] }: Props) {
  const searchParams = useSearchParams()
  const activeState = (searchParams.get('state') ?? 'VIC') as StateCode

  function buildHref(state: StateCode) {
    const params = new URLSearchParams()
    params.set('state', state)
    for (const key of preserveParams) {
      const val = searchParams.get(key)
      if (val) params.set(key, val)
    }
    return `${basePath}?${params.toString()}`
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-6">
      {STATES.map(s => (
        <Link
          key={s}
          href={buildHref(s)}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            activeState === s
              ? 'bg-(--color-primary) text-white border-transparent'
              : 'border-gray-300 text-gray-600 hover:border-(--color-primary) hover:text-(--color-primary)'
          }`}
        >
          {s}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep StateTabs
```

Expected: no output (no errors)

- [ ] **Step 3: Commit**

```bash
git add components/StateTabs.tsx
git commit -m "feat: add StateTabs component for state filtering"
```

---

## Task 3: NonVicCouncilCard component

**Files:**
- Create: `components/NonVicCouncilCard.tsx`

- [ ] **Step 1: Create component**

```tsx
// components/NonVicCouncilCard.tsx
import Link from 'next/link'

interface Props {
  id: string
  name: string
  state: string
  population?: number | null
  areaSqKm?: number | null
  libraryUrl?: string | null
  website?: string | null
}

export function NonVicCouncilCard({ id, name, state, population, areaSqKm, libraryUrl, website }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Link href={`/councils/${id}`} className="font-semibold text-(--color-primary) hover:underline">
          {name}
        </Link>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{state}</span>
      </div>
      <div className="text-sm text-gray-500 space-y-1 mb-3">
        {population != null && <div>Population: {population.toLocaleString()}</div>}
        {areaSqKm != null && <div>Area: {areaSqKm.toLocaleString()} km²</div>}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
            Council website ↗
          </a>
        )}
      </div>
      {libraryUrl && (
        <a
          href={libraryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition-colors"
        >
          📚 Library Website →
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/NonVicCouncilCard.tsx
git commit -m "feat: add NonVicCouncilCard for external-link councils"
```

---

## Task 4: NSW councils seed script

**Files:**
- Create: `scripts/seed-nsw-councils.ts`

- [ ] **Step 1: Create seed script**

```ts
// scripts/seed-nsw-councils.ts
import { prisma } from '../lib/prisma'

const NSW_COUNCILS = [
  // Sydney Inner
  { id: 'city-of-sydney', name: 'City of Sydney', region: 'sydney-inner', population: 246343, areaSqKm: 26.2, website: 'https://www.cityofsydney.nsw.gov.au', libraryUrl: 'https://library.cityofsydney.nsw.gov.au', libraryName: 'City of Sydney Libraries', librarySuburb: 'Sydney' },
  { id: 'inner-west', name: 'Inner West Council', region: 'sydney-inner', population: 196000, areaSqKm: 36.0, website: 'https://www.innerwest.nsw.gov.au', libraryUrl: 'https://www.innerwest.nsw.gov.au/explore/libraries', libraryName: 'Inner West Libraries', librarySuburb: 'Leichhardt' },
  { id: 'waverley', name: 'Waverley Council', region: 'sydney-inner', population: 73600, areaSqKm: 9.1, website: 'https://www.waverley.nsw.gov.au', libraryUrl: 'https://www.waverley.nsw.gov.au/services/libraries', libraryName: 'Waverley Library', librarySuburb: 'Bondi Junction' },
  { id: 'randwick', name: 'Randwick City Council', region: 'sydney-inner', population: 143600, areaSqKm: 36.3, website: 'https://www.randwick.nsw.gov.au', libraryUrl: 'https://www.randwick.nsw.gov.au/community-services/libraries', libraryName: 'Randwick City Library', librarySuburb: 'Randwick' },
  // Sydney North
  { id: 'north-sydney', name: 'North Sydney Council', region: 'sydney-north', population: 74000, areaSqKm: 10.5, website: 'https://www.northsydney.nsw.gov.au', libraryUrl: 'https://www.northsydney.nsw.gov.au/services/libraries', libraryName: 'Stanton Library', librarySuburb: 'North Sydney' },
  { id: 'willoughby', name: 'Willoughby City Council', region: 'sydney-north', population: 80200, areaSqKm: 29.2, website: 'https://www.willoughby.nsw.gov.au', libraryUrl: 'https://www.willoughby.nsw.gov.au/community/libraries', libraryName: 'Chatswood Library', librarySuburb: 'Chatswood' },
  { id: 'mosman', name: 'Mosman Municipal Council', region: 'sydney-north', population: 31100, areaSqKm: 10.0, website: 'https://mosman.nsw.gov.au', libraryUrl: 'https://mosman.nsw.gov.au/library', libraryName: 'Mosman Library', librarySuburb: 'Mosman' },
  { id: 'lane-cove', name: 'Lane Cove Municipal Council', region: 'sydney-north', population: 38800, areaSqKm: 18.3, website: 'https://lanecove.nsw.gov.au', libraryUrl: 'https://lanecove.nsw.gov.au/community/libraries', libraryName: 'Lane Cove Library', librarySuburb: 'Lane Cove' },
  { id: 'city-of-ryde', name: 'City of Ryde', region: 'sydney-north', population: 128400, areaSqKm: 44.0, website: 'https://www.ryde.nsw.gov.au', libraryUrl: 'https://www.ryde.nsw.gov.au/Council/Libraries', libraryName: 'Ryde Library Service', librarySuburb: 'Ryde' },
  // Sydney West
  { id: 'parramatta', name: 'City of Parramatta', region: 'sydney-west', population: 258000, areaSqKm: 83.0, website: 'https://www.cityofparramatta.nsw.gov.au', libraryUrl: 'https://www.cityofparramatta.nsw.gov.au/community/parramatta-city-library', libraryName: 'Parramatta City Library', librarySuburb: 'Parramatta' },
  { id: 'blacktown', name: 'Blacktown City Council', region: 'sydney-west', population: 394000, areaSqKm: 246.0, website: 'https://www.blacktown.nsw.gov.au', libraryUrl: 'https://www.blacktown.nsw.gov.au/Services/Libraries-and-Reading', libraryName: 'Blacktown City Libraries', librarySuburb: 'Blacktown' },
  { id: 'penrith', name: 'Penrith City Council', region: 'sydney-west', population: 222500, areaSqKm: 404.0, website: 'https://www.penrithcity.nsw.gov.au', libraryUrl: 'https://www.penrithcity.nsw.gov.au/library', libraryName: 'Penrith Library', librarySuburb: 'Penrith' },
  // Sydney South-West
  { id: 'liverpool', name: 'Liverpool City Council', region: 'sydney-southwest', population: 234700, areaSqKm: 304.0, website: 'https://www.liverpool.nsw.gov.au', libraryUrl: 'https://www.liverpool.nsw.gov.au/residents/arts-and-culture/liverpool-city-libraries', libraryName: 'Liverpool City Libraries', librarySuburb: 'Liverpool' },
  { id: 'campbelltown-nsw', name: 'Campbelltown City Council', region: 'sydney-southwest', population: 178000, areaSqKm: 311.0, website: 'https://www.campbelltown.nsw.gov.au', libraryUrl: 'https://www.campbelltown.nsw.gov.au/Services-and-Payments/Libraries', libraryName: 'Campbelltown City Libraries', librarySuburb: 'Campbelltown' },
  { id: 'camden-nsw', name: 'Camden Council', region: 'sydney-southwest', population: 122000, areaSqKm: 201.0, website: 'https://www.camden.nsw.gov.au', libraryUrl: 'https://www.camden.nsw.gov.au/library', libraryName: 'Camden Library', librarySuburb: 'Camden' },
  { id: 'georges-river', name: 'Georges River Council', region: 'sydney-southwest', population: 166000, areaSqKm: 43.0, website: 'https://www.georgesriver.nsw.gov.au', libraryUrl: 'https://www.georgesriver.nsw.gov.au/Community/Libraries', libraryName: 'Georges River Libraries', librarySuburb: 'Hurstville' },
  // NSW Regional
  { id: 'central-coast-nsw', name: 'Central Coast Council', region: 'nsw-regional', population: 343000, areaSqKm: 1681.0, website: 'https://www.centralcoast.nsw.gov.au', libraryUrl: 'https://www.centralcoast.nsw.gov.au/residents/arts-and-culture/libraries', libraryName: 'Central Coast Libraries', librarySuburb: 'Gosford' },
  { id: 'newcastle-nsw', name: 'City of Newcastle', region: 'nsw-regional', population: 168000, areaSqKm: 187.0, website: 'https://www.newcastle.nsw.gov.au', libraryUrl: 'https://newcastle.nsw.gov.au/library', libraryName: 'Newcastle City Library', librarySuburb: 'Newcastle' },
  { id: 'lake-macquarie', name: 'Lake Macquarie City Council', region: 'nsw-regional', population: 217000, areaSqKm: 648.0, website: 'https://www.lakemac.nsw.gov.au', libraryUrl: 'https://lakemac.com.au/library', libraryName: 'Lake Macquarie Library', librarySuburb: 'Speers Point' },
  { id: 'wollongong-nsw', name: 'Wollongong City Council', region: 'nsw-regional', population: 222000, areaSqKm: 685.0, website: 'https://www.wollongong.nsw.gov.au', libraryUrl: 'https://library.wollongong.nsw.gov.au', libraryName: 'Wollongong City Libraries', librarySuburb: 'Wollongong' },
]

async function main() {
  console.log('Seeding NSW councils...')
  for (const c of NSW_COUNCILS) {
    const { libraryName, librarySuburb, libraryUrl, ...councilData } = c
    await prisma.council.upsert({
      where: { id: c.id },
      create: { ...councilData, state: 'NSW', libraryUrl },
      update: { ...councilData, state: 'NSW', libraryUrl },
    })
    // One library record (the main branch) for map pin + info card
    await prisma.library.upsert({
      where: { id: `${c.id}-main` },
      create: { id: `${c.id}-main`, councilId: c.id, name: libraryName, suburb: librarySuburb, url: libraryUrl },
      update: { name: libraryName, suburb: librarySuburb, url: libraryUrl },
    })
    console.log(`  ✓ ${c.name}`)
  }
  console.log(`Done. Seeded ${NSW_COUNCILS.length} NSW councils.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Run the seed**

```bash
npx tsx --env-file=.env.local scripts/seed-nsw-councils.ts
```

Expected output:
```
Seeding NSW councils...
  ✓ City of Sydney
  ✓ Inner West Council
  ... (20 lines)
Done. Seeded 20 NSW councils.
```

- [ ] **Step 3: Verify**

```bash
npx tsx --env-file=.env.local -e "
const { prisma } = require('./lib/prisma')
prisma.council.count({ where: { state: 'NSW' } })
  .then(n => console.log('NSW councils:', n))
  .finally(() => prisma.\$disconnect())
"
```

Expected: `NSW councils: 20`

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-nsw-councils.ts
git commit -m "feat: seed 20 NSW councils with library links"
```

---

## Task 5: NSW GeoJSON download script

**Files:**
- Create: `scripts/download-nsw-lga-geojson.ts`
- Generated: `public/nsw-lgas.geojson`

- [ ] **Step 1: Create download script**

```ts
// scripts/download-nsw-lga-geojson.ts
// Fetches NSW LGA boundaries from ABS ArcGIS REST API
// Output: public/nsw-lgas.geojson

import * as fs from 'fs'
import * as path from 'path'

// ABS ArcGIS REST — LGA 2021 layer, filter to NSW (STATE_CODE_2021 = '1')
// Max 2000 features per request; NSW has ~128 LGAs
const ABS_URL =
  'https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/LGA/MapServer/0/query?' +
  new URLSearchParams({
    where: "STATE_CODE_2021='1'",   // NSW state code
    outFields: 'LGA_CODE_2021,LGA_NAME_2021',
    f: 'geojson',
    geometryPrecision: '5',
    outSR: '4326',
    resultRecordCount: '200',
  })

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')        // remove parenthetical
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// NSW region mapping: assign each LGA to a sub-region
function getNswRegion(lgaName: string): string {
  const name = lgaName.toLowerCase()
  if (['sydney', 'inner west', 'waverley', 'randwick', 'woollahra', 'strathfield'].some(r => name.includes(r))) return 'sydney-inner'
  if (['north sydney', 'willoughby', 'mosman', 'lane cove', 'ryde', 'hunters hill', 'ku-ring-gai', 'hornsby', 'northern beaches'].some(r => name.includes(r))) return 'sydney-north'
  if (['parramatta', 'blacktown', 'penrith', 'hawkesbury', 'blue mountains', 'hills shire', 'cumberland'].some(r => name.includes(r))) return 'sydney-west'
  if (['liverpool', 'campbelltown', 'camden', 'wollondilly', 'fairfield', 'canterbury', 'georges river', 'bayside', 'sutherland'].some(r => name.includes(r))) return 'sydney-southwest'
  return 'nsw-regional'
}

async function main() {
  console.log('Fetching NSW LGA boundaries from ABS...')
  const res = await fetch(ABS_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = await res.json() as { features: { properties: Record<string, string>; geometry: unknown }[] }

  // Add lga_slug and lga_region properties
  const features = raw.features.map(f => ({
    ...f,
    properties: {
      ...f.properties,
      lga_slug: slugify(f.properties.LGA_NAME_2021 ?? ''),
      lga_name: f.properties.LGA_NAME_2021,
      lga_region: getNswRegion(f.properties.LGA_NAME_2021 ?? ''),
      lga_state: 'NSW',
    },
  }))

  const geojson = { type: 'FeatureCollection', features }
  const outPath = path.join(process.cwd(), 'public', 'nsw-lgas.geojson')
  fs.writeFileSync(outPath, JSON.stringify(geojson))
  console.log(`Written ${features.length} NSW LGA boundaries → ${outPath}`)
}

main().catch(console.error)
```

- [ ] **Step 2: Run the script**

```bash
npx tsx --env-file=.env.local scripts/download-nsw-lga-geojson.ts
```

Expected: `Written 128 NSW LGA boundaries → .../public/nsw-lgas.geojson`

- [ ] **Step 3: Verify the file**

```bash
node -e "const f=require('./public/nsw-lgas.geojson'); console.log('features:', f.features.length, 'sample:', f.features[0].properties.lga_name)"
```

Expected: `features: 128 sample: Sydney`

- [ ] **Step 4: Commit**

```bash
git add scripts/download-nsw-lga-geojson.ts public/nsw-lgas.geojson
git commit -m "feat: add NSW LGA GeoJSON boundaries (ABS 2021)"
```

---

## Task 6: Map page — state tabs + multi-state support

**Files:**
- Modify: `app/page.tsx`

This task adds state switching to the map without touching any existing VIC logic. Changes are additive only.

- [ ] **Step 1: Add state constants near the top of `app/page.tsx`** (after existing REGION_COLORS, before the component)

```ts
// State bounding boxes [sw, ne] for fitBounds
const STATE_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  VIC: [[140.96, -39.20], [149.98, -33.98]],
  NSW: [[140.99, -37.51], [153.64, -28.16]],
  QLD: [[137.99, -29.18], [153.55, -10.68]],
  SA:  [[128.99, -38.07], [141.00, -25.99]],
  WA:  [[112.92, -35.14], [129.00, -13.69]],
  TAS: [[143.83, -43.65], [148.48, -39.57]],
  ACT: [[148.76, -35.92], [149.40, -35.12]],
  NT:  [[129.00, -26.00], [138.00, -10.97]],
}

const NSW_REGION_COLORS: Record<string, string> = {
  'sydney-inner':    '#7c3aed',
  'sydney-north':    '#2563eb',
  'sydney-west':     '#ea580c',
  'sydney-southwest':'#16a34a',
  'nsw-regional':    '#0891b2',
}

const NSW_REGION_LABELS: Record<string, string> = {
  'sydney-inner':    'Inner Sydney',
  'sydney-north':    'North Sydney',
  'sydney-west':     'Western Sydney',
  'sydney-southwest':'South-West Sydney',
  'nsw-regional':    'NSW Regional',
}
```

- [ ] **Step 2: Add `activeState` state and `geojsonByState` ref inside the component**

In the component, after the existing `const [legendOpen, setLegendOpen] = useState(true)` line, add:

```ts
const [activeState, setActiveState] = useState<string>('VIC')
const geojsonByState = useRef<Record<string, unknown>>({})
```

- [ ] **Step 3: Add `switchState` callback** (after the existing `flyToCouncil` useCallback)

```ts
const switchState = useCallback(async (state: string) => {
  setActiveState(state)
  setActiveRegion(null)

  const map = mapRef.current
  if (!map) return

  // Fly to state bounds
  const bounds = STATE_BOUNDS[state]
  if (bounds) map.fitBounds(bounds, { padding: 40, duration: 800 })

  // Load GeoJSON for this state if not already cached
  if (state === 'VIC') {
    if (geojsonRef.current) {
      (map.getSource('lga-boundaries') as mapboxgl.GeoJSONSource)?.setData(geojsonRef.current as GeoJSON.FeatureCollection)
    }
    return
  }

  const filename = `${state.toLowerCase()}-lgas.geojson`
  if (!geojsonByState.current[state]) {
    try {
      const res = await fetch(`/${filename}`)
      if (res.ok) {
        geojsonByState.current[state] = await res.json()
      }
    } catch {
      console.warn(`No GeoJSON for ${state}`)
    }
  }

  const data = geojsonByState.current[state]
  if (data) {
    (map.getSource('lga-boundaries') as mapboxgl.GeoJSONSource)?.setData(data as GeoJSON.FeatureCollection)
  }
  // Reset opacity to uniform 0.25 for non-VIC states
  if (map.getLayer('lga-fill')) {
    map.setPaintProperty('lga-fill', 'fill-opacity', 0.25)
  }
}, [])
```

- [ ] **Step 4: Add State tabs to the map legend UI**

In the JSX, find the legend section (the `<div>` with the region legend buttons). Add state tabs **above** it:

```tsx
{/* State tabs — top of legend */}
<div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-white/20">
  {['VIC','NSW','QLD','SA','WA','TAS'].map(s => (
    <button
      key={s}
      type="button"
      onClick={() => switchState(s)}
      className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors ${
        activeState === s
          ? 'bg-white text-(--color-primary)'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {s}
    </button>
  ))}
</div>
```

- [ ] **Step 5: Make region legend show correct colors per state**

In the region legend buttons area, replace the hardcoded `REGION_COLORS`/`REGION_LABELS` usage with a derived variable:

```ts
// Derive which region set to show based on activeState
const regionColors = activeState === 'NSW' ? NSW_REGION_COLORS : REGION_COLORS
const regionLabels = activeState === 'NSW' ? NSW_REGION_LABELS : REGION_LABELS
```

Then replace all `REGION_COLORS[region]` → `regionColors[region]` and `REGION_LABELS[region]` → `regionLabels[region]` in the legend JSX.

- [ ] **Step 6: Update `/api/councils` call to pass state**

Change the existing fetch call from:
```ts
fetch('/api/councils').then(r => r.json()).then(setCouncils)
```
to:
```ts
fetch(`/api/councils?state=${activeState}`).then(r => r.json()).then(setCouncils)
```

And add `activeState` to the `useEffect` dependency array that does this fetch.

- [ ] **Step 7: Build check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx
git commit -m "feat: map page — state tabs, multi-state GeoJSON, fly-to-state"
```

---

## Task 7: Councils API + list page — state filter

**Files:**
- Modify: `app/api/councils/route.ts`
- Modify: `app/councils/page.tsx`

- [ ] **Step 1: Update the councils API to accept `?state=`**

Replace `app/api/councils/route.ts` entirely:

```ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region') ?? undefined
  const state = req.nextUrl.searchParams.get('state') ?? 'VIC'

  const councils = await prisma.council.findMany({
    where: {
      state,
      ...(region ? { region } : {}),
    },
    include: {
      stats: true,
      _count: { select: { libraries: true, events: true } },
    },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(councils)
}
```

- [ ] **Step 2: Update councils page to add state tabs and non-VIC cards**

Replace `app/councils/page.tsx` with:

```tsx
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { CouncilCard } from '@/components/CouncilCard'
import { NonVicCouncilCard } from '@/components/NonVicCouncilCard'
import { CouncilSearch } from './CouncilSearch'
import { StateTabs } from '@/components/StateTabs'

const VIC_REGION_KEYS = ['all', 'inner', 'eastern', 'southern', 'northern', 'western', 'outer', 'regional'] as const
const NSW_REGION_KEYS = ['all', 'sydney-inner', 'sydney-north', 'sydney-west', 'sydney-southwest', 'nsw-regional'] as const

const NSW_REGION_LABELS: Record<string, string> = {
  'sydney-inner': 'Inner Sydney', 'sydney-north': 'North Sydney',
  'sydney-west': 'Western Sydney', 'sydney-southwest': 'South-West Sydney',
  'nsw-regional': 'NSW Regional',
}

interface Props {
  searchParams: Promise<{ region?: string; q?: string; state?: string }>
}

export default async function CouncilsPage({ searchParams }: Props) {
  const { region: regionParam, q, state: stateParam } = await searchParams
  const t = await getTranslations('councils')
  const activeState = stateParam ?? 'VIC'

  const region = regionParam && regionParam !== 'all' ? regionParam : undefined

  const councils = await prisma.council.findMany({
    where: {
      state: activeState,
      ...(region ? { region } : {}),
    },
    include: {
      stats: true,
      _count: {
        select: {
          libraries: true,
          events: { where: { startAt: { gte: new Date() } } },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const filtered = q
    ? councils.filter(c => c.name.toLowerCase().includes(q.toLowerCase()))
    : councils

  const isVic = activeState === 'VIC'
  const regionKeys = isVic ? VIC_REGION_KEYS : NSW_REGION_KEYS

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-(--color-primary) mb-6">{t('heading')}</h1>

      {/* State tabs */}
      <StateTabs basePath="/councils" preserveParams={['region', 'q']} />

      {/* Region filter (per state) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {regionKeys.map(r => (
          <a
            key={r}
            href={`/councils?state=${activeState}&region=${r}`}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              (regionParam ?? 'all') === r
                ? 'bg-(--color-primary) text-white border-transparent'
                : 'border-gray-300 hover:border-(--color-primary)'
            }`}
          >
            {isVic
              ? t(`regions.${r}`)
              : r === 'all' ? 'All' : (NSW_REGION_LABELS[r] ?? r)}
          </a>
        ))}
      </div>

      <CouncilSearch
        councils={councils.map(c => ({ id: c.id, name: c.name, region: c.region }))}
        defaultValue={q}
        region={region}
        placeholder={t('search')}
      />

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm mt-8">No councils found.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        {filtered.map(c =>
          isVic ? (
            <CouncilCard
              key={c.id}
              id={c.id}
              name={c.name}
              region={c.region}
              population={c.population}
              libraryCount={c._count.libraries}
              eventCount={c._count.events}
            />
          ) : (
            <NonVicCouncilCard
              key={c.id}
              id={c.id}
              name={c.name}
              state={c.state}
              population={c.population}
              areaSqKm={c.areaSqKm}
              libraryUrl={c.libraryUrl}
              website={c.website}
            />
          )
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add app/api/councils/route.ts app/councils/page.tsx
git commit -m "feat: councils list — state tabs, non-VIC cards, NSW region filter"
```

---

## Task 8: Council detail page — non-VIC simplified layout

**Files:**
- Modify: `app/councils/[slug]/page.tsx`

The VIC path is completely unchanged. We add an early return for non-VIC councils.

- [ ] **Step 1: Add non-VIC layout as an early return**

In `app/councils/[slug]/page.tsx`, find the section after the council is fetched (`const council = await prisma.council.findUnique(...)`) and add an early return block **before** any VIC-specific rendering. Add this after the `if (!council) notFound()` check:

```tsx
// Non-VIC councils: simplified layout (no events/libraries tabs)
if (council.state !== 'VIC') {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-(--color-primary)">{council.name}</h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{council.state}</span>
          </div>
          <p className="text-sm text-gray-400">Council information</p>
        </div>
        <Link href="/councils" className="text-sm text-gray-400 hover:text-gray-600">← All Councils</Link>
      </div>

      {/* Library events card */}
      {council.libraryUrl && (
        <a
          href={council.libraryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-purple-600 text-white rounded-2xl px-6 py-5 mb-6 hover:bg-purple-700 transition-colors group"
        >
          <div>
            <p className="font-semibold text-lg">📚 Library Events &amp; Programs</p>
            <p className="text-purple-200 text-sm mt-0.5">Browse events, book clubs, children&apos;s programs and more</p>
          </div>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </a>
      )}

      {/* Basic info */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {council.population != null && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Population</p>
            <p className="text-xl font-bold text-(--color-primary)">{council.population.toLocaleString()}</p>
          </div>
        )}
        {council.areaSqKm != null && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Area</p>
            <p className="text-xl font-bold text-(--color-primary)">{council.areaSqKm.toLocaleString()} km²</p>
          </div>
        )}
        {council.website && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Website</p>
            <a href={council.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all">
              Visit council website ↗
            </a>
          </div>
        )}
      </div>

      {/* Demographics (if stats exist) */}
      {council.stats && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Demographics (ABS Census 2021)</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {council.stats.medianAge != null && (
              <div><span className="text-gray-400">Median age:</span> <strong>{council.stats.medianAge}</strong></div>
            )}
            {council.stats.overseasBornPct != null && (
              <div><span className="text-gray-400">Born overseas:</span> <strong>{council.stats.overseasBornPct.toFixed(1)}%</strong></div>
            )}
            {council.stats.medianHouseholdIncome != null && (
              <div><span className="text-gray-400">Median household income:</span> <strong>${council.stats.medianHouseholdIncome.toLocaleString()}/wk</strong></div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
// ... existing VIC layout continues unchanged below
```

Note: you need `Link` already imported (it is). You need to add `council.state` to the Prisma select — make sure the `prisma.council.findUnique` call includes `state` in its select or uses `select: undefined` (full model).

- [ ] **Step 2: Ensure `state` is selected in the council query**

Find the `prisma.council.findUnique({ where: { id: slug } ... })` call and make sure `state` is included. If the call uses `select: { ... }` (explicit fields), add `state: true`. If it selects all fields (no explicit `select`), it's already included.

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add "app/councils/[slug]/page.tsx"
git commit -m "feat: council detail — non-VIC simplified layout with library events CTA"
```

---

## Task 9: Events page — state filter + non-VIC notice

**Files:**
- Modify: `app/events/page.tsx`

- [ ] **Step 1: Add `state` to searchParams and `StateTabs` import**

At the top of `app/events/page.tsx`, add the import:
```ts
import { StateTabs } from '@/components/StateTabs'
```

In the `Props` interface, add `state?: string` to `searchParams`.

In the component, extract:
```ts
const { ..., state: stateParam } = await searchParams
const activeState = stateParam ?? 'VIC'
```

- [ ] **Step 2: Add StateTabs to JSX and non-VIC notice**

After the `<h1>` heading in the JSX, add `<StateTabs basePath="/events" />`.

Then, immediately after the StateTabs, add a conditional non-VIC notice block:

```tsx
{activeState !== 'VIC' && (
  <NonVicNotice state={activeState} />
)}
```

Create the `NonVicNotice` component inline (top of the file, below imports, before the default export):

```tsx
async function NonVicNotice({ state }: { state: string }) {
  const councils = await prisma.council.findMany({
    where: { state },
    select: { id: true, name: true, libraryUrl: true, website: true },
    orderBy: { name: 'asc' },
  })
  return (
    <div className="mb-8">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <p className="font-semibold text-amber-800 mb-1">📋 {state} event data not yet collected</p>
        <p className="text-sm text-amber-700">
          We don&apos;t scrape {state} council event systems yet. Visit each council&apos;s library website directly to find upcoming programs and events.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {councils.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-800 mb-2">{c.name}</p>
            {c.libraryUrl && (
              <a href={c.libraryUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-purple-700 hover:underline">
                📚 Library Events →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wrap existing VIC content in a conditional**

Find the section that renders the actual event filters and list. Wrap it:

```tsx
{activeState === 'VIC' && (
  // ... existing VIC events UI — completely unchanged
)}
```

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 5: Commit**

```bash
git add app/events/page.tsx
git commit -m "feat: events page — state tabs, non-VIC notice with council library links"
```

---

## Task 10: Libraries page — state filter + non-VIC notice

**Files:**
- Modify: `app/libraries/page.tsx`

- [ ] **Step 1: Add `state` param and `StateTabs` import**

```ts
import { StateTabs } from '@/components/StateTabs'
```

The page currently has no `searchParams` — it's a server component. Change its signature:

```tsx
interface Props {
  searchParams: Promise<{ state?: string }>
}

export default async function LibrariesPage({ searchParams }: Props) {
  const { state: stateParam } = await searchParams
  const activeState = stateParam ?? 'VIC'
```

- [ ] **Step 2: Add non-VIC notice (same pattern as events page)**

Create `NonVicLibraryNotice` component inline in `app/libraries/page.tsx`:

```tsx
async function NonVicLibraryNotice({ state }: { state: string }) {
  const councils = await prisma.council.findMany({
    where: { state },
    select: { id: true, name: true, libraryUrl: true },
    orderBy: { name: 'asc' },
  })
  return (
    <div className="mb-8">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <p className="font-semibold text-blue-800 mb-1">📚 {state} library branch data not yet collected</p>
        <p className="text-sm text-blue-700">
          We store one entry per {state} council. Visit each council&apos;s library website for full branch listings, opening hours, and services.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {councils.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-800 mb-2">{c.name}</p>
            {c.libraryUrl && (
              <a href={c.libraryUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-purple-700 hover:underline">
                📚 Library Website →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Scope existing library query to VIC and add state tabs to JSX**

Change the existing `prisma.library.findMany` call to filter by state:

```ts
// Only fetch VIC libraries for the detailed grouped view
const libraries = activeState === 'VIC'
  ? await prisma.library.findMany({
      where: { council: { state: 'VIC' } },
      orderBy: [{ councilId: 'asc' }, { name: 'asc' }],
    })
  : []
```

In the JSX, after the `<h1>`, add:

```tsx
<StateTabs basePath="/libraries" />

{activeState !== 'VIC' ? (
  <NonVicLibraryNotice state={activeState} />
) : (
  <>
    {/* existing NearbySearch + LibraryList + Sources — completely unchanged */}
  </>
)}
```

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output

- [ ] **Step 5: Commit**

```bash
git add app/libraries/page.tsx
git commit -m "feat: libraries page — state tabs, non-VIC notice with council library links"
```

---

## Task 11: Push branch

- [ ] **Step 1: Final build check**

```bash
npx tsc --noEmit && npx next build 2>&1 | tail -20
```

Expected: build succeeds, all routes listed.

- [ ] **Step 2: Push**

```bash
git push origin feat/national-expansion
```
