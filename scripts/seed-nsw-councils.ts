// scripts/seed-nsw-councils.ts
import { prisma } from '../lib/prisma'

const NSW_COUNCILS = [
  // Sydney Inner
  { id: 'city-of-sydney', name: 'City of Sydney', region: 'sydney-inner', population: 246343, areaSqKm: 26.2, website: 'https://www.cityofsydney.nsw.gov.au', libraryUrl: 'https://library.cityofsydney.nsw.gov.au', libraryName: 'City of Sydney Libraries', librarySuburb: 'Sydney' },
  { id: 'inner-west', name: 'Inner West Council', region: 'sydney-inner', population: 196000, areaSqKm: 36.0, website: 'https://www.innerwest.nsw.gov.au', libraryUrl: 'https://www.innerwest.nsw.gov.au/explore/libraries', libraryName: 'Inner West Libraries', librarySuburb: 'Leichhardt' },
  { id: 'waverley', name: 'Waverley Council', region: 'sydney-inner', population: 73600, areaSqKm: 9.1, website: 'https://www.waverley.nsw.gov.au', libraryUrl: 'https://www.waverley.nsw.gov.au/services/libraries', libraryName: 'Waverley Library', librarySuburb: 'Bondi Junction' },
  { id: 'randwick', name: 'Randwick City Council', region: 'sydney-inner', population: 143600, areaSqKm: 36.3, website: 'https://www.randwick.nsw.gov.au', libraryUrl: 'https://www.randwick.nsw.gov.au/community-services/libraries', libraryName: 'Randwick City Library', librarySuburb: 'Randwick' },
  // Sydney North
  { id: 'north-sydney', name: 'North Sydney Council', region: 'sydney-north', population: 74000, areaSqKm: 10.5, website: 'https://www.northsydney.nsw.gov.au', libraryUrl: 'https://www.northsydney.nsw.gov.au/services/libraries', libraryName: 'Stanton Library', librarySuburb: 'North Sydney' },
  { id: 'willoughby', name: 'Willoughby City Council', region: 'sydney-north', population: 80200, areaSqKm: 29.2, website: 'https://www.willoughby.nsw.gov.au', libraryUrl: 'https://www.willoughby.nsw.gov.au/community/libraries', libraryName: 'Chatswood Library', librarySuburb: 'Chatswood' },
  { id: 'mosman', name: 'Mosman Municipal Council', region: 'sydney-north', population: 31100, areaSqKm: 10.0, website: 'https://mosman.nsw.gov.au', libraryUrl: 'https://mosman.nsw.gov.au/library', libraryName: 'Mosman Library', librarySuburb: 'Mosman' },
  { id: 'lane-cove', name: 'Lane Cove Municipal Council', region: 'sydney-north', population: 38800, areaSqKm: 18.3, website: 'https://lanecove.nsw.gov.au', libraryUrl: 'https://lanecove.nsw.gov.au/community/libraries', libraryName: 'Lane Cove Library', librarySuburb: 'Lane Cove' },
  { id: 'city-of-ryde', name: 'City of Ryde', region: 'sydney-north', population: 128400, areaSqKm: 44.0, website: 'https://www.ryde.nsw.gov.au', libraryUrl: 'https://www.ryde.nsw.gov.au/Council/Libraries', libraryName: 'Ryde Library Service', librarySuburb: 'Ryde' },
  // Sydney West
  { id: 'parramatta', name: 'City of Parramatta', region: 'sydney-west', population: 258000, areaSqKm: 83.0, website: 'https://www.cityofparramatta.nsw.gov.au', libraryUrl: 'https://www.cityofparramatta.nsw.gov.au/community/parramatta-city-library', libraryName: 'Parramatta City Library', librarySuburb: 'Parramatta' },
  { id: 'blacktown', name: 'Blacktown City Council', region: 'sydney-west', population: 394000, areaSqKm: 246.0, website: 'https://www.blacktown.nsw.gov.au', libraryUrl: 'https://www.blacktown.nsw.gov.au/Services/Libraries-and-Reading', libraryName: 'Blacktown City Libraries', librarySuburb: 'Blacktown' },
  { id: 'penrith', name: 'Penrith City Council', region: 'sydney-west', population: 222500, areaSqKm: 404.0, website: 'https://www.penrithcity.nsw.gov.au', libraryUrl: 'https://www.penrithcity.nsw.gov.au/library', libraryName: 'Penrith Library', librarySuburb: 'Penrith' },
  // Sydney South-West
  { id: 'liverpool', name: 'Liverpool City Council', region: 'sydney-southwest', population: 234700, areaSqKm: 304.0, website: 'https://www.liverpool.nsw.gov.au', libraryUrl: 'https://www.liverpool.nsw.gov.au/residents/arts-and-culture/liverpool-city-libraries', libraryName: 'Liverpool City Libraries', librarySuburb: 'Liverpool' },
  { id: 'campbelltown-nsw', name: 'Campbelltown City Council', region: 'sydney-southwest', population: 178000, areaSqKm: 311.0, website: 'https://www.campbelltown.nsw.gov.au', libraryUrl: 'https://www.campbelltown.nsw.gov.au/Services-and-Payments/Libraries', libraryName: 'Campbelltown City Libraries', librarySuburb: 'Campbelltown' },
  { id: 'camden-nsw', name: 'Camden Council', region: 'sydney-southwest', population: 122000, areaSqKm: 201.0, website: 'https://www.camden.nsw.gov.au', libraryUrl: 'https://www.camden.nsw.gov.au/library', libraryName: 'Camden Library', librarySuburb: 'Camden' },
  { id: 'georges-river', name: 'Georges River Council', region: 'sydney-southwest', population: 166000, areaSqKm: 43.0, website: 'https://www.georgesriver.nsw.gov.au', libraryUrl: 'https://www.georgesriver.nsw.gov.au/Community/Libraries', libraryName: 'Georges River Libraries', librarySuburb: 'Hurstville' },
  // NSW Regional
  { id: 'central-coast-nsw', name: 'Central Coast Council', region: 'nsw-regional', population: 343000, areaSqKm: 1681.0, website: 'https://www.centralcoast.nsw.gov.au', libraryUrl: 'https://www.centralcoast.nsw.gov.au/residents/arts-and-culture/libraries', libraryName: 'Central Coast Libraries', librarySuburb: 'Gosford' },
  { id: 'newcastle-nsw', name: 'City of Newcastle', region: 'nsw-regional', population: 168000, areaSqKm: 187.0, website: 'https://www.newcastle.nsw.gov.au', libraryUrl: 'https://newcastle.nsw.gov.au/library', libraryName: 'Newcastle City Library', librarySuburb: 'Newcastle' },
  { id: 'lake-macquarie', name: 'Lake Macquarie City Council', region: 'nsw-regional', population: 217000, areaSqKm: 648.0, website: 'https://www.lakemac.nsw.gov.au', libraryUrl: 'https://lakemac.com.au/library', libraryName: 'Lake Macquarie Library', librarySuburb: 'Speers Point' },
  { id: 'wollongong-nsw', name: 'Wollongong City Council', region: 'nsw-regional', population: 222000, areaSqKm: 685.0, website: 'https://www.wollongong.nsw.gov.au', libraryUrl: 'https://library.wollongong.nsw.gov.au', libraryName: 'Wollongong City Libraries', librarySuburb: 'Wollongong' },
]

async function main() {
  console.log('Seeding NSW councils...')
  for (const c of NSW_COUNCILS) {
    const { libraryName, librarySuburb, libraryUrl, ...councilData } = c
    await prisma.council.upsert({
      where: { id: c.id },
      create: { ...councilData, state: 'NSW', libraryUrl },
      update: { ...councilData, state: 'NSW', libraryUrl },
    })
    // One library record (the main branch) for map pin + info card
    await prisma.library.upsert({
      where: { id: `${c.id}-main` },
      create: { id: `${c.id}-main`, councilId: c.id, name: libraryName, suburb: librarySuburb, url: libraryUrl },
      update: { name: libraryName, suburb: librarySuburb, url: libraryUrl },
    })
    console.log(`  ✓ ${c.name}`)
  }
  console.log(`Done. Seeded ${NSW_COUNCILS.length} NSW councils.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
