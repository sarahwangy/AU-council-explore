import { prisma } from '../lib/prisma'
import councils from '../data/councils.json'

async function main() {
  console.log(`Seeding ${councils.length} councils...`)
  for (const council of councils) {
    await prisma.council.upsert({
      where: { id: council.id },
      update: council,
      create: council,
    })
  }
  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
