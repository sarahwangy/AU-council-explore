import type { ScrapedEvent } from './types'

interface EventbriteVenue {
  name?: string
  address?: {
    localized_address_display?: string
  }
}

interface EventbriteEvent {
  id: string
  name: { text: string }
  start: { utc: string; local: string }
  end?: { utc: string; local: string }
  url: string
  venue?: EventbriteVenue
  status: string
}

interface EventbriteResponse {
  events: EventbriteEvent[]
  pagination: {
    has_more_items: boolean
    continuation?: string
  }
}

/**
 * Scrapes events from the Eventbrite v3 API for a given organizer ID.
 *
 * Requires EVENTBRITE_TOKEN env var (a private/public OAuth token from
 * https://www.eventbrite.com/account-settings/apps). If not set the scraper
 * skips gracefully and returns an empty array.
 */
export async function scrapeEventbrite(organizerId: string): Promise<ScrapedEvent[]> {
  const token = process.env.EVENTBRITE_TOKEN
  if (!token) {
    console.warn(`  EVENTBRITE_TOKEN not set — skipping organizer ${organizerId}`)
    return []
  }

  const results: ScrapedEvent[] = []
  let continuation: string | undefined

  try {
    while (true) {
      const url = new URL(
        `https://www.eventbriteapi.com/v3/organizers/${organizerId}/events/`,
      )
      url.searchParams.set('status', 'live')
      url.searchParams.set('expand', 'venue')
      url.searchParams.set('page_size', '50')
      if (continuation) {
        url.searchParams.set('continuation', continuation)
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.text()
        console.error(
          `  Eventbrite API error ${res.status} for organizer ${organizerId}: ${body.slice(0, 200)}`,
        )
        break
      }

      const data: EventbriteResponse = await res.json()
      const events = data.events ?? []

      for (const ev of events) {
        if (ev.status !== 'live' && ev.status !== 'started') continue
        results.push(mapEventbriteEvent(ev))
      }

      if (!data.pagination?.has_more_items) break
      continuation = data.pagination.continuation
      if (!continuation) break
    }
  } catch (err) {
    console.error(`  Eventbrite scrape error for organizer ${organizerId}:`, err)
  }

  return results
}

function mapEventbriteEvent(ev: EventbriteEvent): ScrapedEvent {
  const startAt = new Date(ev.start.utc)
  const endAt = ev.end?.utc ? new Date(ev.end.utc) : undefined
  const venue =
    ev.venue?.name ??
    ev.venue?.address?.localized_address_display

  return {
    title: ev.name.text,
    startAt,
    endAt,
    venue,
    bookingUrl: ev.url,
    externalId: ev.id,
  }
}
