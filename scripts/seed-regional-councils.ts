import { prisma } from '../lib/prisma'

// Convert "9:30am-5:00pm" style to "9:30-17:00" 24h format
function to24h(t: string): string {
  const pm = t.toLowerCase().includes('pm')
  const am = t.toLowerCase().includes('am')
  const clean = t.replace(/am|pm/gi, '').trim()
  const [h, m] = clean.split(':').map(Number)
  let hour = h
  if (pm && h !== 12) hour = h + 12
  if (am && h === 12) hour = 0
  return `${hour}:${String(m ?? 0).padStart(2, '0')}`
}

function parseHours(open: string, close: string): string {
  return `${to24h(open)}-${to24h(close)}`
}

async function main() {
  console.log('Seeding regional Victorian councils...')

  // ─── 1. GEELONG ───────────────────────────────────────────────
  const geelong = await prisma.council.upsert({
    where: { id: 'geelong' },
    update: {},
    create: {
      id: 'geelong',
      name: 'Greater Geelong',
      region: 'regional',
      website: 'https://www.geelongcity.vic.gov.au',
      population: 271057,
      areaSqKm: 1248,
      libraryUrl: 'https://www.grlc.vic.gov.au',
      libraryPlatform: 'communico',
      libraryCardUrl: 'https://www.grlc.vic.gov.au/join-library',
      kindergartenUrl: 'https://www.geelongcity.vic.gov.au/services/family-and-community-services/children-and-parenting/kindergartens/kindergarten-registration',
      hardRubbishUrl: 'https://www.geelongcity.vic.gov.au/services/rubbish-and-recycling/book-hard-waste-or-mattress-collection',
    },
  })
  console.log('✅ Geelong council')

  await prisma.councilStats.upsert({
    where: { councilId: 'geelong' },
    update: {},
    create: {
      councilId: 'geelong',
      dataYear: 2021,
      malePercent: 48.6,
      femalePercent: 51.4,
      agePct0to4: 5.7,
      agePct5to14: 12.0,
      agePct15to19: 5.6,
      agePct20to39: 20.5,
      agePct40to64: 29.8,
      agePct65plus: 16.8,
      overseasBornPct: 22.4,
      medianHouseholdIncome: 1592,
      topLanguagesJson: JSON.stringify([
        { language: 'Mandarin', pct: 0.8 },
        { language: 'Punjabi', pct: 0.8 },
        { language: 'Italian', pct: 0.8 },
      ]),
    },
  })
  console.log('✅ Geelong stats')

  const geelongLibraries = [
    {
      id: 'geelong-central',
      name: 'Geelong Library & Heritage Centre',
      address: '51 Little Malop Street',
      suburb: 'Geelong',
      phone: '(03) 4201 0600',
      url: 'https://www.grlc.vic.gov.au/libraries/geelong-library',
      lat: -38.1479, lng: 144.3597,
      hours: { mon: '9:00-20:00', tue: '9:00-20:00', wed: '9:00-20:00', thu: '9:00-20:00', fri: '9:00-17:30', sat: '9:00-17:00', sun: '13:00-17:00' },
    },
    {
      id: 'geelong-belmont',
      name: 'Belmont Library',
      address: '163 High Street',
      suburb: 'Belmont',
      phone: '(03) 4201 0665',
      url: 'https://www.grlc.vic.gov.au/libraries/belmont-library',
      lat: -38.1713, lng: 144.3498,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
    {
      id: 'geelong-armstrong-creek',
      name: 'Biyal-a Armstrong Creek Library',
      address: '20 Main Street',
      suburb: 'Armstrong Creek',
      phone: '(03) 4201 0672',
      url: 'https://www.grlc.vic.gov.au/libraries/biyal-a-armstrong-creek-library',
      lat: -38.2095, lng: 144.3901,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
    {
      id: 'geelong-norlane',
      name: 'Corio Library',
      address: 'Cox Road (cnr Moa Street)',
      suburb: 'Norlane',
      phone: '(03) 4201 0658',
      url: 'https://www.grlc.vic.gov.au/libraries/corio-library',
      lat: -38.0876, lng: 144.3371,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
    {
      id: 'geelong-west',
      name: 'Geelong West Library',
      address: '153a Pakington Street',
      suburb: 'Geelong West',
      phone: '(03) 4201 0660',
      url: 'https://www.grlc.vic.gov.au/libraries/geelong-west-library',
      lat: -38.1389, lng: 144.3381,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
    {
      id: 'geelong-waurn-ponds',
      name: 'Waurn Ponds Library',
      address: '230 Pioneer Road',
      suburb: 'Grovedale',
      phone: '(03) 4201 0670',
      url: 'https://www.grlc.vic.gov.au/libraries/waurn-ponds-library',
      lat: -38.2008, lng: 144.3063,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
    {
      id: 'geelong-lara',
      name: 'Lara Library',
      address: '5 Walkers Road',
      suburb: 'Lara',
      phone: '(03) 4201 0668',
      url: 'https://www.grlc.vic.gov.au/libraries/lara-library',
      lat: -38.0238, lng: 144.4016,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
    {
      id: 'geelong-ocean-grove',
      name: 'Ocean Grove Library',
      address: 'Presidents Avenue',
      suburb: 'Ocean Grove',
      phone: '(03) 4201 0655',
      url: 'https://www.grlc.vic.gov.au/libraries/ocean-grove-library',
      lat: -38.2685, lng: 144.5228,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-20:00', fri: '9:30-17:30', sat: '9:30-13:00', sun: null },
    },
  ]

  for (const lib of geelongLibraries) {
    await prisma.library.upsert({
      where: { id: lib.id },
      update: {},
      create: {
        id: lib.id,
        councilId: 'geelong',
        name: lib.name,
        address: lib.address,
        suburb: lib.suburb,
        phone: lib.phone,
        url: lib.url,
        lat: lib.lat,
        lng: lib.lng,
        hoursJson: JSON.stringify(lib.hours),
      },
    })
  }
  console.log(`✅ Geelong libraries (${geelongLibraries.length})`)

  // ─── 2. BALLARAT ──────────────────────────────────────────────
  await prisma.council.upsert({
    where: { id: 'ballarat' },
    update: {},
    create: {
      id: 'ballarat',
      name: 'Ballarat',
      region: 'regional',
      website: 'https://www.ballarat.vic.gov.au',
      population: 113763,
      areaSqKm: 739,
      libraryUrl: 'https://libraries.ballarat.vic.gov.au',
      libraryPlatform: 'humanitix',
      libraryCardUrl: 'https://libraries.ballarat.vic.gov.au/services/join-the-library',
      kindergartenUrl: 'https://kinder.ballarat.vic.gov.au',
      hardRubbishUrl: 'https://www.ballarat.vic.gov.au/property/waste/hard-waste',
    },
  })
  console.log('✅ Ballarat council')

  await prisma.councilStats.upsert({
    where: { councilId: 'ballarat' },
    update: {},
    create: {
      councilId: 'ballarat',
      dataYear: 2021,
      malePercent: 48.1,
      femalePercent: 51.9,
      agePct0to4: 5.8,
      agePct5to14: 12.9,
      agePct15to19: 6.1,
      agePct20to39: 19.8,
      agePct40to64: 24.0,
      agePct65plus: 13.1,
      overseasBornPct: 16.3,
      medianHouseholdIncome: 1429,
      topLanguagesJson: JSON.stringify([
        { language: 'Mandarin', pct: 0.9 },
        { language: 'Punjabi', pct: 0.7 },
        { language: 'Malayalam', pct: 0.4 },
      ]),
    },
  })
  console.log('✅ Ballarat stats')

  const ballaratLibraries = [
    {
      id: 'ballarat-central',
      name: 'Ballarat Library',
      address: '178 Doveton Street North',
      suburb: 'Ballarat Central',
      phone: '(03) 5338 6850',
      url: 'https://libraries.ballarat.vic.gov.au/libraries/ballarat-library',
      lat: -37.5622, lng: 143.8503,
      hours: { mon: '9:30-19:00', tue: '9:30-18:00', wed: '9:30-19:00', thu: '9:30-18:00', fri: '9:30-18:00', sat: '9:30-16:00', sun: '9:30-16:00' },
    },
    {
      id: 'ballarat-sebastopol',
      name: 'Sebastopol Library',
      address: '181 Albert Street',
      suburb: 'Sebastopol',
      phone: '(03) 5335 7985',
      url: 'https://libraries.ballarat.vic.gov.au/libraries/sebastopol-library',
      lat: -37.5882, lng: 143.8399,
      hours: { mon: '9:30-18:00', tue: '9:30-19:00', wed: '9:30-18:00', thu: '9:30-19:00', fri: '9:30-18:00', sat: '9:30-12:00', sun: null },
    },
    {
      id: 'ballarat-wendouree',
      name: 'Wendouree Library',
      address: 'Stockland Wendouree Shopping Centre, Gillies Street North',
      suburb: 'Wendouree',
      phone: '(03) 5339 3505',
      url: 'https://libraries.ballarat.vic.gov.au/libraries/wendouree-library',
      lat: -37.5378, lng: 143.8355,
      hours: { mon: '9:30-17:00', tue: '9:30-17:00', wed: '9:30-17:00', thu: '9:30-17:00', fri: '9:30-17:00', sat: '9:30-14:00', sun: null },
    },
  ]

  for (const lib of ballaratLibraries) {
    await prisma.library.upsert({
      where: { id: lib.id },
      update: {},
      create: {
        id: lib.id,
        councilId: 'ballarat',
        name: lib.name,
        address: lib.address,
        suburb: lib.suburb,
        phone: lib.phone,
        url: lib.url,
        lat: lib.lat,
        lng: lib.lng,
        hoursJson: JSON.stringify(lib.hours),
      },
    })
  }
  console.log(`✅ Ballarat libraries (${ballaratLibraries.length})`)

  // ─── 3. BENDIGO ───────────────────────────────────────────────
  await prisma.council.upsert({
    where: { id: 'bendigo' },
    update: {},
    create: {
      id: 'bendigo',
      name: 'Greater Bendigo',
      region: 'regional',
      website: 'https://www.bendigo.vic.gov.au',
      population: 121470,
      areaSqKm: 3000,
      libraryUrl: 'https://www.ncgrl.vic.gov.au',
      libraryPlatform: 'eventbrite',
      libraryCardUrl: 'https://www.ncgrl.vic.gov.au/membership/',
      kindergartenUrl: 'https://www.bendigo.vic.gov.au/community-services/children-and-families/centralised-kindergarten-registration',
      hardRubbishUrl: 'https://www.bendigo.vic.gov.au/residents/general-waste-recycling-and-organics/waste-disposal-guide/hard-waste',
    },
  })
  console.log('✅ Bendigo council')

  await prisma.councilStats.upsert({
    where: { councilId: 'bendigo' },
    update: {},
    create: {
      councilId: 'bendigo',
      dataYear: 2021,
      malePercent: 48.5,
      femalePercent: 51.5,
      agePct0to4: 5.9,
      agePct5to14: 12.8,
      agePct15to19: 5.8,
      agePct20to39: 25.2,
      agePct40to64: 30.5,
      agePct65plus: 14.7,
      overseasBornPct: 15.4,
      medianHouseholdIncome: 1448,
      topLanguagesJson: JSON.stringify([
        { language: 'Karen', pct: 1.3 },
        { language: 'Mandarin', pct: 0.5 },
        { language: 'Malayalam', pct: 0.4 },
      ]),
    },
  })
  console.log('✅ Bendigo stats')

  const bendigoLibraries = [
    {
      id: 'bendigo-central',
      name: 'Bendigo Library',
      address: '251-259 Hargreaves Street',
      suburb: 'Bendigo',
      phone: '(03) 5449 2700',
      url: 'https://www.ncgrl.vic.gov.au/libraries/bendigo-library/',
      lat: -36.7570, lng: 144.2794,
      hours: { mon: '9:30-17:30', tue: '9:30-17:30', wed: '9:30-17:30', thu: '9:30-19:00', fri: '9:30-19:00', sat: '9:30-14:30', sun: null },
    },
    {
      id: 'bendigo-kangaroo-flat',
      name: 'Kangaroo Flat Library',
      address: '23 Lockwood Road',
      suburb: 'Kangaroo Flat',
      phone: '(03) 5447 8344',
      url: 'https://www.ncgrl.vic.gov.au/libraries/kangaroo-flat-library/',
      lat: -36.8010, lng: 144.2421,
      hours: { mon: '9:30-17:00', tue: '9:30-17:00', wed: '9:30-17:00', thu: '9:30-18:00', fri: '9:30-17:00', sat: '9:30-12:30', sun: null },
    },
    {
      id: 'bendigo-eaglehawk',
      name: 'Eaglehawk Library',
      address: '1 Sailors Gully Road',
      suburb: 'Eaglehawk',
      phone: '(03) 5446 7577',
      url: 'https://www.ncgrl.vic.gov.au/libraries/eaglehawk-library/',
      lat: -36.7155, lng: 144.2518,
      hours: { mon: null, tue: '10:00-17:00', wed: null, thu: null, fri: '9:30-12:30', sat: '9:30-12:30', sun: null },
    },
    {
      id: 'bendigo-heathcote',
      name: 'Heathcote Library',
      address: '121 High Street',
      suburb: 'Heathcote',
      phone: '(03) 5433 3734',
      url: 'https://www.ncgrl.vic.gov.au/libraries/heathcote-library/',
      lat: -36.9262, lng: 144.7079,
      hours: { mon: null, tue: '9:30-12:30', wed: '9:30-12:30', thu: '9:30-17:00', fri: '9:30-12:30', sat: '9:30-12:30', sun: null },
    },
  ]

  for (const lib of bendigoLibraries) {
    await prisma.library.upsert({
      where: { id: lib.id },
      update: {},
      create: {
        id: lib.id,
        councilId: 'bendigo',
        name: lib.name,
        address: lib.address,
        suburb: lib.suburb,
        phone: lib.phone,
        url: lib.url,
        lat: lib.lat,
        lng: lib.lng,
        hoursJson: JSON.stringify(lib.hours),
      },
    })
  }
  console.log(`✅ Bendigo libraries (${bendigoLibraries.length})`)

  console.log('\n🎉 Regional councils seeded successfully!')
  console.log('   Geelong: council + stats + 8 libraries')
  console.log('   Ballarat: council + stats + 3 libraries')
  console.log('   Bendigo:  council + stats + 4 libraries')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
