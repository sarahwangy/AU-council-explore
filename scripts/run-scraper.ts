import { prisma } from '../lib/prisma'
import { scrapeMyLibraryDigital } from '../scrapers/mylibrary-digital'

/**
 * Council event sources using the mylibrary.digital platform.
 *
 * Notes on Cloudflare protection:
 *   - *.events.mylibrary.digital subdomains (monash, bayside, stonnington, hume)
 *     are behind CF managed challenge and will return HTTP 403 from server-side
 *     fetch. These are included for completeness; the scraper logs the failure
 *     and continues.
 *   - *.vic.gov.au domains (kingston, melton, moonee-valley, maroondah) respond
 *     correctly to the POST /update API call.
 */
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
    console.log(`Scraping ${councilId} (${url})...`)
    try {
      const events = await scrapeMyLibraryDigital(url)
      let saved = 0
      for (const e of events) {
        if (!e.externalId) continue
        try {
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
        } catch {
          // skip duplicate or constraint error silently
        }
      }
      await prisma.scrapeLog.create({
        data: { councilId, source: 'mylibrary', status: 'success', count: saved },
      })
      console.log(`  → ${events.length} found, ${saved} saved`)
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
