import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  await prisma.subscriber.updateMany({
    where: { token },
    data: { active: false },
  })

  return NextResponse.redirect(new URL('/unsubscribed', req.url))
}
