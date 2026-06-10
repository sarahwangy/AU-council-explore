import * as cheerio from 'cheerio'
import type { ScrapedEvent } from './types'

const USER_AGENT = 'Mozilla/5.0 (compatible; MelbourneCouncilExplorer/1.0)'

/**
 * Scrape events from mylibrary.digital-based library event sites.
 *
 * These sites use a shared platform where events are loaded via a POST to /update
 * with fetch_upcoming_events=true. The response is JSON containing an HTML
 * fragment of <li> event items.
 *
 * Note: Some sites (*.events.mylibrary.digital subdomains) are behind Cloudflare's
 * managed challenge and will return 403. The scraper skips those gracefully.
 */
export async function scrapeMyLibraryDigital(baseUrl: string): Promise<ScrapedEvent[]> {
  const events: ScrapedEvent[] = []

  // The platform loads events via POST /update rather than paginated HTML pages.
  // fetch_one_day_only=false returns all upcoming events in one request.
  const url = `${baseUrl.replace(/\/$/, '')}/update`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': baseUrl,
    },
    body: new URLSearchParams({
      fetch_upcoming_events: 'true',
      date: '',
      fetch_one_day_only: 'false',
    }).toString(),
  })

  if (!res.ok) {
    console.error(`  fetch failed: ${res.status} ${url}`)
    return events
  }

  let json: { status: number; content?: { upcoming_events_list_html?: string } }
  try {
    json = await res.json()
  } catch {
    console.error(`  non-JSON response from ${url}`)
    return events
  }

  if (json.status !== 200 || !json.content?.upcoming_events_list_html) {
    console.error(`  unexpected response status ${json.status} from ${url}`)
    return events
  }

  const html = json.content.upcoming_events_list_html
  const $ = cheerio.load(html)

  $('li[role="listitem"]').each((_, el) => {
    const anchor = $(el).find('a[data-event-id]').first()
    const externalId = anchor.attr('data-event-id')
    const href = anchor.attr('href')

    const title = anchor.find('.h6').first().text().trim()
    const category = anchor.find('small.text-muted').first().text().trim() || undefined

    // Date/venue text: "Venue - 3:30PM on Wed 10 Jun"
    // Kingston/Melton/Moonee Valley use: <p><span class="mr-2">Venue - time on date</span>...
    // Maroondah uses: <p>Venue - date<span class="ml-2 ...">...
    // So we try the <span class="mr-2"> first, then fall back to the raw text node of <p>
    let dateVenueText = anchor.find('p .mr-2').first().text().trim()
    if (!dateVenueText) {
      // Get text content of <p> excluding child element text (first text node only)
      const pEl = anchor.find('p').first()
      dateVenueText = pEl.contents().filter((_, n) => n.type === 'text').first().text().trim()
      // If that's still empty, fall back to full p text stripped of span content
      if (!dateVenueText) {
        const fullText = pEl.text().trim()
        // Remove trailing "Series", "Ongoing", "Fully Booked" type words
        dateVenueText = fullText.split(/\s{2,}/)[0].trim()
      }
    }

    if (!title || !dateVenueText) return

    const { venue, startAt } = parseDateVenue(dateVenueText)
    if (!startAt) return

    const bookingUrl = href
      ? href.startsWith('http')
        ? href
        : new URL(href, baseUrl).href
      : undefined

    events.push({
      title,
      category,
      venue,
      startAt,
      bookingUrl,
      externalId: externalId || undefined,
    })
  })

  return events
}

/**
 * Parse the combined venue/date text used by the mylibrary.digital platform.
 * Format: "Venue Name - 3:30PM on Wed 10 Jun"
 * No year is included; we assume the current or next occurrence.
 */
function parseDateVenue(text: string): { venue: string | undefined; startAt: Date | null } {
  // Split on " - " to separate venue from date/time
  const dashIdx = text.indexOf(' - ')
  let venue: string | undefined
  let datePart: string

  if (dashIdx !== -1) {
    venue = text.slice(0, dashIdx).trim() || undefined
    datePart = text.slice(dashIdx + 3).trim()
  } else {
    datePart = text.trim()
  }

  // Handle date ranges "9 Jun 2026 – 7 Aug 2026" - take just the start date
  datePart = datePart.split(/\s*[–—-]\s*(?=\d)/)[0].trim()

  // Remove "on " prefix if present: "3:30PM on Wed 10 Jun" -> "3:30PM Wed 10 Jun"
  datePart = datePart.replace(/^on\s+/i, '').replace(/\s+on\s+/i, ' ')

  // Try direct parse first (handles many formats)
  const direct = new Date(datePart)
  if (!isNaN(direct.getTime())) {
    return { venue, startAt: direct }
  }

  // Handle "3:30PM Wed 10 Jun" or "Wed 10 Jun" patterns (no year)
  // Match: optional time, optional day-of-week, day-number, month-name
  const match = datePart.match(
    /^(?:(\d{1,2}:\d{2}(?:AM|PM)?)\s+)?(?:\w{3}\s+)?(\d{1,2})\s+(\w{3,9})(?:\s+(\d{4}))?/i
  )

  if (match) {
    // Normalise time: "3:30PM" -> "3:30 PM" so JS Date can parse it
    const rawTime = match[1] ?? ''
    const timeStr = rawTime.replace(/(\d)(AM|PM)$/i, '$1 $2')
    const day = match[2]
    const monthStr = match[3]
    const year = match[4] ?? String(guessYear(day, monthStr))

    const parseTry = new Date(`${day} ${monthStr} ${year} ${timeStr}`)
    if (!isNaN(parseTry.getTime())) {
      return { venue, startAt: parseTry }
    }
  }

  return { venue, startAt: null }
}

/**
 * Guess the year for a given day + month string.
 * If the date has already passed this year, assume next year.
 */
function guessYear(day: string, monthStr: string): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const candidate = new Date(`${day} ${monthStr} ${currentYear}`)
  // If the date is more than 30 days in the past, assume it's next year
  if (!isNaN(candidate.getTime()) && candidate.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
    return currentYear + 1
  }
  return currentYear
}
