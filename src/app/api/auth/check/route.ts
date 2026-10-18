import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/user-auth'

export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ user: null })
  try {
    const user = await db.userAccount.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, balance: true, totalSongsListened: true }
    })
    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user })
  } catch { return NextResponse.json({ user: null }) }
}
