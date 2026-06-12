/**
 * Downloads Victorian LGA boundaries from data.vic.gov.au and merges
 * the 3 new regional councils (geelong, ballarat, bendigo) into the
 * existing public/melbourne-lgas.geojson file.
 *
 * Source: https://discover.data.vic.gov.au/dataset/victorian-local-government-areas-lgas
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const REGIONAL_LGA_NAMES: Record<string, string> = {
  'Greater Geelong': 'geelong',
  'Ballarat': 'ballarat',
  'Greater Bendigo': 'bendigo',
}

async function main() {
  console.log('Downloading Victorian LGA boundaries...')

  // ABS 2021 LGA boundary GeoJSON — only fetch the 3 regional councils
  const url = "https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/LGA/MapServer/0/query?where=lga_name_2021+IN+('Greater+Geelong','Ballarat','Greater+Bendigo')&outFields=lga_name_2021,lga_code_2021&outSR=4326&f=geojson"

  let vicData: { features: { type: string; properties: Record<string, string>; geometry: unknown }[] }

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    vicData = await res.json() as typeof vicData
    console.log(`Downloaded ${vicData.features.length} Victorian LGA features`)
  } catch (err) {
    console.error('Failed to download from ArcGIS. Trying fallback...')
    // Fallback: ABS direct download
    const fallbackUrl = 'https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs-edition-3/jul2021-jun2026/access-and-downloads/digital-boundary-files/LGA_2021_AUST_GDA2020_SHP.zip'
    console.error('Fallback URL (requires manual download):', fallbackUrl)
    console.error('Error:', err)
    process.exit(1)
  }

  // Find the 3 regional council features
  const regionalFeatures = vicData.features.filter(f => {
    const name = f.properties.lga_name_2021 ?? f.properties.LGA_NAME21 ?? ''
    return Object.keys(REGIONAL_LGA_NAMES).some(n => name.includes(n))
  })

  if (regionalFeatures.length === 0) {
    console.error('Could not find regional LGA features. Check property names:')
    console.error('Sample properties:', vicData.features[0]?.properties)
    process.exit(1)
  }

  // Normalise properties to match existing GeoJSON format (lga_slug)
  const normalised = regionalFeatures.map(f => {
    const rawName = f.properties.lga_name_2021 ?? f.properties.LGA_NAME21 ?? ''
    const slug = Object.entries(REGIONAL_LGA_NAMES).find(([n]) => rawName.includes(n))?.[1] ?? rawName.toLowerCase()
    return {
      ...f,
      properties: { lga_slug: slug, lga_name: rawName },
    }
  })

  console.log('Matched regional LGAs:')
  normalised.forEach(f => console.log(`  ${f.properties.lga_name} → ${f.properties.lga_slug}`))

  // Load existing Melbourne GeoJSON
  const melbPath = join(process.cwd(), 'public', 'melbourne-lgas.geojson')
  const existing = JSON.parse(readFileSync(melbPath, 'utf-8')) as {
    type: string
    features: unknown[]
  }

  // Remove any existing regional entries (avoid duplicates on re-run)
  const slugsToAdd = normalised.map(f => f.properties.lga_slug)
  const filtered = existing.features.filter((f: unknown) => {
    const feat = f as { properties: { lga_slug: string } }
    return !slugsToAdd.includes(feat.properties.lga_slug)
  })

  const merged = {
    ...existing,
    features: [...filtered, ...normalised],
  }

  writeFileSync(melbPath, JSON.stringify(merged))
  console.log(`\n✅ Updated public/melbourne-lgas.geojson`)
  console.log(`   Total features: ${merged.features.length} (was ${existing.features.length})`)
  console.log(`   Added: ${normalised.map(f => f.properties.lga_slug).join(', ')}`)
}

main().catch(console.error)
