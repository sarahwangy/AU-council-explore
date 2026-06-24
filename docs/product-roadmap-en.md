# Australia Council Explorer — Product Roadmap

> Created: 2026-06-10
> Current stage: Melbourne MVP (Phase 1)

---

## Product Vision

Expand from Melbourne Council Explorer to cover all of Australia — ultimately 127 councils across Melbourne, Sydney, Brisbane, Adelaide, Perth, Geelong, Ballarat, Bendigo, and Darwin (NT).

**Final product name: Australia Council Explorer**

---

## Phase 1 ✅ Melbourne MVP (Complete)

**31 councils, full feature stack**

| Layer | Status |
|---|---|
| Database schema (5 Prisma models) | ✅ |
| Static data (31 councils seeded) | ✅ |
| ABS population data import script | ✅ |
| Scrapers (mylibrary.digital / Humanitix / Eventbrite) | ✅ |
| GitHub Actions daily cron | ✅ |
| API routes (/api/councils / /api/events) | ✅ |
| Homepage map (Mapbox) | ✅ |
| Council list page (region filter + search) | ✅ |
| Council detail page (3 tabs) | ✅ |
| Events calendar page (filter + pagination) | ✅ |
| Compare page (up to 3 councils) | ✅ |

**Pre-deploy checklist:**
1. Configure `.env.local` (Neon `DATABASE_URL` + `NEXT_PUBLIC_MAPBOX_TOKEN`)
2. `npx prisma migrate dev --name init`
3. `npx tsx scripts/seed-councils.ts`
4. Download ABS CSV → `npx tsx scripts/import-abs.ts`
5. Download Melbourne LGA GeoJSON (see `public/GEOJSON_README.md`)
6. Push to GitHub, deploy on Vercel, configure Secrets

---

## Phase 2 — Demographics Expansion + Favourites

### 2a — Richer Council Demographics

**New data on the Council detail Overview tab (source: ABS Census)**

#### Age Distribution (ABS G16)

| Age group | Relevance |
|---|---|
| 0–4 | Childcare age — families looking for Storytime / early childhood activities |
| 5–11 | Primary school age |
| 12–17 | Secondary school age |
| 18–64 | Working-age population |
| 65+ | Ageing population indicator |

Display: horizontal progress bars, comparable across councils.

#### Cultural Diversity (ABS G01 / G08)

- Overseas-born population percentage
- Main languages spoken at home (English / Mandarin / Vietnamese / Hindi / other)

#### Socioeconomic (ABS G17 / G25)

- Median weekly household income
- Renting vs. owning ratio
- Average household size

**Work required:**
- Download ABS G16 table (age groups), same process as G01
- Extend `CouncilStats` model with age group fields
- Update `scripts/import-abs.ts` to process G16
- Update council detail Overview tab UI

### 2b — Childcare / School Facilities Tab (Phase 3+)

Future Facilities tab on council detail pages:

| Facility type | Data source | Notes |
|---|---|---|
| Childcare centres | ACECQA national register (public CSV) | Includes address, rating, phone |
| Primary schools | ACARA My School (API) | Includes school type, ICSEA score |
| Secondary schools | ACARA My School (API) | Same as above |
| VIC school coordinates | data.vic.gov.au | Ready-to-download dataset |

**Display:** Small map + list, sortable by distance or name.

**Why not now:** Requires new data source integrations; decoupled from current MVP deployment. Moved to Phase 3.

---

## Phase 2 — Favourites Feature

**Users can favourite councils / libraries and see only relevant events**

### MVP (no login, localStorage)

| Feature | Description |
|---|---|
| Favourite council | Star ☆/★ on each council card, saved to localStorage |
| Favourite library | Star on each library card |
| `/my-events` page | Shows only upcoming events within favourited scope, grouped by date |
| Booking badge | Each event shows source: `Book on Eventbrite` / `Humanitix` / `No booking required` |
| Data source badge | Shows `Official` / `Eventbrite` / `mylibrary.digital` etc. |
| `Updated X hours ago` | Shows scrape timestamp |
| Empty state | Guides user to `/councils` to pick favourites when list is empty |

### Extended (when needed)

| Feature | When |
|---|---|
| Login + cross-device sync | Phase 2 later |
| Favourite categories | Same |
| Saved view presets (My councils / My libraries) | Same |
| Email alerts for new events | Phase 3 |
| Weekly digest | Phase 3 |

### Multi-language Support

Suggested order: Simplified Chinese → English → Vietnamese → Hindi

- Use `next-intl`
- All UI copy in locale files, not hardcoded in components
- Prioritise: nav / filters / empty states / buttons / booking badges
- Content translation (event titles/descriptions) is phase 2

### Data Model

```prisma
// localStorage version needs no DB tables
// If login is added later:

model FavoriteCouncil {
  id        String   @id @default(cuid())
  userId    String
  councilId String
  createdAt DateTime @default(now())
  @@unique([userId, councilId])
}

model FavoriteLibrary {
  id        String   @id @default(cuid())
  userId    String
  libraryId String
  createdAt DateTime @default(now())
  @@unique([userId, libraryId])
}
```

### New API Routes

- `GET /api/events?favoritesOnly=true&cursor=...&limit=20`
- `GET /api/my-events` (aggregated endpoint, handles favourite filtering internally)

---

## Phase 3 — Ballarat + Bendigo (Quick wins)

**2 councils, uses existing scrapers, estimated 1 day**

| Council | Platform | Work |
|---|---|---|
| Ballarat | Humanitix (`ballaratlibraries`) | Add to Humanitix config |
| Bendigo (Greater Bendigo) | Eventbrite (organizer `12180122178`) | Add to Eventbrite config |

Add `city` field to DB:
```sql
ALTER TABLE "Council" ADD COLUMN city TEXT NOT NULL DEFAULT 'melbourne';
```

---

## Phase 4 — Brisbane (10 councils, 1–2 weeks)

| Platform | Councils | Effort |
|---|---|---|
| mylibrary.digital | Moreton Bay, Logan, Scenic Rim | Add to config (~5 min each) |
| Eventbrite | Redland City | Add to config |
| Custom scraper | Brisbane BCC (SirsiDynix), Ipswich, Gold Coast, Sunshine Coast, Lockyer Valley, Somerset | Prioritise BCC (Australia's largest council) |

---

## Phase 5 — Adelaide (19 councils, 1–2 weeks)

| Platform | Councils | Effort |
|---|---|---|
| Humanitix | Adelaide City, Campbelltown SA, NP&StP, Port Adelaide Enfield | Add to config |
| Eventbrite | Marion, Mitcham, Onkaparinga, Salisbury, Tea Tree Gully, Walkerville | Add to config |
| Custom scraper | Charles Sturt, Holdfast Bay, Mount Barker, Playford, Prospect, Unley, Victor Harbor, West Torrens | Prioritise Charles Sturt / Onkaparinga |

---

## Phase 6 — Sydney (33 councils, 3–4 weeks)

Most complex — highest number of custom sites (13).

| Platform | Councils | Effort |
|---|---|---|
| mylibrary.digital | Fairfield | Add to config |
| Humanitix | Liverpool, Northern Beaches, Penrith, Randwick | Add to config |
| Eventbrite | Blacktown, Blue Mountains, Campbelltown, Canada Bay, Canterbury-Bankstown, Georges River, Hawkesbury, Hills Shire, Inner West, Parramatta, Sutherland, Sydney CoS + 2 more | Find organizer_ids, add to config |
| Custom scraper | Ku-ring-gai, Waverley, Willoughby, Ryde, Strathfield, Mosman, Wollondilly + 6 more | Prioritise top 5 by population |

---

## Phase 7 — Perth (30 councils, 3–4 weeks)

| Platform | Councils | Effort |
|---|---|---|
| mylibrary.digital | Cockburn, Vincent | Add to config |
| Humanitix | Armadale, Fremantle, Serpentine-Jarrahdale, South Perth, Stirling, Swan | Add to config |
| Eventbrite | Canning, Gosnells, Kwinana, Melville, Rockingham | Add to config |
| Custom scraper | Joondalup, Bayswater, Cambridge, Wanneroo, Nedlands + 10 more | Prioritise Stirling / Wanneroo / Joondalup |

---

## Phase 8 — Geelong + Darwin (Optional)

| Council | Platform | Notes |
|---|---|---|
| Greater Geelong | Communico (`events.grlc.vic.gov.au`) | New platform — check for `/api/events` JSON endpoint first; reusable if found |
| Darwin (NT) | TBD | NT has only Darwin City Council; smaller library footprint; platform TBD |

---

## Scraper Effort Summary

### No new scraper needed (config only)

| Platform | New councils |
|---|---|
| mylibrary.digital | 6 (Fairfield + Moreton Bay + Logan + Scenic Rim + Cockburn + Vincent) |
| Humanitix API | 16 |
| Eventbrite API | 27 |
| **Total** | **49 councils — config only** |

### Custom scrapers required

| City | Custom sites | Priority |
|---|---|---|
| Sydney | 13 | Medium (start with top 5 by population) |
| Brisbane | 6 (incl. BCC) | High (BCC is Australia's largest) |
| Adelaide | 8 | Low |
| Perth | 15 | Low |
| Geelong | 1 (Communico — new platform) | Medium (reusable) |

---

## URL Structure

Nationally unique slug (recommended):
```
/councils/monash-vic
/councils/blacktown-nsw
/councils/brisbane-city-qld
/councils/adelaide-city-sa
```

Or city-prefixed:
```
/cities/melbourne/councils/monash
/cities/sydney/councils/blacktown
```

---

## Milestone Timeline

| Phase | Scope | Estimated time |
|---|---|---|
| Phase 1 ✅ | Melbourne 31 councils, full MVP | Complete |
| Phase 2 | Favourites + multi-language | 1–2 weeks post-deploy |
| Phase 3 | Ballarat + Bendigo | 1 day |
| Phase 4 | Brisbane 10 councils | 1–2 weeks |
| Phase 5 | Adelaide 19 councils | 1–2 weeks |
| Phase 6 | Sydney 33 councils | 3–4 weeks |
| Phase 7 | Perth 30 councils | 3–4 weeks |
| Phase 8 | Geelong + Darwin | 1 week |
| **Done** | **127 councils nationally — renamed Australia Council Explorer** | — |

---

*Consolidated from `docs/city-council-扩展.md` and `docs/council-ask-feature-codex.md`. Generated by Claude Code on 2026-06-10.*
