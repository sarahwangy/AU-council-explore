import { prisma } from '../lib/prisma'

const COUNCILS = [
  // QLD
  { id: 'brisbane', name: 'Brisbane City Council', state: 'QLD', region: 'brisbane-north', population: 1238159, areaSqKm: 1338, website: 'https://www.brisbane.qld.gov.au', libraryUrl: 'https://library.brisbane.qld.gov.au' },
  { id: 'gold-coast-qld', name: 'City of Gold Coast', state: 'QLD', region: 'gold-coast', population: 679127, areaSqKm: 1356, website: 'https://www.goldcoast.qld.gov.au', libraryUrl: 'https://library.goldcoast.qld.gov.au' },
  { id: 'sunshine-coast-qld', name: 'Sunshine Coast Council', state: 'QLD', region: 'sunshine-coast', population: 366900, areaSqKm: 3126, website: 'https://www.sunshinecoast.qld.gov.au', libraryUrl: 'https://library.sunshinecoast.qld.gov.au' },
  { id: 'moreton-bay', name: 'Moreton Bay Regional Council', state: 'QLD', region: 'brisbane-north', population: 499346, areaSqKm: 2037, website: 'https://www.moretonbay.qld.gov.au', libraryUrl: 'https://www.moretonbay.qld.gov.au/libraries' },
  { id: 'logan-qld', name: 'Logan City Council', state: 'QLD', region: 'brisbane-south', population: 358000, areaSqKm: 957, website: 'https://www.logan.qld.gov.au', libraryUrl: 'https://www.logan.qld.gov.au/community/libraries' },
  { id: 'ipswich-qld', name: 'Ipswich City Council', state: 'QLD', region: 'brisbane-south', population: 240000, areaSqKm: 1090, website: 'https://www.ipswich.qld.gov.au', libraryUrl: 'https://www.ipswich.qld.gov.au/residents/leisure/libraries' },
  { id: 'redland-qld', name: 'Redland City Council', state: 'QLD', region: 'brisbane-south', population: 168000, areaSqKm: 540, website: 'https://www.redland.qld.gov.au', libraryUrl: 'https://www.redland.qld.gov.au/library' },
  { id: 'cairns-qld', name: 'Cairns Regional Council', state: 'QLD', region: 'qld-regional', population: 161000, areaSqKm: 4156, website: 'https://www.cairns.qld.gov.au', libraryUrl: 'https://www.cairns.qld.gov.au/council/library' },
  { id: 'townsville-qld', name: 'Townsville City Council', state: 'QLD', region: 'qld-regional', population: 200000, areaSqKm: 3732, website: 'https://www.townsville.qld.gov.au', libraryUrl: 'https://www.townsville.qld.gov.au/community/libraries' },
  { id: 'toowoomba-qld', name: 'Toowoomba Regional Council', state: 'QLD', region: 'qld-regional', population: 178000, areaSqKm: 12980, website: 'https://www.toowoomba.qld.gov.au', libraryUrl: 'https://www.toowoomba.qld.gov.au/community/libraries' },

  // SA
  { id: 'adelaide-sa', name: 'City of Adelaide', state: 'SA', region: 'adelaide-metro', population: 24658, areaSqKm: 15.6, website: 'https://www.cityofadelaide.com.au', libraryUrl: 'https://adelaidecitylibraries.com.au' },
  { id: 'onkaparinga', name: 'City of Onkaparinga', state: 'SA', region: 'adelaide-metro', population: 183000, areaSqKm: 518, website: 'https://www.onkaparingacity.com', libraryUrl: 'https://www.onkaparingacity.com/Community-residents/Libraries' },
  { id: 'charles-sturt', name: 'City of Charles Sturt', state: 'SA', region: 'adelaide-metro', population: 120000, areaSqKm: 84, website: 'https://www.charlessturt.sa.gov.au', libraryUrl: 'https://www.charlessturt.sa.gov.au/library' },
  { id: 'salisbury-sa', name: 'City of Salisbury', state: 'SA', region: 'adelaide-metro', population: 149000, areaSqKm: 158, website: 'https://www.salisbury.sa.gov.au', libraryUrl: 'https://www.salisbury.sa.gov.au/community/libraries' },
  { id: 'playford-sa', name: 'City of Playford', state: 'SA', region: 'adelaide-metro', population: 100000, areaSqKm: 346, website: 'https://www.playford.sa.gov.au', libraryUrl: 'https://www.playford.sa.gov.au/library' },
  { id: 'mount-barker-sa', name: 'District Council of Mount Barker', state: 'SA', region: 'adelaide-hills', population: 40000, areaSqKm: 605, website: 'https://www.mountbarker.sa.gov.au', libraryUrl: 'https://www.mountbarker.sa.gov.au/library' },
  { id: 'port-adelaide-enfield', name: 'City of Port Adelaide Enfield', state: 'SA', region: 'adelaide-metro', population: 130000, areaSqKm: 98, website: 'https://www.portenf.sa.gov.au', libraryUrl: 'https://www.portenf.sa.gov.au/library' },
  { id: 'whyalla-sa', name: 'City of Whyalla', state: 'SA', region: 'sa-regional', population: 22000, areaSqKm: 2380, website: 'https://www.whyalla.sa.gov.au', libraryUrl: 'https://www.whyalla.sa.gov.au/library' },

  // WA
  { id: 'perth-wa', name: 'City of Perth', state: 'WA', region: 'perth-metro', population: 25000, areaSqKm: 9.0, website: 'https://www.perth.wa.gov.au', libraryUrl: 'https://www.perth.wa.gov.au/library' },
  { id: 'stirling-wa', name: 'City of Stirling', state: 'WA', region: 'perth-metro', population: 224000, areaSqKm: 103, website: 'https://www.stirling.wa.gov.au', libraryUrl: 'https://www.stirling.wa.gov.au/library' },
  { id: 'wanneroo-wa', name: 'City of Wanneroo', state: 'WA', region: 'perth-metro', population: 230000, areaSqKm: 685, website: 'https://www.wanneroo.wa.gov.au', libraryUrl: 'https://www.wanneroo.wa.gov.au/library' },
  { id: 'joondalup-wa', name: 'City of Joondalup', state: 'WA', region: 'perth-metro', population: 175000, areaSqKm: 99, website: 'https://www.joondalup.wa.gov.au', libraryUrl: 'https://www.joondalup.wa.gov.au/library' },
  { id: 'swan-wa', name: 'City of Swan', state: 'WA', region: 'perth-metro', population: 175000, areaSqKm: 1044, website: 'https://www.swan.wa.gov.au', libraryUrl: 'https://www.swan.wa.gov.au/library' },
  { id: 'fremantle-wa', name: 'City of Fremantle', state: 'WA', region: 'perth-metro', population: 32000, areaSqKm: 19, website: 'https://www.fremantle.wa.gov.au', libraryUrl: 'https://www.fremantle.wa.gov.au/library' },
  { id: 'rockingham-wa', name: 'City of Rockingham', state: 'WA', region: 'perth-south', population: 145000, areaSqKm: 261, website: 'https://www.rockingham.wa.gov.au', libraryUrl: 'https://www.rockingham.wa.gov.au/library' },
  { id: 'mandurah-wa', name: 'City of Mandurah', state: 'WA', region: 'perth-south', population: 93000, areaSqKm: 186, website: 'https://www.mandurah.wa.gov.au', libraryUrl: 'https://www.mandurah.wa.gov.au/library' },
  { id: 'bunbury-wa', name: 'City of Bunbury', state: 'WA', region: 'wa-regional', population: 35000, areaSqKm: 63, website: 'https://www.bunbury.wa.gov.au', libraryUrl: 'https://www.bunbury.wa.gov.au/library' },

  // TAS
  { id: 'hobart-tas', name: 'City of Hobart', state: 'TAS', region: 'hobart-metro', population: 57000, areaSqKm: 77, website: 'https://www.hobartcity.com.au', libraryUrl: 'https://www.hobartcity.com.au/library' },
  { id: 'glenorchy-tas', name: 'Glenorchy City Council', state: 'TAS', region: 'hobart-metro', population: 47000, areaSqKm: 86, website: 'https://www.gcc.tas.gov.au', libraryUrl: 'https://gcc.tas.gov.au/community/libraries' },
  { id: 'clarence-tas', name: 'Clarence City Council', state: 'TAS', region: 'hobart-metro', population: 57000, areaSqKm: 376, website: 'https://www.ccc.tas.gov.au', libraryUrl: 'https://www.ccc.tas.gov.au/community/library' },
  { id: 'launceston-tas', name: 'City of Launceston', state: 'TAS', region: 'launceston', population: 68000, areaSqKm: 1454, website: 'https://www.launceston.tas.gov.au', libraryUrl: 'https://www.launceston.tas.gov.au/library' },
  { id: 'meander-valley-tas', name: 'Meander Valley Council', state: 'TAS', region: 'launceston', population: 21000, areaSqKm: 2799, website: 'https://www.mvcouncil.tas.gov.au', libraryUrl: 'https://www.mvcouncil.tas.gov.au/library' },
  { id: 'devonport-tas', name: 'Devonport City Council', state: 'TAS', region: 'tas-regional', population: 25000, areaSqKm: 111, website: 'https://www.devonport.tas.gov.au', libraryUrl: 'https://www.devonport.tas.gov.au/library' },
  { id: 'burnie-tas', name: 'Burnie City Council', state: 'TAS', region: 'tas-regional', population: 18000, areaSqKm: 610, website: 'https://www.burnie.net', libraryUrl: 'https://www.burnie.net/library' },

  // ACT
  { id: 'act-government', name: 'ACT Government', state: 'ACT', region: 'act', population: 456700, areaSqKm: 2358, website: 'https://www.act.gov.au', libraryUrl: 'https://www.library.act.gov.au' },

  // NT
  { id: 'darwin-nt', name: 'City of Darwin', state: 'NT', region: 'darwin-metro', population: 84000, areaSqKm: 112, website: 'https://www.darwin.nt.gov.au', libraryUrl: 'https://www.darwin.nt.gov.au/community/libraries' },
  { id: 'palmerston-nt', name: 'City of Palmerston', state: 'NT', region: 'darwin-metro', population: 38000, areaSqKm: 65, website: 'https://www.palmerston.nt.gov.au', libraryUrl: 'https://www.palmerston.nt.gov.au/community/libraries' },
  { id: 'alice-springs-nt', name: 'Alice Springs Town Council', state: 'NT', region: 'alice-springs', population: 28000, areaSqKm: 1152, website: 'https://www.alicesprings.nt.gov.au', libraryUrl: 'https://www.alicesprings.nt.gov.au/community/library' },
  { id: 'litchfield-nt', name: 'Litchfield Council', state: 'NT', region: 'darwin-metro', population: 22000, areaSqKm: 4565, website: 'https://www.litchfield.nt.gov.au', libraryUrl: 'https://www.litchfield.nt.gov.au/library' },
  { id: 'katherine-nt', name: 'Katherine Town Council', state: 'NT', region: 'nt-regional', population: 6500, areaSqKm: 105, website: 'https://www.katherine.nt.gov.au', libraryUrl: 'https://www.katherine.nt.gov.au/library' },
]

async function main() {
  console.log(`Seeding ${COUNCILS.length} councils across QLD/SA/WA/TAS/ACT/NT...`)
  for (const c of COUNCILS) {
    await prisma.council.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    })
    // Create one library entry per council
    const libId = `${c.id}-main`
    await prisma.library.upsert({
      where: { id: libId },
      update: { name: `${c.name} Library`, councilId: c.id, url: c.libraryUrl },
      create: { id: libId, name: `${c.name} Library`, councilId: c.id, url: c.libraryUrl },
    })
  }
  const counts = await Promise.all(
    ['QLD','SA','WA','TAS','ACT','NT'].map(s =>
      prisma.council.count({ where: { state: s } }).then(n => `${s}:${n}`)
    )
  )
  console.log('Done.', counts.join(' '))
}

main().catch(console.error).finally(() => prisma.$disconnect())
