import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import type { ScrapedEvent } from './types'

// Councils blocked by Cloudflare when using server-side fetch.
// This scraper uses a real headless browser to bypass the challenge.
export const CLOUDFLARE_COUNCILS = [
  { councilId: 'monash', url: 'https://monlib.events.mylibrary.digital' },
  { councilId: 'bayside', url: 'https://bayside.events.mylibrary.digital' },
  { councilId: 'stonnington', url: 'https://stonnington.events.mylibrary.digital' },
  { councilId: 'hume', url: 'https://humelibraries.events.mylibrary.digital' },
]

export async function scrapeMyLibraryPlaywright(baseUrl: string): Promise<ScrapedEvent[]> {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  })
  const page = await context.newPage()

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 })

    // Wait for the event list to render
    await page.waitForSelector('li[role="listitem"]', { timeout: 15000 }).catch(() => null)

    const html = await page.content()
    return parseEventListHtml(html, baseUrl)
  } finally {
    await browser.close()
  }
}

function parseEventListHtml(html: string, baseUrl: string): ScrapedEvent[] {
  const events: ScrapedEvent[] = []
  const $ = cheerio.load(html)

  $('li[role="listitem"]').each((_, el) => {
    const anchor = $(el).find('a[data-event-id]').first()
    const externalId = anchor.attr('data-event-id')
    const href = anchor.attr('href')

    const title = anchor.find('.h6').first().text().trim()
    const category = anchor.find('small.text-muted').first().text().trim() || undefined

    let dateVenueText = anchor.find('p .mr-2').first().text().trim()
    if (!dateVenueText) {
      const pEl = anchor.find('p').first()
      dateVenueText = pEl.contents().filter((_, n) => n.type === 'text').first().text().trim()
      if (!dateVenueText) {
        dateVenueText = pEl.text().trim().split(/\s{2,}/)[0].trim()
      }
    }

    if (!title || !dateVenueText) return

    const { venue, startAt } = parseDateVenue(dateVenueText)
    if (!startAt) return

    const bookingUrl = href
      ? href.startsWith('http') ? href : new URL(href, baseUrl).href
      : undefined

    events.push({ title, category, venue, startAt, bookingUrl, externalId: externalId || undefined })
  })

  return events
}

function parseDateVenue(text: string): { venue: string | undefined; startAt: Date | null } {
  const dashIdx = text.indexOf(' - ')
  let venue: string | undefined
  let datePart: string

  if (dashIdx !== -1) {
    venue = text.slice(0, dashIdx).trim() || undefined
    datePart = text.slice(dashIdx + 3).trim()
  } else {
    datePart = text.trim()
  }

  datePart = datePart.split(/\s*[–—-]\s*(?=\d)/)[0].trim()
  datePart = datePart.replace(/^on\s+/i, '').replace(/\s+on\s+/i, ' ')

  const direct = new Date(datePart)
  if (!isNaN(direct.getTime())) return { venue, startAt: direct }

  const match = datePart.match(
    /^(?:(\d{1,2}:\d{2}(?:AM|PM)?)\s+)?(?:\w{3}\s+)?(\d{1,2})\s+(\w{3,9})(?:\s+(\d{4}))?/i
  )
  if (match) {
    const timeStr = (match[1] ?? '').replace(/(\d)(AM|PM)$/i, '$1 $2')
    const day = match[2]
    const monthStr = match[3]
    const year = match[4] ?? String(guessYear(day, monthStr))
    const parsed = new Date(`${day} ${monthStr} ${year} ${timeStr}`)
    if (!isNaN(parsed.getTime())) return { venue, startAt: parsed }
  }

  return { venue, startAt: null }
}

function guessYear(day: string, monthStr: string): number {
  const now = new Date()
  const year = now.getFullYear()
  const candidate = new Date(`${day} ${monthStr} ${year}`)
  if (!isNaN(candidate.getTime()) && candidate.getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
    return year + 1
  }
  return year
}
