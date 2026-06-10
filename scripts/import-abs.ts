import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// The downloaded G01 CSV uses numeric LGA codes (e.g. "LGA24600"), not names.
// Maps ABS LGA codes (ASGS Edition 3, 2021) to our council slugs.
// Also supports legacy name-based keys for manual CSV exports.
const LGA_SLUG_MAP: Record<string, string> = {
  // LGA codes verified against ABS 2021 Census community profiles (ASGS Edition 3)
  'LGA20660': 'banyule',
  'LGA20910': 'bayside',
  'LGA21110': 'boroondara',
  'LGA21180': 'brimbank',
  'LGA21450': 'cardinia',
  'LGA21610': 'casey',
  'LGA21890': 'darebin',
  'LGA22170': 'frankston',
  'LGA22310': 'glen-eira',
  'LGA22670': 'greater-dandenong',
  'LGA23110': 'hobsons-bay',
  'LGA23270': 'hume',
  'LGA23430': 'kingston',
  'LGA23670': 'knox',
  'LGA24210': 'manningham',
  'LGA24330': 'maribyrnong',
  'LGA24410': 'maroondah',
  'LGA24600': 'melbourne',
  'LGA24650': 'melton',
  'LGA24970': 'monash',
  'LGA25060': 'moonee-valley',
  'LGA25250': 'merri-bek',
  'LGA25340': 'mornington-peninsula',
  'LGA25710': 'nillumbik',
  'LGA25900': 'port-phillip',
  'LGA26350': 'stonnington',
  'LGA26980': 'whitehorse',
  'LGA27070': 'whittlesea',
  'LGA27260': 'wyndham',
  'LGA27350': 'yarra',
  'LGA27450': 'yarra-ranges',
  // --- LGA name fallbacks (for manually exported CSVs that include names) ---
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
  // G01 short-header CSV uses LGA_CODE_2021 (e.g. "LGA24600"); long-header uses LGA_NAME_2021
  const lgaIdx = headers.findIndex(h =>
    h === 'LGA_CODE_2021' || h.includes('LGA_NAME') || h === 'lga_name_2021' || h === 'LGA_NAME_2021'
  )
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
