import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// Maps ABS LGA names (from Census G01 table) to our council slugs
const LGA_SLUG_MAP: Record<string, string> = {
  'Melbourne (C)': 'melbourne',
  'Port Phillip (C)': 'port-phillip',
  'Stonnington (C)': 'stonnington',
  'Yarra (C)': 'yarra',
  'Boroondara (C)': 'boroondara',
  'Manningham (C)': 'manningham',
  'Whitehorse (C)': 'whitehorse',
  'Maroondah (C)': 'maroondah',
  'Knox (C)': 'knox',
  'Yarra Ranges (S)': 'yarra-ranges',
  'Monash (C)': 'monash',
  'Glen Eira (C)': 'glen-eira',
  'Bayside (C)': 'bayside',
  'Kingston (C)': 'kingston',
  'Frankston (C)': 'frankston',
  'Mornington Peninsula (S)': 'mornington-peninsula',
  'Banyule (C)': 'banyule',
  'Nillumbik (S)': 'nillumbik',
  'Whittlesea (C)': 'whittlesea',
  'Darebin (C)': 'darebin',
  'Moreland (C)': 'merri-bek',
  'Hume (C)': 'hume',
  'Brimbank (C)': 'brimbank',
  'Hobsons Bay (C)': 'hobsons-bay',
  'Maribyrnong (C)': 'maribyrnong',
  'Melton (C)': 'melton',
  'Moonee Valley (C)': 'moonee-valley',
  'Wyndham (C)': 'wyndham',
  'Casey (C)': 'casey',
  'Cardinia (S)': 'cardinia',
  'Greater Dandenong (C)': 'greater-dandenong',
}

async function main() {
  const csvPath = path.join(process.cwd(), 'data/abs-lga-2021.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('Missing data/abs-lga-2021.csv — download from https://www.abs.gov.au/census/find-census-data/community-profiles/2021/LGA')
    console.error('Select Victoria → G01 Selected Person Characteristics by Sex → CSV')
    process.exit(1)
  }

  const csv = fs.readFileSync(csvPath, 'utf8')
  const lines = csv.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

  const totalIdx = headers.findIndex(h => h === 'Tot_P_P')
  const maleIdx = headers.findIndex(h => h === 'Tot_P_M')
  const femaleIdx = headers.findIndex(h => h === 'Tot_P_F')
  const lgaIdx = headers.findIndex(h => h.includes('LGA_NAME') || h === 'lga_name_2021' || h === 'LGA_NAME_2021')
  const medianAgeIdx = headers.findIndex(h => h.includes('Median_age') || h === 'Median_age_persons')

  if (totalIdx === -1 || lgaIdx === -1) {
    console.error('CSV headers not found. Available headers:', headers.slice(0, 10))
    process.exit(1)
  }

  let imported = 0
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const lgaName = cols[lgaIdx]
    const slug = LGA_SLUG_MAP[lgaName]
    if (!slug) continue

    const total = parseInt(cols[totalIdx]) || 0
    const male = maleIdx >= 0 ? parseInt(cols[maleIdx]) || 0 : 0
    const female = femaleIdx >= 0 ? parseInt(cols[femaleIdx]) || 0 : 0
    const medianAge = medianAgeIdx >= 0 ? parseInt(cols[medianAgeIdx]) || null : null

    await prisma.council.update({
      where: { id: slug },
      data: { population: total },
    })

    await prisma.councilStats.upsert({
      where: { councilId: slug },
      update: {
        malePercent: total > 0 ? (male / total) * 100 : null,
        femalePercent: total > 0 ? (female / total) * 100 : null,
        medianAge,
        dataYear: 2021,
      },
      create: {
        councilId: slug,
        malePercent: total > 0 ? (male / total) * 100 : null,
        femalePercent: total > 0 ? (female / total) * 100 : null,
        medianAge,
        dataYear: 2021,
      },
    })
    imported++
  }
  console.log(`Imported stats for ${imported} councils.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
