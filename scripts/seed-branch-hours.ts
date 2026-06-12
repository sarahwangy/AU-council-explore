// Copy the main branch's hoursJson to all other branches in the same council
// that don't yet have hours. This is a reasonable approximation — branches
// in the same network usually keep similar hours.
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allLibraries = await prisma.library.findMany({
    select: { id: true, name: true, councilId: true, hoursJson: true },
    orderBy: [{ councilId: 'asc' }, { name: 'asc' }],
  })

  // Group by council
  const byCouncil = new Map<string, typeof allLibraries>()
  for (const lib of allLibraries) {
    const arr = byCouncil.get(lib.councilId) ?? []
    arr.push(lib)
    byCouncil.set(lib.councilId, arr)
  }

  let updated = 0
  for (const [councilId, libs] of byCouncil) {
    const mainBranch = libs.find(l => l.hoursJson)
    if (!mainBranch) continue

    const branches = libs.filter(l => !l.hoursJson)
    for (const branch of branches) {
      await prisma.library.update({
        where: { id: branch.id },
        data: { hoursJson: mainBranch.hoursJson },
      })
      console.log(`✅ ${councilId} / ${branch.name} ← from ${mainBranch.name}`)
      updated++
    }
  }

  console.log(`\nDone: ${updated} branches updated`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
