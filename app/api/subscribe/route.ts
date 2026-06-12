import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { email?: string; councils?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { email, councils } = body

  if (!email || !Array.isArray(councils) || councils.length === 0) {
    return NextResponse.json({ error: 'Email and at least one council required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  let subscriber
  try {
    subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: { councils, active: true },
      create: { email, councils },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Subscribe DB error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: subscriber.id })
}
