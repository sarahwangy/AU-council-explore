import { PrismaClient } from '@prisma/client'

let db = new PrismaClient()

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function reverseLookup(lat: number, lng: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=17`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AustraliaCouncilExplorer/1.0 (sarahwangdk@gmail.com)' }
    })
    if (!res.ok) return null
    const data = await res.json() as { name?: string }
    const name = data.name
    if (name && name.length > 2 && !/^\d+$/.test(name)) return name
    return null
  } catch {
    return null
  }
}

async function updateWithRetry(id: string, name: string, retries = 3): Promise<boolean> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await db.playground.update({ where: { id }, data: { name } })
      return true
    } catch {
      // Reconnect on connection error
      try { await db.$disconnect() } catch {}
      db = new PrismaClient()
      await sleep(2000)
    }
  }
  return false
}

async function main() {
  // Only fetch still-unnamed records (resumes from where it crashed)
  const playgrounds = await db.playground.findMany({
    where: { state: 'VIC', name: null },
    select: { id: true, lat: true, lng: true },
  })

  console.log(`Found ${playgrounds.length} unnamed playgrounds. Resuming reverse lookup...`)

  let updated = 0
  let failed = 0

  for (let i = 0; i < playgrounds.length; i++) {
    const p = playgrounds[i]
    const name = await reverseLookup(p.lat, p.lng)

    if (name) {
      const ok = await updateWithRetry(p.id, name)
      if (ok) updated++
      else failed++
    } else {
      failed++
    }

    if ((i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${playgrounds.length} — updated: ${updated}, no name: ${failed}`)
    }

    await sleep(1100)
  }

  console.log(`\nDone. Updated: ${updated} / ${playgrounds.length} (${failed} had no name in OSM)`)
  await db.$disconnect()
}

main()
