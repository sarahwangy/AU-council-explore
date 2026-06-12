// Geocode all libraries that don't yet have lat/lng using Mapbox Geocoding API.
// Run: npx tsx scripts/geocode-libraries.ts
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch { /* file not found */ }

const prisma = new PrismaClient()
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

if (!TOKEN) {
  console.error('NEXT_PUBLIC_MAPBOX_TOKEN not set in .env.local')
  process.exit(1)
}

async function geocode(address: string, suburb: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${address}, ${suburb}, Victoria, Australia`)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${TOKEN}&country=AU&proximity=145.0,-37.8&limit=1`
  try {
    const res = await fetch(url)
    const data = await res.json() as { features?: { center: [number, number] }[] }
    const feature = data.features?.[0]
    if (!feature) return null
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const libraries = await prisma.library.findMany({
    where: { lat: null, address: { not: null } },
    select: { id: true, name: true, address: true, suburb: true, councilId: true },
  })

  console.log(`Geocoding ${libraries.length} libraries without coordinates...`)
  let success = 0, failed = 0

  for (const lib of libraries) {
    if (!lib.address) continue
    const result = await geocode(lib.address, lib.suburb ?? '')
    if (result) {
      await prisma.library.update({
        where: { id: lib.id },
        data: { lat: result.lat, lng: result.lng },
      })
      console.log(`✅ ${lib.councilId} / ${lib.name} → ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`)
      success++
    } else {
      console.warn(`⚠️  ${lib.councilId} / ${lib.name} — geocode failed`)
      failed++
    }
    // Mapbox free tier: 600 req/min — pace at ~3/sec to be safe
    await sleep(350)
  }

  console.log(`\nDone: ${success} geocoded, ${failed} failed`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
