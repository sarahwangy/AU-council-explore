import type { ScrapedEvent } from './types'

interface HumanitixEvent {
  _id: string
  slug?: string
  name: string
  startDate: string
  endDate?: string
  location?: {
    name?: string
    venueName?: string
  }
  url?: string
}

interface HumanitixApiResponse {
  events: HumanitixEvent[]
  totalCount?: number
  hasMore?: boolean
}

/**
 * Scrapes events from Humanitix for a given host slug.
 *
 * Humanitix has a public API at api.humanitix.com/v1 that requires an API key.
 * If HUMANITIX_API_KEY is set, it will be used. Otherwise the scraper falls back
 * to HTML scraping of the events.humanitix.com host page.
 *
 * Note: as of mid-2025 the host slug "wyndham-city-libraries" does not return
 * results on the public Humanitix platform (the page renders a "Not Found" /
 * "No Events" state), so the scraper will return an empty array until the
 * organiser re-publishes events under that slug.
 */
export async function scrapeHumanitix(hostSlug: string): Promise<ScrapedEvent[]> {
  const apiKey = process.env.HUMANITIX_API_KEY

  if (apiKey) {
    return scrapeHumanitixViaApi(hostSlug, apiKey)
  }

  // Fall back to HTML scraping
  return scrapeHumanitixViaHtml(hostSlug)
}

async function scrapeHumanitixViaApi(
  hostSlug: string,
  apiKey: string,
): Promise<ScrapedEvent[]> {
  const results: ScrapedEvent[] = []
  let page = 1
  const pageSize = 50

  try {
    while (true) {
      const url = new URL('https://api.humanitix.com/v1/events')
      url.searchParams.set('hostSlug', hostSlug)
      url.searchParams.set('page', String(page))
      url.searchParams.set('pageSize', String(pageSize))
      url.searchParams.set('status', 'published')

      const res = await fetch(url.toString(), {
        headers: {
          'x-api-key': apiKey,
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        console.error(`  Humanitix API error ${res.status} for ${hostSlug}`)
        break
      }

      const data: HumanitixApiResponse = await res.json()
      const events = data.events ?? []

      for (const ev of events) {
        results.push(mapHumanitixEvent(ev, hostSlug))
      }

      if (!data.hasMore || events.length < pageSize) break
      page++
    }
  } catch (err) {
    console.error(`  Humanitix API scrape error for ${hostSlug}:`, err)
  }

  return results
}

async function scrapeHumanitixViaHtml(hostSlug: string): Promise<ScrapedEvent[]> {
  const results: ScrapedEvent[] = []

  try {
    const res = await fetch(`https://events.humanitix.com/host/${hostSlug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CouncilExplorerBot/1.0)',
        Accept: 'text/html',
      },
    })

    if (!res.ok) {
      console.warn(`  Humanitix HTML fetch failed with ${res.status} for ${hostSlug}`)
      return []
    }

    const html = await res.text()

    // Humanitix renders via Svelte SSR — look for JSON-LD structured data
    const jsonLdMatches = html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    )

    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1])
        const items: unknown[] = Array.isArray(data)
          ? data
          : data['@graph']
          ? data['@graph']
          : [data]

        for (const item of items) {
          const ev = item as Record<string, unknown>
          if (ev['@type'] !== 'Event') continue

          const name = String(ev['name'] ?? '')
          const startDateRaw = String(ev['startDate'] ?? '')
          const endDateRaw = ev['endDate'] ? String(ev['endDate']) : undefined
          const url = ev['url'] ? String(ev['url']) : undefined
          const locationRaw = ev['location'] as Record<string, unknown> | undefined
          const venue = locationRaw?.name ? String(locationRaw.name) : undefined

          if (!name || !startDateRaw) continue

          const startAt = new Date(startDateRaw)
          if (isNaN(startAt.getTime())) continue

          const endAt = endDateRaw ? new Date(endDateRaw) : undefined
          const externalId = url ? url.split('/').filter(Boolean).pop() : undefined

          results.push({ title: name, startAt, endAt, venue, bookingUrl: url, externalId })
        }
      } catch {
        // skip malformed JSON-LD
      }
    }

    if (results.length === 0) {
      // Check for "no events" indicator to avoid false silence
      if (html.includes('NoEvents') || html.includes('no-events')) {
        console.log(`  Humanitix: no upcoming events found for ${hostSlug}`)
      } else if (html.includes('Not Found') || html.includes('not-found')) {
        console.warn(`  Humanitix: host slug not found — ${hostSlug}`)
      }
    }
  } catch (err) {
    console.error(`  Humanitix HTML scrape error for ${hostSlug}:`, err)
  }

  return results
}

function mapHumanitixEvent(ev: HumanitixEvent, hostSlug: string): ScrapedEvent {
  const startAt = new Date(ev.startDate)
  const endAt = ev.endDate ? new Date(ev.endDate) : undefined
  const slug = ev.slug ?? ev._id
  const bookingUrl = `https://events.humanitix.com/host/${hostSlug}/${slug}`
  const venue = ev.location?.venueName ?? ev.location?.name

  return {
    title: ev.name,
    startAt,
    endAt,
    venue,
    bookingUrl,
    externalId: ev._id,
  }
}
