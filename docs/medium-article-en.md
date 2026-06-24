# How I Built a Nationwide Australia Community Explorer in One Week

> Vibe coding a full-stack geo-app: real data, real bugs, real AI workflows.

---

I did not plan this project. One afternoon I was trying to find a childcare centre near a suburb I was considering moving to, and I ended up with twelve browser tabs open — each a different council website, each with its own PDF, none with a map. That was the moment I decided to build my way out of the problem.

One week later: **Australia Council Explorer**, an interactive map that aggregates liveability data from every Australian state into one searchable interface.

---

## The Problem

Moving to Australia means navigating a fragmented web of local government websites. Want to find a childcare centre? That's one site. Nearest hospital? Another. Local playgrounds? Third one. Each with its own format, no map view, no way to compare.

So I built a single platform where you can:

- Browse every Australian council on an interactive map
- See upcoming library events, childcare centres, hospitals, and playgrounds
- Compare suburbs side-by-side on a Liveability Score
- Enter any address and check which school zone you're in
- Search across all of Australia at once

**This is for new immigrants, families moving cities, anyone trying to figure out where to actually live.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router |
| Database | Prisma 5 + Neon PostgreSQL |
| Maps | Mapbox GL JS |
| Styles | Tailwind CSS v4 |
| AI Search | Anthropic Claude Haiku |
| Geocoding | Mapbox Geocoding API + Nominatim (OSM) |
| Automation | GitHub Actions daily cron |
| Deployment | Vercel |

Data comes from ABS Census, ACECQA national childcare register (6,303 VIC services), OSM Overpass (hospitals, playgrounds), and three event platforms: mylibrary.digital, Humanitix, and Eventbrite. Scrapers run automatically every night at 1am AEST.

---

## The Vibe Coding Process

"Vibe coding" gets used loosely — sometimes it just means throwing prompts at AI until something compiles. That's not what I mean. On this project it meant using Claude Code as a structured collaborator at every phase, with a methodology called **Superpowers** that enforces discipline at each stage.

### Brainstorming before code

The liveability score formula was a design question with no obvious answer. Before touching any code, I used the brainstorming skill to explore it with Claude. The session surfaced questions I hadn't considered: should distance matter more than count? Should childcare weight higher for family suburbs vs retiree suburbs? Should the score be absolute or relative to the state average?

After working through the options, I landed on a simple, transparent formula — childcare and hospital coverage each at 30%, library and playground density each at 20%. The more important output from the brainstorm wasn't the formula itself. It was the decision to make the score *transparent*: every suburb page shows the breakdown tile-by-tile, not just a single number. Users should be able to verify what they're seeing.

### File paths before functions

For every significant feature, I generated an implementation plan before writing a line of code. What files get created, what each one does, what it imports. This sounds tedious. It isn't — it makes the actual coding mechanical. No mid-implementation "wait, where does this go?" No accidental coupling between files.

### One agent per scraper

The data pipeline had five distinct scrapers: ACECQA childcare, OSM hospitals, OSM playgrounds, and three event platforms. These are genuinely independent — different APIs, different data shapes, different failure modes. Each scraper was built by a dedicated subagent with a fresh context window. The isolation paid off immediately: when the Humanitix scraper started returning errors, I could debug it without touching anything else.

### Root cause before any fix

The hardest bug of the week: clicking a hospital in the sidebar list made the map flicker and nothing happened. Systematic debugging starts with one question — *what changed just before the symptom?* The answer was `selectedId`. Tracing that forward revealed the real cause: a missing `useMemo` two levels upstream was triggering a full map rebuild on every state update, which cleared the popup reference store before the fly-to effect could use it. Twenty minutes with a structured trace. Without the methodology, I'd have spent hours looking at the wrong code.

### Actually test it before shipping

Before marking the nationwide council search feature done, I ran deliberate end-to-end checks — not unit tests, but real user flows: search "Parramatta", confirm the map switches from VIC to NSW and flies to the correct boundary; test on a slow network, confirm no silent timeouts. Two issues surfaced. Fixed before shipping.

---

## Building the Data Pipeline

The ACECQA national childcare register is an extraordinary public resource — 6,303 Victorian services with quality ratings, operating hours, and addresses, all publicly available. Getting it into the database required parsing a CSV with quoted fields containing commas (standard parsers break on this), geocoding 6,303 addresses via Mapbox, and upserting with deduplication logic so the script can be re-run safely.

For playgrounds from OSM: 86% had no name. Not a blocker. Every one of them has coordinates, and coordinates can be reverse-geocoded into human-readable names via Nominatim in an overnight batch job. The script queries only unnamed records each run, so it can be killed and restarted at any point without double-processing. Result: 5,929 out of 6,054 playgrounds named (97.9%).

---

## The Liveability Score

Each suburb's score is computed at request time from raw facility counts within 5km — not stored in the database. This means it updates automatically as scrapers refresh data. The benchmarks are relative: the median density across all councils in the database. A score of 100 means you're at the median, not perfect. This keeps scores stable as total data grows and makes comparisons meaningful.

Early versions of council pages showed raw counts: *14 childcare centres, 2 hospitals, 8 playgrounds.* Users would stare at those numbers and not know what to make of them. The liveability score — a single 0–100 number with a colour — is immediately actionable. The compare page answers "compared to what?".

---

## Nationwide Search

The home page search started as a VIC-only filter. The upgrade: type any council name in Australia, hit enter, the map switches state and flies precisely to that council's boundary. The technical change was maybe four hours of work. The perceived scope of the tool doubled. First-class search is disproportionately impactful.

One implementation detail that mattered: the original fly-to used a fixed 900ms delay after a state switch, waiting for GeoJSON to load. That failed on slow connections and wasted time on fast ones. Replacing it with a polling loop — check for readiness every 100ms, max 4 seconds — made it adaptive. Flies as soon as data is ready on fast connections; waits on slow ones without timing out.

---

## What I Learned

**Aggregation is the product.** Each data source — playgrounds, hospitals, libraries — is findable through other means. The value here is a single interface where you see all of them together, compare two suburbs side-by-side, and ask "which council near Sydney has the best childcare density?" The composite liveability score crystallises this: a number that didn't exist before, computed from data that was always public.

**Government open data is genuinely rich.** The ACECQA register, ABS census geographic data, OSM coverage in Australian cities — the limiting factor is not data availability. It's the work of pulling it together. A lot of open data problems are like this: the data isn't missing, it's just in a different place.

**Poll for async readiness, don't use fixed timeouts.** Network speed, CDN latency, device performance — these are uncontrollable variables. A fixed timeout is a bet. Polling is a condition check. Wherever you're waiting for an external resource to be ready, polling is almost always more reliable.

**Planning isn't overhead — it's the work.** When I followed the brainstorm → plan → implement → verify sequence, I shipped. When I skipped planning and jumped straight to coding, I rewrote things.

---

## This is MVP 1

The app works, it's live, and it already solves the original problem. But this is the beginning, not the end.

The roadmap: Brisbane, Sydney, Adelaide, and Perth councils, richer demographic data, AI natural language search ("which council near Sydney has the most childcare?"), email digests for local events, full multi-language support. The scraper infrastructure is built — most remaining councils need config entries, not new scrapers.

I'll keep building this because the problem it solves is real and ongoing.

---

We're living in a moment where the gap between "I wish this existed" and "I built it" has never been smaller. If you have a pain point, a question no existing product answers, or a dataset you wish someone would make useful — try building it. Use AI as your co-pilot. You don't need to be an expert. You need a clear problem and the willingness to iterate.

**Live:** [au-council-explore.vercel.app](https://au-council-explore.vercel.app)\
**GitHub:** [github.com/sarahwangy/AU-council-explore](https://github.com/sarahwangy/AU-council-explore)

---

*#NextJS #Mapbox #FullStack #Australia #OpenData #TypeScript #VibeCoding #NewImmigrant*
