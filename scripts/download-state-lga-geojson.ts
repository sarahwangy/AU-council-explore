// Download LGA GeoJSON for QLD, SA, WA, TAS from ABS ArcGIS
import * as fs from 'fs'
import * as path from 'path'

// ABS STATE_CODE_2021: QLD=3, SA=4, WA=5, TAS=6
const STATES = [
  { code: '3', abbr: 'QLD', file: 'qld-lgas.geojson', getRegion: getQldRegion },
  { code: '4', abbr: 'SA',  file: 'sa-lgas.geojson',  getRegion: getSaRegion  },
  { code: '5', abbr: 'WA',  file: 'wa-lgas.geojson',  getRegion: getWaRegion  },
  { code: '6', abbr: 'TAS', file: 'tas-lgas.geojson', getRegion: getTasRegion },
]

function slugify(name: string) {
  return name.toLowerCase().replace(/\s*\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function getQldRegion(name: string): string {
  const n = name.toLowerCase()
  if (['brisbane', 'north brisbane', 'moreton bay', 'redcliffe'].some(r => n.includes(r))) return 'brisbane-north'
  if (['logan', 'redland', 'ipswich', 'scenic rim', 'lockyer valley', 'somerset'].some(r => n.includes(r))) return 'brisbane-south'
  if (['gold coast', 'tweed'].some(r => n.includes(r))) return 'gold-coast'
  if (['sunshine coast', 'noosa', 'gympie'].some(r => n.includes(r))) return 'sunshine-coast'
  return 'qld-regional'
}

function getSaRegion(name: string): string {
  const n = name.toLowerCase()
  if (['adelaide', 'prospect', 'unley', 'norwood', 'burnside', 'campbelltown', 'mitcham', 'holdfast', 'marion', 'onkaparinga', 'tea tree', 'playford', 'salisbury', 'port adelaide', 'charles sturt', 'west torrens', 'walkerville'].some(r => n.includes(r))) return 'adelaide-metro'
  if (['mount barker', 'victor harbor', 'yankalilla', 'alexandrina'].some(r => n.includes(r))) return 'adelaide-hills'
  return 'sa-regional'
}

function getWaRegion(name: string): string {
  const n = name.toLowerCase()
  if (['perth', 'stirling', 'joondalup', 'wanneroo', 'swan', 'bayswater', 'bassendean', 'belmont', 'canning', 'cockburn', 'fremantle', 'gosnells', 'kalamunda', 'kwinana', 'melville', 'mundaring', 'nedlands', 'peppermint', 'rockingham', 'subiaco', 'victoria park', 'vincent', 'claremont', 'cottesloe', 'mosman park', 'cambridge'].some(r => n.includes(r))) return 'perth-metro'
  if (['mandurah', 'murray', 'serpentine'].some(r => n.includes(r))) return 'perth-south'
  return 'wa-regional'
}

function getTasRegion(name: string): string {
  const n = name.toLowerCase()
  if (['hobart', 'glenorchy', 'clarence', 'kingborough', 'huon valley', 'sorell', 'sullivans cove'].some(r => n.includes(r))) return 'hobart-metro'
  if (['launceston', 'meander', 'west tamar', 'george town', 'northern midlands'].some(r => n.includes(r))) return 'launceston'
  return 'tas-regional'
}

async function downloadState(stateCode: string, abbr: string, file: string, getRegion: (n: string) => string) {
  const url = 'https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/LGA/MapServer/0/query?' +
    new URLSearchParams({
      where: `STATE_CODE_2021='${stateCode}'`,
      outFields: 'LGA_CODE_2021,LGA_NAME_2021',
      f: 'geojson',
      geometryPrecision: '5',
      outSR: '4326',
      resultRecordCount: '200',
    })

  console.log(`Fetching ${abbr} LGA boundaries...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${abbr}`)
  const raw = await res.json() as { features: { properties: Record<string, string>; geometry: unknown }[] }

  const features = raw.features.map(f => {
    const rawName = (f.properties.LGA_NAME_2021 ?? f.properties.lga_name_2021 ?? '') as string
    return {
      ...f,
      properties: {
        ...f.properties,
        lga_slug: slugify(rawName),
        lga_name: rawName,
        lga_region: getRegion(rawName),
        lga_state: abbr,
      },
    }
  })

  const outPath = path.join(process.cwd(), 'public', file)
  fs.writeFileSync(outPath, JSON.stringify({ type: 'FeatureCollection', features }))
  const regionCounts: Record<string, number> = {}
  features.forEach(f => { regionCounts[f.properties.lga_region] = (regionCounts[f.properties.lga_region] || 0) + 1 })
  console.log(`  ✅ ${abbr}: ${features.length} LGAs →`, regionCounts)
}

async function main() {
  for (const s of STATES) {
    await downloadState(s.code, s.abbr, s.file, s.getRegion)
  }
  console.log('\nDone.')
}

main().catch(console.error)
// Re-export for direct NT run
