/**
 * Geocode childcare records that have addresses but no lat/lng.
 * Uses Mapbox Geocoding API (free tier: 100k requests/month).
 * Run: npx tsx scripts/geocode-childcare.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

async function geocode(address: string, suburb: string, postcode: string): Promise<{ lat: number; lng: number } | null> {
  const query = [address, suburb, postcode, 'VIC', 'Australia'].filter(Boolean).join(', ')
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&country=AU&proximity=145.0,-37.8&limit=1`
  try {
    const res = await fetch(url)
    const data = await res.json() as { features?: { center: [number, number] }[] }
    const feature = data.features?.[0]
    if (!feature) return null
    return { lng: feature.center[0], lat: feature.center[1] }
  } catch {
    return null
  }
}

async function main() {
  if (!TOKEN) { console.error('NEXT_PUBLIC_MAPBOX_TOKEN not set'); process.exit(1) }

  const ungeocoded = await db.childcare.findMany({
    where: { state: 'VIC', lat: null },
    select: { id: true, name: true, address: true, suburb: true, postcode: true },
  })

  console.log(`Geocoding ${ungeocoded.length} childcare records...`)

  let success = 0, failed = 0

  for (let i = 0; i < ungeocoded.length; i++) {
    const c = ungeocoded[i]
    const coords = await geocode(c.address ?? '', c.suburb ?? '', c.postcode ?? '')

    if (coords) {
      await db.childcare.update({ where: { id: c.id }, data: { lat: coords.lat, lng: coords.lng } })
      success++
    } else {
      failed++
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  ${i + 1}/${ungeocoded.length} — ✓ ${success} geocoded, ✗ ${failed} failed`)
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    }
  }

  console.log(`\n✅ Done: ${success} geocoded, ${failed} failed`)
  await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
