import { prisma } from '../lib/prisma'
async function main() {
  const r = await (prisma as any).$queryRawUnsafe('SELECT state, COUNT(*)::int as cnt FROM "Council" GROUP BY state ORDER BY state')
  console.log('Councils by state:', JSON.stringify(r))
  const libs = await prisma.library.count()
  console.log('Libraries:', libs)
  const stats = await prisma.councilStats.count()
  console.log('CouncilStats:', stats)
  const events = await prisma.event.count()
  console.log('Events:', events)
}
main().catch(console.error).finally(() => prisma.$disconnect())
