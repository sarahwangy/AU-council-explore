// Add lat/lng coordinates to non-VIC library entries so nearby search works
import { prisma } from '../lib/prisma'

const COORDS: Record<string, { lat: number; lng: number }> = {
  // NSW
  'city-of-sydney-main':        { lat: -33.8751, lng: 151.2073 },
  'inner-west-main':            { lat: -33.9022, lng: 151.1500 },
  'waverley-main':              { lat: -33.8933, lng: 151.2500 },
  'randwick-main':              { lat: -33.9148, lng: 151.2402 },
  'north-sydney-main':          { lat: -33.8388, lng: 151.2072 },
  'blacktown-main':             { lat: -33.7706, lng: 150.9050 },
  'parramatta-main':            { lat: -33.8148, lng: 151.0017 },
  'penrith-main':               { lat: -33.7508, lng: 150.6944 },
  'hills-shire-main':           { lat: -33.7153, lng: 151.0019 },
  'cumberland-main':            { lat: -33.8342, lng: 150.9948 },
  'liverpool-nsw-main':         { lat: -33.9200, lng: 150.9240 },
  'campbelltown-nsw-main':      { lat: -34.0658, lng: 150.8142 },
  'camden-nsw-main':            { lat: -34.0503, lng: 150.6936 },
  'sutherland-main':            { lat: -34.0327, lng: 151.0572 },
  'georges-river-main':         { lat: -33.9531, lng: 151.1028 },
  'bayside-nsw-main':           { lat: -33.9500, lng: 151.1700 },
  'ku-ring-gai-main':           { lat: -33.7297, lng: 151.1028 },
  'hornsby-main':               { lat: -33.7025, lng: 151.0992 },
  'newcastle-nsw-main':         { lat: -32.9283, lng: 151.7817 },
  'central-coast-nsw-main':     { lat: -33.4242, lng: 151.3425 },

  // QLD
  'brisbane-main':              { lat: -27.4698, lng: 153.0251 },
  'gold-coast-qld-main':        { lat: -28.0167, lng: 153.4000 },
  'sunshine-coast-qld-main':    { lat: -26.6500, lng: 153.0667 },
  'moreton-bay-main':           { lat: -27.2667, lng: 152.9667 },
  'logan-qld-main':             { lat: -27.6333, lng: 153.1000 },
  'ipswich-qld-main':           { lat: -27.6128, lng: 152.7647 },
  'redland-qld-main':           { lat: -27.6167, lng: 153.2167 },
  'cairns-qld-main':            { lat: -16.9186, lng: 145.7781 },
  'townsville-qld-main':        { lat: -19.2589, lng: 146.8169 },
  'toowoomba-qld-main':         { lat: -27.5600, lng: 151.9500 },

  // SA
  'adelaide-sa-main':           { lat: -34.9289, lng: 138.6011 },
  'onkaparinga-main':           { lat: -35.1225, lng: 138.5047 },
  'charles-sturt-main':         { lat: -34.8831, lng: 138.5213 },
  'salisbury-sa-main':          { lat: -34.7576, lng: 138.6419 },
  'playford-sa-main':           { lat: -34.6958, lng: 138.6878 },
  'mount-barker-sa-main':       { lat: -35.0667, lng: 138.8667 },
  'port-adelaide-enfield-main': { lat: -34.8419, lng: 138.4956 },
  'whyalla-sa-main':            { lat: -33.0350, lng: 137.5667 },

  // WA
  'perth-wa-main':              { lat: -31.9505, lng: 115.8605 },
  'stirling-wa-main':           { lat: -31.8958, lng: 115.8019 },
  'wanneroo-wa-main':           { lat: -31.6700, lng: 115.8000 },
  'joondalup-wa-main':          { lat: -31.7462, lng: 115.7676 },
  'swan-wa-main':               { lat: -31.8500, lng: 116.0000 },
  'fremantle-wa-main':          { lat: -32.0569, lng: 115.7481 },
  'rockingham-wa-main':         { lat: -32.2769, lng: 115.7386 },
  'mandurah-wa-main':           { lat: -32.5356, lng: 115.7228 },
  'bunbury-wa-main':            { lat: -33.3272, lng: 115.6369 },

  // TAS
  'hobart-tas-main':            { lat: -42.8821, lng: 147.3272 },
  'glenorchy-tas-main':         { lat: -42.8333, lng: 147.2833 },
  'clarence-tas-main':          { lat: -42.8833, lng: 147.4000 },
  'launceston-tas-main':        { lat: -41.4332, lng: 147.1441 },
  'meander-valley-tas-main':    { lat: -41.5667, lng: 146.7667 },
  'devonport-tas-main':         { lat: -41.1758, lng: 146.3585 },
  'burnie-tas-main':            { lat: -41.0556, lng: 145.9133 },

  // ACT
  'act-government-main':        { lat: -35.2809, lng: 149.1300 },

  // NT
  'darwin-nt-main':             { lat: -12.4634, lng: 130.8456 },
  'palmerston-nt-main':         { lat: -12.4877, lng: 130.9830 },
  'alice-springs-nt-main':      { lat: -23.7020, lng: 133.8807 },
  'litchfield-nt-main':         { lat: -12.8000, lng: 130.9500 },
  'katherine-nt-main':          { lat: -14.4653, lng: 132.2669 },
}

async function main() {
  let updated = 0
  for (const [id, coords] of Object.entries(COORDS)) {
    const result = await prisma.library.updateMany({ where: { id }, data: coords })
    if (result.count > 0) updated++
    else console.warn(`  not found: ${id}`)
  }
  console.log(`Updated coordinates for ${updated} non-VIC libraries.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
