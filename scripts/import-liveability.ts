/**
 * Import childcare, playground, hospital data from OSM into the database.
 * Run: npx tsx scripts/import-liveability.ts
 */
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const db = new PrismaClient()

interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lng?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface OsmResult {
  elements: OsmElement[]
}

function getLat(el: OsmElement): number | null {
  return el.lat ?? el.center?.lat ?? null
}

function getLng(el: OsmElement): number | null {
  // OSM uses 'lon' not 'lng'
  if (el.type === 'node' && el.lat !== undefined) {
    // node has direct lat/lon — but our interface stores it as lng
    // The raw OSM data uses 'lon' — need to access via any
    const raw = el as unknown as Record<string, number>
    return raw['lon'] ?? el.center?.lon ?? null
  }
  return el.center?.lon ?? null
}

async function importHospitals() {
  console.log('\n=== Importing Hospitals ===')
  const filePath = path.join('/tmp', 'vic-hospitals-full.json')
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath, '— skipping')
    return
  }

  const data: OsmResult = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  let imported = 0, skipped = 0

  for (const el of data.elements) {
    const lat = getLat(el)
    const lon = getLng(el)
    if (!lat || !lon) { skipped++; continue }
    const tags = el.tags ?? {}
    const name = tags['name']
    if (!name) { skipped++; continue }

    const osmId = `${el.type}/${el.id}`
    const emergencyStr = tags['emergency'] ?? tags['healthcare:speciality'] ?? ''
    const hasEmergency = emergencyStr.includes('emergency') ||
      tags['emergency'] === 'yes' ||
      tags['healthcare'] === 'hospital'

    const hospitalType = tags['healthcare:type'] === 'private_hospital' ? 'private'
      : tags['operator:type'] === 'private' ? 'private'
      : 'public'

    await db.hospital.upsert({
      where: { osmId },
      create: {
        osmId,
        name,
        hospitalType,
        address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null,
        suburb: tags['addr:suburb'] ?? null,
        state: 'VIC',
        lat,
        lng: lon,
        phone: tags['phone'] ?? tags['contact:phone'] ?? null,
        website: tags['website'] ?? tags['contact:website'] ?? null,
        emergencyAvailable: hasEmergency,
      },
      update: {
        name,
        hospitalType,
        emergencyAvailable: hasEmergency,
        phone: tags['phone'] ?? tags['contact:phone'] ?? null,
        website: tags['website'] ?? tags['contact:website'] ?? null,
      },
    })
    imported++
  }

  console.log(`✓ Hospitals: ${imported} imported, ${skipped} skipped (no name/coords)`)
}

async function importPlaygrounds() {
  console.log('\n=== Importing Playgrounds ===')
  const filePath = path.join('/tmp', 'vic-playgrounds.json')
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath, '— skipping')
    return
  }

  const data: OsmResult = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  let imported = 0, skipped = 0

  for (const el of data.elements) {
    const lat = getLat(el)
    const lon = getLng(el)
    if (!lat || !lon) { skipped++; continue }

    const tags = el.tags ?? {}
    const osmId = `${el.type}/${el.id}`

    const fenced = tags['playground:fenced'] === 'yes' || tags['fence'] === 'yes' || null
    const shaded = tags['shade'] === 'yes' || null
    const hasBbq = tags['barbecue'] === 'yes' || tags['bbq'] === 'yes' || null
    const hasToilet = tags['toilets'] === 'yes' || null

    await db.playground.upsert({
      where: { osmId },
      create: {
        osmId,
        name: tags['name'] ?? null,
        lat,
        lng: lon,
        suburb: tags['addr:suburb'] ?? null,
        state: 'VIC',
        fenced: fenced ?? undefined,
        shaded: shaded ?? undefined,
        hasBbq: hasBbq ?? undefined,
        hasToilet: hasToilet ?? undefined,
        surfaceType: tags['surface'] ?? null,
      },
      update: {
        name: tags['name'] ?? null,
        fenced: fenced ?? undefined,
        shaded: shaded ?? undefined,
      },
    })
    imported++
  }

  console.log(`✓ Playgrounds: ${imported} imported, ${skipped} skipped (no coords)`)
}

async function importChildcare() {
  console.log('\n=== Importing Childcare (OSM) ===')
  const filePath = path.join('/tmp', 'vic-childcare-osm.json')
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath, '— skipping')
    return
  }

  const data: OsmResult = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  let imported = 0, skipped = 0

  for (const el of data.elements) {
    const lat = getLat(el)
    const lon = getLng(el)
    if (!lat || !lon) { skipped++; continue }

    const tags = el.tags ?? {}
    const name = tags['name']
    if (!name) { skipped++; continue }

    const osmId = `osm-${el.type}/${el.id}`
    const amenity = tags['amenity'] ?? ''
    const serviceType = amenity === 'kindergarten' ? 'Kindergarten / Preschool' : 'Long Day Care'

    await db.childcare.upsert({
      where: { acecqaId: osmId },
      create: {
        acecqaId: osmId,
        name,
        serviceType,
        address: [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null,
        suburb: tags['addr:suburb'] ?? null,
        postcode: tags['addr:postcode'] ?? null,
        state: 'VIC',
        lat,
        lng: lon,
        phone: tags['phone'] ?? tags['contact:phone'] ?? null,
        website: tags['website'] ?? tags['contact:website'] ?? null,
        operatingHours: tags['opening_hours'] ?? null,
      },
      update: {
        name,
        phone: tags['phone'] ?? null,
        website: tags['website'] ?? null,
      },
    })
    imported++
  }

  console.log(`✓ Childcare: ${imported} imported, ${skipped} skipped`)
}

async function main() {
  console.log('Importing liveability data from OSM...')
  await importHospitals()
  await importPlaygrounds()
  await importChildcare()

  const [hospitals, playgrounds, childcares] = await Promise.all([
    db.hospital.count(),
    db.playground.count(),
    db.childcare.count(),
  ])

  console.log('\n📊 Database totals:')
  console.log(`  🏥 Hospitals:   ${hospitals}`)
  console.log(`  🛝 Playgrounds: ${playgrounds}`)
  console.log(`  👶 Childcares:  ${childcares}`)

  await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
