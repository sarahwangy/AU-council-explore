# Scraper Source Audit Results

> Date: 2026-06-10
> Task 5 of Melbourne Council Explorer MVP plan

## Summary

Audited 8 councils originally tagged as "Eventbrite" in planning docs. Findings:

| Council | True Source | Scraper Type | Notes |
|---|---|---|---|
| Boroondara | Official listing (Drupal) | HTML scraper | URL corrected: `/services/libraries-boroondara/library-events`. Pagination: `?page=N`. Selector: `.card.event-listing`. Eventbrite booking only (organizer `3074435448`). |
| Frankston | Official listing | Headless browser | Akamai CDN blocks curl. Deferred post-MVP. |
| Hobsons Bay | Official listing | Headless browser | Akamai CDN blocks curl. Deferred post-MVP. |
| Maribyrnong | Official listing (Civica/OpenCities) | HTML scraper | URL confirmed. Pagination: `pageindex=N` param. Selectors: `.list-item-title`, `.list-item-block-date`. 5 pages. |
| Brimbank | Official listing (WordPress) | HTML scraper | URL corrected: `events.brimbank.vic.gov.au`. Pagination: `_pagination=N`. |
| Darebin | Mixed (official + Eventbrite) | Headless browser | Akamai CDN blocks curl. Deferred post-MVP. |
| Merri-bek | Eventbrite (primary source) | Eventbrite API | Council page is a hub linking to Eventbrite. Organizer ID: `368932576`. |
| Yarra | Mixed (official + Eventbrite) | Headless browser | Cloudflare JS challenge. Deferred post-MVP. |

## MVP Scraper Plan (revised)

### Confirmed for MVP via HTML scraper:
- Boroondara — Drupal pagination
- Maribyrnong — Civica pagination
- Brimbank — WordPress subdomain

### Confirmed for MVP via Eventbrite API:
- Merri-bek — organizer ID `368932576`

### Deferred post-MVP (need headless browser):
- Frankston, Hobsons Bay, Darebin, Yarra

## Corrected URLs

| Council | Old URL | New URL |
|---|---|---|
| Boroondara | `/libraries/whats-on` | `/services/libraries-boroondara/library-events` |
| Brimbank | `/recreation-and-events/events/browse-all-events` | `https://events.brimbank.vic.gov.au` |
| Merri-bek | `/arts-culture-and-events/libraries` | unchanged (platform changed to eventbrite) |
