import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// ABS 2021 Census — G04 Age by Sex (LGA level)
// Download from: https://www.abs.gov.au/census/find-census-data/datapacks
// Select: 2021 → General Community Profile → Victoria → LGA → CSV
// File will be named something like: 2021Census_G04A_VIC_LGA.csv + 2021Census_G04B_VIC_LGA.csv
// G04A covers ages 0–54, G04B covers 55+. We need both.
//
// Key columns (suffix _P = persons, _M = male, _F = female):
//   Age_yr_0_4_P, Age_yr_5_9_P, Age_yr_10_14_P,
//   Age_yr_15_19_P, Age_yr_20_24_P ... Age_yr_35_39_P,
//   Age_yr_40_44_P ... Age_yr_60_64_P  (in G04A)
//   Age_yr_65_69_P ... Age_yr_85ov_P   (in G04B)

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
}

function parseCsv(filePath: string): Record<string, Record<string, number>> {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n').filter(l => l.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const lgaIdx = headers.findIndex(h => h === 'LGA_CODE_2021')

  if (lgaIdx === -1) {
    console.error('LGA_CODE_2021 column not found. Headers:', headers.slice(0, 8).join(', '))
    process.exit(1)
  }

  const result: Record<string, Record<string, number>> = {}
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const lgaCode = cols[lgaIdx]
    if (!lgaCode) continue
    result[lgaCode] = {}
    headers.forEach((h, i) => {
      const val = parseFloat(cols[i])
      if (!isNaN(val)) result[lgaCode][h] = val
    })
  }
  return result
}

function sumCols(row: Record<string, number>, cols: string[]): number {
  return cols.reduce((acc, col) => acc + (row[col] ?? 0), 0)
}

async function main() {
  const g04aPath = path.join(process.cwd(), 'data/abs-g04a-2021.csv')
  const g04bPath = path.join(process.cwd(), 'data/abs-g04b-2021.csv')

  if (!fs.existsSync(g04aPath) || !fs.existsSync(g04bPath)) {
    console.error('Missing files. Download from ABS DataPacks:')
    console.error('  https://www.abs.gov.au/census/find-census-data/datapacks')
    console.error('  2021 → General Community Profile → Victoria → LGA → download ZIP')
    console.error('  Extract and rename:')
    console.error('    2021Census_G04A_VIC_LGA.csv → data/abs-g04a-2021.csv')
    console.error('    2021Census_G04B_VIC_LGA.csv → data/abs-g04b-2021.csv')
    process.exit(1)
  }

  const g04a = parseCsv(g04aPath)
  const g04b = parseCsv(g04bPath)

  let imported = 0

  for (const [lgaCode, slug] of Object.entries(LGA_SLUG_MAP)) {
    const a = g04a[lgaCode]
    const b = g04b[lgaCode]

    if (!a && !b) {
      console.warn(`No G04 data for ${lgaCode} (${slug})`)
      continue
    }

    const rowA = a ?? {}
    const rowB = b ?? {}

    // Age buckets — _P suffix = persons. G04 uses single-year columns (Age_yr_0_P, Age_yr_1_P, ...)
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, i) => `Age_yr_${start + i}_P`)

    const count0to4   = sumCols(rowA, range(0, 4))
    const count5to14  = sumCols(rowA, range(5, 14))
    const count15to19 = sumCols(rowA, range(15, 19))
    const count20to39 = sumCols(rowA, range(20, 39))
    const count40to54 = sumCols(rowA, range(40, 54))
    const count55to64 = sumCols(rowB, range(55, 64))
    const count40to64 = count40to54 + count55to64
    const count65to84 = sumCols(rowB, range(65, 84))
    const count85plus = sumCols(rowB, ['Age_yr_85ov_P'])
    const count65plus = count65to84 + count85plus

    const total = count0to4 + count5to14 + count15to19 + count20to39 + count40to64 + count65plus

    if (total === 0) {
      console.warn(`Zero population total for ${lgaCode} (${slug}) — skipping`)
      continue
    }

    const pct = (n: number) => parseFloat(((n / total) * 100).toFixed(2))

    await prisma.councilStats.upsert({
      where: { councilId: slug },
      update: {
        agePct0to4:   pct(count0to4),
        agePct5to14:  pct(count5to14),
        agePct15to19: pct(count15to19),
        agePct20to39: pct(count20to39),
        agePct40to64: pct(count40to64),
        agePct65plus: pct(count65plus),
        dataYear: 2021,
      },
      create: {
        councilId:    slug,
        agePct0to4:   pct(count0to4),
        agePct5to14:  pct(count5to14),
        agePct15to19: pct(count15to19),
        agePct20to39: pct(count20to39),
        agePct40to64: pct(count40to64),
        agePct65plus: pct(count65plus),
        dataYear: 2021,
      },
    })

    console.log(`${slug}: 0-4=${pct(count0to4)}% | 5-14=${pct(count5to14)}% | 15-19=${pct(count15to19)}% | 65+=${pct(count65plus)}%`)
    imported++
  }

  console.log(`\nImported age stats for ${imported} councils.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
