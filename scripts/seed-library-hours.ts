import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Hours for the main branch of each council (researched June 2026)
// Format: { mon: "open-close" | null, ... }  null = closed
const MAIN_BRANCH_HOURS: Record<string, { libraryName: string; hours: Record<string, string | null> }> = {
  'banyule':               { libraryName: 'Ivanhoe Library',            hours: { mon: '9:00-21:00', tue: '9:00-21:00', wed: '9:00-21:00', thu: '9:00-21:00', fri: '9:00-18:00', sat: '10:00-17:00', sun: '10:00-17:00' } },
  'bayside':               { libraryName: 'Sandringham Library',         hours: { mon: '10:00-18:00', tue: '10:00-20:00', wed: '10:00-18:00', thu: '10:00-20:00', fri: '10:00-18:00', sat: '10:00-16:00', sun: '13:00-16:00' } },
  'boroondara':            { libraryName: 'Camberwell Library',          hours: { mon: '9:00-21:00', tue: '9:00-18:00', wed: '9:00-18:00', thu: '9:00-18:00', fri: '9:00-18:00', sat: '10:00-17:00', sun: '13:00-17:00' } },
  'brimbank':              { libraryName: 'Sunshine Library',            hours: { mon: '9:30-20:00', tue: '9:30-20:00', wed: '9:30-20:00', thu: '9:30-20:00', fri: '9:30-17:00', sat: '10:00-17:00', sun: '13:00-17:00' } },
  'cardinia':              { libraryName: 'Pakenham Library',            hours: { mon: '9:00-20:00', tue: '9:00-20:00', wed: '9:00-20:00', thu: '9:00-20:00', fri: '9:00-21:00', sat: '10:00-16:00', sun: '13:00-16:00' } },
  'casey':                 { libraryName: 'Cranbourne Library',          hours: { mon: '9:00-20:00', tue: '9:00-20:00', wed: '9:00-20:00', thu: '9:00-20:00', fri: '9:00-18:00', sat: '10:00-16:00', sun: null } },
  'darebin':               { libraryName: 'Preston Library',             hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-20:00', fri: '10:00-20:00', sat: '10:00-16:00', sun: '11:00-17:00' } },
  'frankston':             { libraryName: 'Frankston Library',           hours: { mon: '9:00-19:00', tue: '9:00-19:00', wed: '9:00-19:00', thu: '9:00-19:00', fri: '9:00-19:00', sat: '10:00-16:00', sun: '10:00-16:00' } },
  'glen-eira':             { libraryName: 'Caulfield Library',           hours: { mon: '10:00-18:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-20:00', fri: '10:00-18:00', sat: '13:00-16:00', sun: '12:00-17:00' } },
  'greater-dandenong':     { libraryName: 'Dandenong Library',           hours: { mon: '9:00-21:00', tue: '9:00-21:00', wed: '9:00-21:00', thu: '9:00-21:00', fri: '9:00-21:00', sat: '10:00-17:00', sun: '12:00-17:00' } },
  'hobsons-bay':           { libraryName: 'Williamstown Library',        hours: { mon: '9:30-18:00', tue: '9:30-18:00', wed: '9:30-18:00', thu: '9:30-20:00', fri: '9:30-18:00', sat: '10:00-16:00', sun: '10:00-16:00' } },
  'hume':                  { libraryName: 'Broadmeadows Library',        hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-22:00', fri: '10:00-17:00', sat: '10:00-16:00', sun: '13:00-16:00' } },
  'kingston':              { libraryName: 'Cheltenham Library',          hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-18:00', fri: '10:00-18:00', sat: '10:00-14:00', sun: '14:00-17:00' } },
  'knox':                  { libraryName: 'Knox Library – Ngarrgoo',     hours: { mon: '9:00-17:30', tue: '9:00-17:30', wed: '9:00-17:30', thu: '9:00-20:00', fri: '9:00-17:30', sat: '10:00-17:00', sun: '12:00-17:00' } },
  'manningham':            { libraryName: 'Doncaster Library',           hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '13:00-20:00', thu: '10:00-20:00', fri: '10:00-17:00', sat: '9:30-17:00', sun: '14:00-17:00' } },
  'maribyrnong':           { libraryName: 'Footscray Library',           hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-20:00', fri: '10:00-20:00', sat: '10:00-17:00', sun: '14:00-17:00' } },
  'maroondah':             { libraryName: 'Realm Library',               hours: { mon: '9:00-20:00', tue: '9:00-20:00', wed: '9:00-20:00', thu: '9:00-20:00', fri: '9:00-20:00', sat: '10:00-17:00', sun: '10:00-17:00' } },
  'melbourne':             { libraryName: 'City Library',                hours: { mon: '8:00-20:00', tue: '8:00-20:00', wed: '8:00-20:00', thu: '8:00-20:00', fri: '8:00-18:00', sat: '10:00-17:00', sun: '12:00-17:00' } },
  'melton':                { libraryName: 'Melton Library & Learning Hub', hours: { mon: '8:30-20:00', tue: '8:30-20:00', wed: '8:30-20:00', thu: '8:30-20:00', fri: '8:30-17:30', sat: '10:00-16:00', sun: '13:00-16:00' } },
  'merri-bek':             { libraryName: 'Coburg Library',              hours: { mon: '9:00-20:00', tue: '9:00-20:00', wed: '9:00-20:00', thu: '9:00-20:00', fri: '9:00-20:00', sat: '9:00-16:00', sun: '13:00-17:00' } },
  'monash':                { libraryName: 'Clayton Library',             hours: { mon: '9:30-20:00', tue: '9:30-20:00', wed: '9:30-20:00', thu: '9:30-20:00', fri: '9:30-20:00', sat: '9:30-16:00', sun: '14:00-17:00' } },
  'moonee-valley':         { libraryName: 'Sam Merrifield Library',      hours: { mon: '9:00-21:00', tue: '9:00-21:00', wed: '9:00-21:00', thu: '9:00-20:00', fri: '9:00-17:00', sat: '9:00-17:00', sun: '13:00-17:00' } },
  'mornington-peninsula':  { libraryName: 'Mornington Library',          hours: { mon: '9:00-14:00', tue: '9:00-20:00', wed: '9:00-18:00', thu: '9:00-20:00', fri: '9:00-18:00', sat: '9:00-14:00', sun: null } },
  'nillumbik':             { libraryName: 'Eltham Library',              hours: { mon: '9:00-21:00', tue: '9:00-21:00', wed: '9:00-21:00', thu: '9:00-21:00', fri: '9:00-18:00', sat: '10:00-17:00', sun: '10:00-17:00' } },
  'port-phillip':          { libraryName: 'St Kilda Library',            hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-20:00', fri: '10:00-18:00', sat: '10:00-17:00', sun: '10:00-17:00' } },
  'stonnington':           { libraryName: 'Malvern Library',             hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-20:00', fri: '10:00-18:00', sat: '10:00-17:00', sun: '14:00-17:00' } },
  'whitehorse':            { libraryName: 'Box Hill Library',            hours: { mon: '10:00-20:00', tue: '10:00-20:00', wed: '10:00-20:00', thu: '10:00-20:00', fri: '10:00-20:00', sat: '9:00-17:00', sun: '13:00-16:00' } },
  'whittlesea':            { libraryName: 'Mill Park Library',           hours: { mon: '9:00-21:00', tue: '9:00-21:00', wed: '9:00-21:00', thu: '9:00-22:00', fri: '9:00-18:00', sat: '10:00-17:00', sun: '10:00-17:00' } },
  'wyndham':               { libraryName: 'Werribee Library',            hours: { mon: '10:00-18:00', tue: '10:00-18:00', wed: '10:00-18:00', thu: '10:00-20:00', fri: '10:00-18:00', sat: '10:00-16:00', sun: null } },
  'yarra-ranges':          { libraryName: 'Lilydale Library',            hours: { mon: '9:00-17:30', tue: '9:00-17:30', wed: '9:00-20:00', thu: '9:00-17:30', fri: '9:00-17:30', sat: '10:00-13:00', sun: '13:00-16:00' } },
}

async function main() {
  let updated = 0
  let notFound = 0

  for (const [councilId, { libraryName, hours }] of Object.entries(MAIN_BRANCH_HOURS)) {
    const library = await prisma.library.findFirst({
      where: { councilId, name: libraryName },
    })

    if (!library) {
      console.warn(`⚠️  Not found: ${councilId} / "${libraryName}"`)
      notFound++
      continue
    }

    await prisma.library.update({
      where: { id: library.id },
      data: { hoursJson: JSON.stringify(hours) },
    })
    console.log(`✅ ${councilId} — ${libraryName}`)
    updated++
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not found`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
