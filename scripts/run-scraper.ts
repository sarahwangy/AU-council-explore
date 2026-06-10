import { prisma } from '../lib/prisma'
import { scrapeMyLibraryDigital } from '../scrapers/mylibrary-digital'
import { scrapeHumanitix } from '../scrapers/humanitix'
import { scrapeEventbrite } from '../scrapers/eventbrite'

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

const HUMANITIX_COUNCILS = [
  { councilId: 'wyndham', hostSlug: 'wyndham-city-libraries' },
]

const EVENTBRITE_COUNCILS = [
  { councilId: 'merri-bek', organizerId: '368932576' },
]

async function runHumanitixScrapers() {
  for (const { councilId, hostSlug } of HUMANITIX_COUNCILS) {
    console.log(`Scraping Humanitix: ${councilId}...`)
    try {
      const events = await scrapeHumanitix(hostSlug)
      let saved = 0
      for (const e of events) {
        if (!e.externalId) continue
        try {
          await prisma.event.upsert({
            where: { source_externalId: { source: 'humanitix', externalId: e.externalId } },
            update: { title: e.title, startAt: e.startAt, endAt: e.endAt, venue: e.venue },
            create: { councilId, ...e, source: 'humanitix' },
          })
          saved++
        } catch { /* skip constraint errors */ }
      }
      await prisma.scrapeLog.create({
        data: { councilId, source: 'humanitix', status: 'success', count: saved },
      })
      console.log(`  → ${events.length} found, ${saved} saved`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await prisma.scrapeLog.create({
        data: { councilId, source: 'humanitix', status: 'error', error: msg },
      })
      console.error(`  → error: ${msg}`)
    }
  }
}

async function runEventbriteScrapers() {
  for (const { councilId, organizerId } of EVENTBRITE_COUNCILS) {
    console.log(`Scraping Eventbrite: ${councilId}...`)
    try {
      const events = await scrapeEventbrite(organizerId)
      let saved = 0
      for (const e of events) {
        if (!e.externalId) continue
        try {
          await prisma.event.upsert({
            where: { source_externalId: { source: 'eventbrite', externalId: e.externalId } },
            update: { title: e.title, startAt: e.startAt, endAt: e.endAt, venue: e.venue },
            create: { councilId, ...e, source: 'eventbrite' },
          })
          saved++
        } catch { /* skip constraint errors */ }
      }
      await prisma.scrapeLog.create({
        data: { councilId, source: 'eventbrite', status: 'success', count: saved },
      })
      console.log(`  → ${events.length} found, ${saved} saved`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await prisma.scrapeLog.create({
        data: { councilId, source: 'eventbrite', status: 'error', error: msg },
      })
      console.error(`  → error: ${msg}`)
    }
  }
}

runMyLibraryScrapers()
  .then(() => runHumanitixScrapers())
  .then(() => runEventbriteScrapers())
  .catch(console.error)
  .finally(() => prisma.$disconnect())
