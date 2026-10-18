import { NextResponse } from 'next/server'
import { getUserSession, destroyUserSession, clearUserCookie } from '@/lib/user-auth'

export async function POST() {
  const token = await getUserSession()
  destroyUserSession(token)
  await clearUserCookie()
  return NextResponse.json({ ok: true })
}
