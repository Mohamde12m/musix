import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserSession, validateUserSession } from '@/lib/user-auth'

export async function GET() {
  const token = await getUserSession()
  if (!validateUserSession(token)) return NextResponse.json({ user: null })
  try {
    // البحث عن المستخدم عبر session
    const userSessions = (globalThis as any).__userSessions as Map<string, string> | undefined
    const userId = userSessions?.get(token)
    if (!userId) return NextResponse.json({ user: null })
    const user = await db.userAccount.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true, balance: true, totalSongsListened: true } })
    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user })
  } catch { return NextResponse.json({ user: null }) }
}
