import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/user-auth'

const POINTS_TO_DH = 1000 // 1000 نقطة = 1 درهم
const MIN_WITHDRAW = 10000 // 10000 نقطة = 10 درهم = الحد الأدنى للسحب

// GET /api/earnings/balance - رصيد المستخدم
export async function GET() {
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ user: null })
  try {
    const user = await db.userAccount.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, balance: true, totalSongsListened: true }
    })
    if (!user) return NextResponse.json({ user: null })
    const recentEarnings = await db.earningLog.findMany({
      where: { userId }, orderBy: { earnedAt: 'desc' }, take: 20
    })
    const pendingWithdrawals = await db.withdrawalRequest.count({
      where: { userId, status: 'pending' }
    })
    return NextResponse.json({
      user,
      pointsToDH: POINTS_TO_DH,
      minWithdraw: MIN_WITHDRAW,
      balanceDH: (user.balance / POINTS_TO_DH).toFixed(2),
      recentEarnings: recentEarnings.map(e => ({ id: e.id, songTitle: e.songTitle, points: e.points, earnedAt: e.earnedAt.toISOString() })),
      pendingWithdrawals,
    })
  } catch (e: any) { console.error('balance error', e); return NextResponse.json({ user: null }) }
}
