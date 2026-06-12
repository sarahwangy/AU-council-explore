// Download Victorian school zone GeoJSON from data.vic.gov.au
// Filters to Melbourne metro bounding box and saves to data/
// Run: npx tsx scripts/download-school-zones.ts
import { createWriteStream, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'
import { pipeline } from 'stream/promises'

const ZIP_URL = 'https://www.education.vic.gov.au/Documents/about/research/datavic/dv418_DataVic_School_Zones_2026_MAR26.zip'
const DATA_DIR = resolve(process.cwd(), 'data')
const ZIP_PATH = join(DATA_DIR, 'school-zones.zip')

// Melbourne metro bounding box (generous)
const BBOX = { minLng: 144.4, maxLng: 146.2, minLat: -38.6, maxLat: -37.2 }

function inBbox(coords: number[][]): boolean {
  return coords.some(([lng, lat]) =>
    lng >= BBOX.minLng && lng <= BBOX.maxLng && lat >= BBOX.minLat && lat <= BBOX.maxLat
  )
}

function getCoordsFromGeometry(geometry: { type: string; coordinates: unknown }): number[][] {
  if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][])[0]
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][])[0][0]
  }
  return []
}

async function downloadZip() {
  if (existsSync(ZIP_PATH)) {
    console.log('ZIP already exists, skipping download')
    return
  }
  console.log('Downloading school zones ZIP (~11 MB)...')
  const res = await fetch(ZIP_URL)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`)
  const out = createWriteStream(ZIP_PATH)
  await pipeline(res.body as unknown as NodeJS.ReadableStream, out)
  console.log(`Downloaded to ${ZIP_PATH}`)
}

async function extractAndProcess() {
  // Use unzip via shell
  const { execSync } = await import('child_process')
  const extractDir = join(DATA_DIR, 'school-zones-raw')
  if (!existsSync(extractDir)) mkdirSync(extractDir, { recursive: true })

  console.log('Extracting ZIP...')
  execSync(`unzip -o "${ZIP_PATH}" "*.geojson" -d "${extractDir}"`, { stdio: 'pipe' })

  // Find the GeoJSON files
  const { readdirSync } = await import('fs')
  const files = readdirSync(extractDir, { recursive: true }) as string[]
  const primaryFile = files.find(f => f.includes('Primary_Integrated'))
  const secondaryFile = files.find(f => f.includes('Secondary_Integrated_Year7'))

  if (!primaryFile) throw new Error('Primary zones GeoJSON not found in ZIP')
  if (!secondaryFile) throw new Error('Secondary Year 7 zones GeoJSON not found in ZIP')

  const primaryPath = join(extractDir, primaryFile)
  const secondaryPath = join(extractDir, secondaryFile)

  console.log(`Processing primary: ${primaryFile}`)
  const primaryRaw = JSON.parse(readFileSync(primaryPath, 'utf-8'))
  const primaryFiltered = {
    type: 'FeatureCollection',
    features: primaryRaw.features.filter((f: { geometry: { type: string; coordinates: unknown } }) => {
      const coords = getCoordsFromGeometry(f.geometry)
      return inBbox(coords)
    }),
  }
  writeFileSync(join(DATA_DIR, 'school-zones-primary.geojson'), JSON.stringify(primaryFiltered))
  console.log(`  → ${primaryFiltered.features.length} primary zones (Melbourne)`)

  console.log(`Processing secondary: ${secondaryFile}`)
  const secondaryRaw = JSON.parse(readFileSync(secondaryPath, 'utf-8'))
  const secondaryFiltered = {
    type: 'FeatureCollection',
    features: secondaryRaw.features.filter((f: { geometry: { type: string; coordinates: unknown } }) => {
      const coords = getCoordsFromGeometry(f.geometry)
      return inBbox(coords)
    }),
  }
  writeFileSync(join(DATA_DIR, 'school-zones-secondary.geojson'), JSON.stringify(secondaryFiltered))
  console.log(`  → ${secondaryFiltered.features.length} secondary zones (Melbourne)`)

  console.log('\nDone! Files saved:')
  console.log('  data/school-zones-primary.geojson')
  console.log('  data/school-zones-secondary.geojson')
}

downloadZip()
  .then(extractAndProcess)
  .catch(err => { console.error('Failed:', err.message); process.exit(1) })
