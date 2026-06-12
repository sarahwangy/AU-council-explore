// scripts/download-nsw-lga-geojson.ts
import * as fs from 'fs'
import * as path from 'path'

// ABS ArcGIS REST — LGA 2021 layer, filter to NSW (STATE_CODE_2021 = '1')
const ABS_URL =
  'https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/LGA/MapServer/0/query?' +
  new URLSearchParams({
    where: "STATE_CODE_2021='1'",
    outFields: 'LGA_CODE_2021,LGA_NAME_2021',
    f: 'geojson',
    geometryPrecision: '5',
    outSR: '4326',
    resultRecordCount: '200',
  })

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getNswRegion(lgaName: string): string {
  const name = lgaName.toLowerCase()
  if (['sydney', 'inner west', 'waverley', 'randwick', 'woollahra', 'strathfield'].some(r => name.includes(r))) return 'sydney-inner'
  if (['north sydney', 'willoughby', 'mosman', 'lane cove', 'ryde', 'hunters hill', 'ku-ring-gai', 'hornsby', 'northern beaches'].some(r => name.includes(r))) return 'sydney-north'
  if (['parramatta', 'blacktown', 'penrith', 'hawkesbury', 'blue mountains', 'hills shire', 'cumberland'].some(r => name.includes(r))) return 'sydney-west'
  if (['liverpool', 'campbelltown', 'camden', 'wollondilly', 'fairfield', 'canterbury', 'georges river', 'bayside', 'sutherland'].some(r => name.includes(r))) return 'sydney-southwest'
  return 'nsw-regional'
}

async function main() {
  console.log('Fetching NSW LGA boundaries from ABS...')
  const res = await fetch(ABS_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = await res.json() as { features: { properties: Record<string, string>; geometry: unknown }[] }

  const features = raw.features.map(f => ({
    ...f,
    properties: {
      ...f.properties,
      lga_slug: slugify(f.properties.LGA_NAME_2021 ?? ''),
      lga_name: f.properties.LGA_NAME_2021,
      lga_region: getNswRegion(f.properties.LGA_NAME_2021 ?? ''),
      lga_state: 'NSW',
    },
  }))

  const geojson = { type: 'FeatureCollection', features }
  const outPath = path.join(process.cwd(), 'public', 'nsw-lgas.geojson')
  fs.writeFileSync(outPath, JSON.stringify(geojson))
  console.log(`Written ${features.length} NSW LGA boundaries → ${outPath}`)
}

main().catch(console.error)
