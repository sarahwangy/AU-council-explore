/**
 * Seeds Casey, Wyndham, and Frankston councils with census stats and library branches.
 * Run: npx tsx --env-file=.env.local scripts/seed-outer-councils.ts
 */
import { prisma } from '../lib/prisma'

async function main() {
  // ── Casey ──────────────────────────────────────────────────────────────────
  await prisma.council.upsert({
    where: { id: 'casey' },
    create: {
      id: 'casey', name: 'City of Casey', region: 'outer', population: 365239,
      website: 'https://www.casey.vic.gov.au',
      libraryUrl: 'https://www.connectedlibraries.org.au',
      libraryPlatform: 'Connected Libraries',
      libraryCardUrl: 'https://www.connectedlibraries.org.au/join/',
      kindergartenUrl: 'https://www.casey.vic.gov.au/expression-of-interest-kindergarten',
      hardRubbishUrl: 'https://www.casey.vic.gov.au/book-hard-rubbish-collection-online',
    },
    update: { name: 'City of Casey', region: 'outer', population: 365239 },
  })
  await prisma.councilStats.upsert({
    where: { councilId: 'casey' },
    create: {
      councilId: 'casey',
      medianHouseholdIncome: 1918,
      overseasBornPct: 46.5,
      topLanguagesJson: JSON.stringify([
        { language: 'Punjabi', pct: 4.6 },
        { language: 'Sinhalese', pct: 3.5 },
        { language: 'Hazaraghi', pct: 3.2 },
      ]),
    },
    update: {
      medianHouseholdIncome: 1918,
      overseasBornPct: 46.5,
      topLanguagesJson: JSON.stringify([
        { language: 'Punjabi', pct: 4.6 },
        { language: 'Sinhalese', pct: 3.5 },
        { language: 'Hazaraghi', pct: 3.2 },
      ]),
    },
  })
  const caseyLibraries = [
    { id: 'casey-bunjil-place', name: 'Bunjil Place Library', suburb: 'Narre Warren', lat: -38.0183, lng: 145.3082, url: 'https://www.connectedlibraries.org.au/branches/bunjil-place-library/' },
    { id: 'casey-cranbourne', name: 'Cranbourne Library', suburb: 'Cranbourne', lat: -38.1097, lng: 145.2832, url: 'https://www.connectedlibraries.org.au/branches/cranbourne-library/' },
    { id: 'casey-doveton', name: 'Doveton Library', suburb: 'Doveton', lat: -37.9878, lng: 145.2461, url: 'https://www.connectedlibraries.org.au/branches/doveton-library/' },
    { id: 'casey-endeavour-hills', name: 'Endeavour Hills Library', suburb: 'Endeavour Hills', lat: -37.9620, lng: 145.2844, url: 'https://www.connectedlibraries.org.au/branches/endeavour-hills-library/' },
    { id: 'casey-hampton-park', name: 'Hampton Park Library', suburb: 'Hampton Park', lat: -38.0302, lng: 145.2601, url: 'https://www.connectedlibraries.org.au/branches/hampton-park-library/' },
    { id: 'casey-cranbourne-west', name: 'Cranbourne West Library Lounge', suburb: 'Cranbourne West', lat: -38.1241, lng: 145.2444, url: 'https://www.connectedlibraries.org.au/branches/cranbourne-west-library-lounge/' },
    { id: 'casey-clyde', name: 'Clyde Township Library Lounge', suburb: 'Clyde', lat: -38.1340, lng: 145.3291, url: 'https://www.connectedlibraries.org.au/branches/clyde-township-library-lounge/' },
  ]
  for (const lib of caseyLibraries) {
    await prisma.library.upsert({
      where: { id: lib.id },
      create: { ...lib, councilId: 'casey', hoursJson: JSON.stringify({ mon: '9:00-18:00', tue: '9:00-18:00', wed: '9:00-18:00', thu: '9:00-20:00', fri: '9:00-18:00', sat: '9:00-17:00', sun: null }) },
      update: { ...lib, councilId: 'casey' },
    })
  }
  console.log(`✅ Casey: ${caseyLibraries.length} libraries`)

  // ── Wyndham ────────────────────────────────────────────────────────────────
  await prisma.council.upsert({
    where: { id: 'wyndham' },
    create: {
      id: 'wyndham', name: 'City of Wyndham', region: 'western', population: 292011,
      website: 'https://www.wyndham.vic.gov.au',
      libraryUrl: 'https://www.wyndham.vic.gov.au/services/libraries',
      libraryPlatform: 'Wyndham City Libraries',
      libraryCardUrl: 'https://www.wyndham.vic.gov.au/services/libraries/using-library/how-join-borrow',
      kindergartenUrl: 'https://www.wyndham.vic.gov.au/services/childrens-services/kindergarten-services/register-kindergarten',
      hardRubbishUrl: 'https://digital.wyndham.vic.gov.au/hardwaste/',
    },
    update: { name: 'City of Wyndham', region: 'western', population: 292011 },
  })
  await prisma.councilStats.upsert({
    where: { councilId: 'wyndham' },
    create: {
      councilId: 'wyndham',
      medianHouseholdIncome: 2023,
      overseasBornPct: 53.1,
      topLanguagesJson: JSON.stringify([
        { language: 'Punjabi', pct: 7.1 },
        { language: 'Hindi', pct: 4.8 },
        { language: 'Mandarin', pct: 3.6 },
      ]),
    },
    update: {
      medianHouseholdIncome: 2023,
      overseasBornPct: 53.1,
      topLanguagesJson: JSON.stringify([
        { language: 'Punjabi', pct: 7.1 },
        { language: 'Hindi', pct: 4.8 },
        { language: 'Mandarin', pct: 3.6 },
      ]),
    },
  })
  const wyndhamLibraries = [
    { id: 'wyndham-werribee', name: 'Werribee Library', suburb: 'Werribee', lat: -37.9017, lng: 144.6580, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-hoppers-crossing', name: 'Hoppers Crossing Library', suburb: 'Hoppers Crossing', lat: -37.8804, lng: 144.7032, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-point-cook', name: 'Point Cook Library', suburb: 'Point Cook', lat: -37.9007, lng: 144.7504, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-manor-lakes', name: 'Manor Lakes Library', suburb: 'Manor Lakes', lat: -37.9313, lng: 144.6491, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-julia-gillard', name: 'Julia Gillard Library', suburb: 'Tarneit', lat: -37.8443, lng: 144.6683, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-saltwater', name: 'Saltwater Library', suburb: 'Point Cook', lat: -37.9252, lng: 144.7341, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-truganina', name: 'Truganina Library', suburb: 'Truganina', lat: -37.8615, lng: 144.7351, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-williams-landing', name: 'Williams Landing Library', suburb: 'Williams Landing', lat: -37.8627, lng: 144.7474, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
    { id: 'wyndham-plaza', name: 'Plaza Library', suburb: 'Hoppers Crossing', lat: -37.8750, lng: 144.7022, url: 'https://www.wyndham.vic.gov.au/services/libraries' },
  ]
  for (const lib of wyndhamLibraries) {
    await prisma.library.upsert({
      where: { id: lib.id },
      create: { ...lib, councilId: 'wyndham', hoursJson: JSON.stringify({ mon: '9:00-18:00', tue: '9:00-18:00', wed: '9:00-18:00', thu: '9:00-20:00', fri: '9:00-18:00', sat: '9:00-17:00', sun: null }) },
      update: { ...lib, councilId: 'wyndham' },
    })
  }
  console.log(`✅ Wyndham: ${wyndhamLibraries.length} libraries`)

  // ── Frankston ──────────────────────────────────────────────────────────────
  await prisma.council.upsert({
    where: { id: 'frankston' },
    create: {
      id: 'frankston', name: 'City of Frankston', region: 'southern', population: 139281,
      website: 'https://www.frankston.vic.gov.au',
      libraryUrl: 'https://library.frankston.vic.gov.au',
      libraryPlatform: 'Frankston City Libraries',
      libraryCardUrl: 'https://library.frankston.vic.gov.au/Members/Become-a-Member',
      kindergartenUrl: 'https://www.frankston.vic.gov.au/Community-and-Health/Health-and-support-services/Child-and-family-services/Kindergartens/Registering-for-Kindergarten',
      hardRubbishUrl: 'https://www.frankston.vic.gov.au/My-Property/Waste-and-recycling/Hard-waste-collection/Book-a-hard-waste-collection',
    },
    update: { name: 'City of Frankston', region: 'southern', population: 139281 },
  })
  await prisma.councilStats.upsert({
    where: { councilId: 'frankston' },
    create: {
      councilId: 'frankston',
      medianHouseholdIncome: 1653,
      overseasBornPct: 26.3,
      topLanguagesJson: JSON.stringify([
        { language: 'Mandarin', pct: 1.0 },
        { language: 'Greek', pct: 0.9 },
        { language: 'Italian', pct: 0.5 },
      ]),
    },
    update: {
      medianHouseholdIncome: 1653,
      overseasBornPct: 26.3,
      topLanguagesJson: JSON.stringify([
        { language: 'Mandarin', pct: 1.0 },
        { language: 'Greek', pct: 0.9 },
        { language: 'Italian', pct: 0.5 },
      ]),
    },
  })
  const frankstonLibraries = [
    { id: 'frankston-central', name: 'Frankston Library', suburb: 'Frankston', lat: -38.1448, lng: 145.1233, url: 'https://library.frankston.vic.gov.au' },
    { id: 'frankston-carrum-downs', name: 'Carrum Downs Library', suburb: 'Carrum Downs', lat: -38.0993, lng: 145.1276, url: 'https://library.frankston.vic.gov.au' },
    { id: 'frankston-seaford', name: 'Seaford Library', suburb: 'Seaford', lat: -38.1036, lng: 145.1323, url: 'https://library.frankston.vic.gov.au' },
  ]
  for (const lib of frankstonLibraries) {
    await prisma.library.upsert({
      where: { id: lib.id },
      create: { ...lib, councilId: 'frankston', hoursJson: JSON.stringify({ mon: '9:00-18:00', tue: '9:00-18:00', wed: '9:00-18:00', thu: '9:00-20:00', fri: '9:00-18:00', sat: '9:00-17:00', sun: null }) },
      update: { ...lib, councilId: 'frankston' },
    })
  }
  console.log(`✅ Frankston: ${frankstonLibraries.length} libraries`)

  console.log('\n🎉 Outer councils seeded: Casey, Wyndham, Frankston')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
