import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, destroySession, clearAdminCookie } from '@/lib/auth'
export async function POST(req: NextRequest) {
  const token = await getAdminSession()
  destroySession(token)
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
