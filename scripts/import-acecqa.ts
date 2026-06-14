/**
 * Import ACECQA Education Services CSV into Childcare table.
 * Replaces OSM data with official government data.
 * Run: npx tsx scripts/import-acecqa.ts
 */
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const db = new PrismaClient()

interface Row {
  ServiceApprovalNumber: string
  ServiceName: string
  ProviderLegalName: string
  ServiceType: string
  ServiceAddress: string
  Suburb: string
  State: string
  Postcode: string
  Phone: string
  NumberOfApprovedPlaces: string
  OverallRating: string
  'Long Day Care': string
  'Preschool/Kindergarten - Part of a School': string
  'Preschool/Kindergarten - Stand alone': string
  'Outside school Hours Care - After School': string
  'Outside school Hours Care - Before School': string
  'Outside school Hours Care - Vacation Care': string
  'Annual Monday Start Time': string
  'Annual Monday End Time': string
  'Annual Tuesday Start Time': string
  'Annual Tuesday End Time': string
  'Annual Wednesday Start Time': string
  'Annual Wednesday End Time': string
  'Annual Thursday Start Time': string
  'Annual Thursday End Time': string
  'Annual Friday Start Time': string
  'Annual Friday End Time': string
  'Annual Saturday Start Time': string
  'Annual Saturday End Time': string
  'Temporarily Closed': string
}

function parseServiceType(row: Row): string {
  if (row['Long Day Care'] === 'Yes') return 'Long Day Care'
  if (row['Preschool/Kindergarten - Stand alone'] === 'Yes') return 'Kindergarten / Preschool'
  if (row['Preschool/Kindergarten - Part of a School'] === 'Yes') return 'Kindergarten / Preschool'
  if (row['Outside school Hours Care - After School'] === 'Yes' ||
      row['Outside school Hours Care - Before School'] === 'Yes' ||
      row['Outside school Hours Care - Vacation Care'] === 'Yes') return 'Outside School Hours Care'
  if (row.ServiceType === 'Family Day Care') return 'Family Day Care'
  return row.ServiceType || 'Centre-Based Care'
}

function parseHours(row: Row): string | null {
  const days: string[] = []
  const dayMap = [
    ['Mon', 'Annual Monday Start Time', 'Annual Monday End Time'],
    ['Tue', 'Annual Tuesday Start Time', 'Annual Tuesday End Time'],
    ['Wed', 'Annual Wednesday Start Time', 'Annual Wednesday End Time'],
    ['Thu', 'Annual Thursday Start Time', 'Annual Thursday End Time'],
    ['Fri', 'Annual Friday Start Time', 'Annual Friday End Time'],
    ['Sat', 'Annual Saturday Start Time', 'Annual Saturday End Time'],
  ] as const
  for (const [label, startKey, endKey] of dayMap) {
    const start = (row as unknown as Record<string, string>)[startKey]?.trim()
    const end = (row as unknown as Record<string, string>)[endKey]?.trim()
    if (start && end) days.push(`${label} ${start}–${end}`)
  }
  return days.length > 0 ? days.join(', ') : null
}

async function parseCSV(filePath: string): Promise<Row[]> {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const headers = parseCSVLine(lines[0])
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = parseCSVLine(line)
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => { obj[h] = values[idx] ?? '' })
    rows.push(obj as unknown as Row)
  }
  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'acecqa-Education-services-vic-export.csv')
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath)
    process.exit(1)
  }

  console.log('Parsing ACECQA CSV...')
  const rows = await parseCSV(filePath)
  console.log(`Found ${rows.length} services`)

  // Clear existing VIC childcare data (OSM data)
  const deleted = await db.childcare.deleteMany({ where: { state: 'VIC' } })
  console.log(`Cleared ${deleted.count} existing VIC childcare records`)

  let imported = 0, skipped = 0

  for (const row of rows) {
    if (!row.ServiceApprovalNumber || !row.ServiceName) { skipped++; continue }
    if (row['Temporarily Closed'] === 'Yes') { skipped++; continue }

    const serviceType = parseServiceType(row)
    const hours = parseHours(row)
    const rating = row.OverallRating?.trim() || null
    const address = row.ServiceAddress?.trim() || null
    const suburb = row.Suburb?.trim() || null

    await db.childcare.upsert({
      where: { acecqaId: row.ServiceApprovalNumber },
      create: {
        acecqaId: row.ServiceApprovalNumber,
        name: row.ServiceName.trim(),
        providerName: row.ProviderLegalName?.trim() || null,
        serviceType,
        address,
        suburb,
        postcode: row.Postcode?.trim() || null,
        state: 'VIC',
        phone: row.Phone?.trim() || null,
        qualityRating: rating,
        operatingHours: hours,
        approved: true,
      },
      update: {
        name: row.ServiceName.trim(),
        providerName: row.ProviderLegalName?.trim() || null,
        serviceType,
        address,
        suburb,
        qualityRating: rating,
        operatingHours: hours,
      },
    })
    imported++
  }

  console.log(`\n✓ Imported: ${imported}`)
  console.log(`  Skipped (closed/invalid): ${skipped}`)

  // Show rating breakdown
  const ratings = await db.childcare.groupBy({
    by: ['qualityRating'],
    where: { state: 'VIC' },
    _count: true,
    orderBy: { _count: { qualityRating: 'desc' } },
  })
  console.log('\nRating breakdown:')
  ratings.forEach(r => console.log(`  ${r.qualityRating ?? '(unrated)'}: ${r._count}`))

  console.log('\n⚠️  Note: lat/lng not yet set — ACECQA CSV has addresses but no coordinates.')
  console.log('   Run geocoding script next to enable map view.')

  await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
