import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DATA = [
  { councilId: 'banyule', overseasBornPct: 27.6, medianHouseholdIncome: 2027, topLanguages: [{ language: 'Mandarin', pct: 4.0 }, { language: 'Italian', pct: 2.4 }, { language: 'Greek', pct: 2.0 }] },
  { councilId: 'bayside', overseasBornPct: 30.3, medianHouseholdIncome: 2487, topLanguages: [{ language: 'Mandarin', pct: 2.8 }, { language: 'Greek', pct: 2.0 }, { language: 'Russian', pct: 1.3 }] },
  { councilId: 'boroondara', overseasBornPct: 35.4, medianHouseholdIncome: 2376, topLanguages: [{ language: 'Mandarin', pct: 10.4 }, { language: 'Cantonese', pct: 3.0 }, { language: 'Greek', pct: 2.7 }] },
  { councilId: 'brimbank', overseasBornPct: 54.1, medianHouseholdIncome: 1506, topLanguages: [{ language: 'Vietnamese', pct: 18.5 }, { language: 'Greek', pct: 2.4 }, { language: 'Punjabi', pct: 2.2 }] },
  { councilId: 'cardinia', overseasBornPct: 28.5, medianHouseholdIncome: 1874, topLanguages: [{ language: 'Punjabi', pct: 2.9 }, { language: 'Sinhalese', pct: 1.8 }, { language: 'Hindi', pct: 0.8 }] },
  { councilId: 'casey', overseasBornPct: 46.5, medianHouseholdIncome: 1918, topLanguages: [{ language: 'Punjabi', pct: 4.6 }, { language: 'Sinhalese', pct: 3.5 }, { language: 'Hazaraghi', pct: 3.2 }] },
  { councilId: 'darebin', overseasBornPct: 35.6, medianHouseholdIncome: 1829, topLanguages: [{ language: 'Greek', pct: 5.7 }, { language: 'Italian', pct: 5.3 }, { language: 'Mandarin', pct: 3.1 }] },
  { councilId: 'frankston', overseasBornPct: 26.3, medianHouseholdIncome: 1653, topLanguages: [{ language: 'Mandarin', pct: 1.0 }, { language: 'Greek', pct: 0.9 }, { language: 'Italian', pct: 0.5 }] },
  { councilId: 'glen-eira', overseasBornPct: 40.1, medianHouseholdIncome: 2133, topLanguages: [{ language: 'Mandarin', pct: 5.6 }, { language: 'Greek', pct: 3.6 }, { language: 'Russian', pct: 3.1 }] },
  { councilId: 'greater-dandenong', overseasBornPct: 63.4, medianHouseholdIncome: 1453, topLanguages: [{ language: 'Vietnamese', pct: 11.9 }, { language: 'Khmer', pct: 6.1 }, { language: 'Mandarin', pct: 3.9 }] },
  { councilId: 'hobsons-bay', overseasBornPct: 34.6, medianHouseholdIncome: 1972, topLanguages: [{ language: 'Arabic', pct: 3.0 }, { language: 'Greek', pct: 2.5 }, { language: 'Vietnamese', pct: 2.1 }] },
  { councilId: 'hume', overseasBornPct: 44.9, medianHouseholdIncome: 1703, topLanguages: [{ language: 'Arabic', pct: 9.3 }, { language: 'Turkish', pct: 6.1 }, { language: 'Punjabi', pct: 5.2 }] },
  { councilId: 'kingston', overseasBornPct: 35.1, medianHouseholdIncome: 1914, topLanguages: [{ language: 'Greek', pct: 4.2 }, { language: 'Mandarin', pct: 3.5 }, { language: 'Russian', pct: 1.3 }] },
  { councilId: 'knox', overseasBornPct: 36.0, medianHouseholdIncome: 1884, topLanguages: [{ language: 'Mandarin', pct: 7.3 }, { language: 'Cantonese', pct: 3.5 }, { language: 'Sinhalese', pct: 1.7 }] },
  { councilId: 'manningham', overseasBornPct: 46.5, medianHouseholdIncome: 1920, topLanguages: [{ language: 'Mandarin', pct: 13.9 }, { language: 'Cantonese', pct: 8.5 }, { language: 'Greek', pct: 5.5 }] },
  { councilId: 'maribyrnong', overseasBornPct: 43.0, medianHouseholdIncome: 1998, topLanguages: [{ language: 'Vietnamese', pct: 11.7 }, { language: 'Cantonese', pct: 2.8 }, { language: 'Mandarin', pct: 2.4 }] },
  { councilId: 'maroondah', overseasBornPct: 28.2, medianHouseholdIncome: 1867, topLanguages: [{ language: 'Mandarin', pct: 4.7 }, { language: 'Cantonese', pct: 1.7 }, { language: 'Chin Haka', pct: 0.9 }] },
  { councilId: 'melbourne', overseasBornPct: 62.0, medianHouseholdIncome: 1678, topLanguages: [{ language: 'Mandarin', pct: 14.3 }, { language: 'Cantonese', pct: 3.4 }, { language: 'Spanish', pct: 2.7 }] },
  { councilId: 'melton', overseasBornPct: 40.5, medianHouseholdIncome: 1887, topLanguages: [{ language: 'Punjabi', pct: 5.9 }, { language: 'Vietnamese', pct: 2.5 }, { language: 'Arabic', pct: 2.0 }] },
  { councilId: 'monash', overseasBornPct: 54.3, medianHouseholdIncome: 1901, topLanguages: [{ language: 'Mandarin', pct: 15.2 }, { language: 'Greek', pct: 5.4 }, { language: 'Cantonese', pct: 4.6 }] },
  { councilId: 'moonee-valley', overseasBornPct: 31.5, medianHouseholdIncome: 2011, topLanguages: [{ language: 'Italian', pct: 5.5 }, { language: 'Greek', pct: 2.9 }, { language: 'Vietnamese', pct: 2.4 }] },
  { councilId: 'merri-bek', overseasBornPct: 37.1, medianHouseholdIncome: 1943, topLanguages: [{ language: 'Italian', pct: 5.8 }, { language: 'Arabic', pct: 4.5 }, { language: 'Greek', pct: 4.0 }] },
  { councilId: 'mornington-peninsula', overseasBornPct: 23.4, medianHouseholdIncome: 1555, topLanguages: [{ language: 'Italian', pct: 0.9 }, { language: 'Greek', pct: 0.8 }, { language: 'German', pct: 0.3 }] },
  { councilId: 'nillumbik', overseasBornPct: 19.0, medianHouseholdIncome: 2476, topLanguages: [{ language: 'Italian', pct: 1.3 }, { language: 'Mandarin', pct: 1.2 }, { language: 'Greek', pct: 0.9 }] },
  { councilId: 'port-phillip', overseasBornPct: 39.3, medianHouseholdIncome: 2069, topLanguages: [{ language: 'Greek', pct: 2.5 }, { language: 'Mandarin', pct: 2.1 }, { language: 'Spanish', pct: 1.9 }] },
  { councilId: 'stonnington', overseasBornPct: 36.1, medianHouseholdIncome: 2210, topLanguages: [{ language: 'Mandarin', pct: 4.6 }, { language: 'Greek', pct: 3.3 }, { language: 'Cantonese', pct: 1.4 }] },
  { councilId: 'whitehorse', overseasBornPct: 44.9, medianHouseholdIncome: 1841, topLanguages: [{ language: 'Mandarin', pct: 16.2 }, { language: 'Cantonese', pct: 5.5 }, { language: 'Greek', pct: 2.3 }] },
  { councilId: 'whittlesea', overseasBornPct: 41.8, medianHouseholdIncome: 1768, topLanguages: [{ language: 'Arabic', pct: 5.2 }, { language: 'Macedonian', pct: 4.3 }, { language: 'Punjabi', pct: 4.3 }] },
  { councilId: 'wyndham', overseasBornPct: 53.1, medianHouseholdIncome: 2023, topLanguages: [{ language: 'Punjabi', pct: 7.1 }, { language: 'Hindi', pct: 4.8 }, { language: 'Mandarin', pct: 3.6 }] },
  { councilId: 'yarra', overseasBornPct: 33.8, medianHouseholdIncome: 2270, topLanguages: [{ language: 'Vietnamese', pct: 3.3 }, { language: 'Greek', pct: 2.2 }, { language: 'Mandarin', pct: 1.9 }] },
  { councilId: 'yarra-ranges', overseasBornPct: 20.6, medianHouseholdIncome: 1881, topLanguages: [{ language: 'Mandarin', pct: 0.8 }, { language: 'Italian', pct: 0.7 }, { language: 'Chin Haka', pct: 0.7 }] },
]

async function main() {
  let updated = 0
  for (const row of DATA) {
    await prisma.councilStats.upsert({
      where: { councilId: row.councilId },
      update: {
        overseasBornPct: row.overseasBornPct,
        medianHouseholdIncome: row.medianHouseholdIncome,
        topLanguagesJson: JSON.stringify(row.topLanguages),
      },
      create: {
        councilId: row.councilId,
        overseasBornPct: row.overseasBornPct,
        medianHouseholdIncome: row.medianHouseholdIncome,
        topLanguagesJson: JSON.stringify(row.topLanguages),
      },
    })
    updated++
    console.log(`✅ ${row.councilId}`)
  }
  console.log(`\nDone: ${updated}/31 councils updated`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
