import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/user-auth'
import crypto from 'crypto'

const REWARD_POINTS = 50
const MAX_PER_DAY = 5 // 5 مرات في اليوم
const rid = () => 'c' + crypto.randomBytes(16).toString('hex')

// POST /api/earnings/reward — منح نقاط بعد مشاهدة إعلان
export async function POST() {
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ error: 'غير مسجل' }, { status: 401 })

  try {
    // تحقق من عدد المرات اليوم
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCount = await db.earningLog.count({
      where: { userId, earnedAt: { gte: todayStart }, points: REWARD_POINTS }
    })
    if (todayCount >= MAX_PER_DAY) {
      return NextResponse.json({ error: `لقد وصلت للحد الأقصى (${MAX_PER_DAY} مرات يوميًا)` }, { status: 429 })
    }

    // منح النقاط
    const log = await db.earningLog.create({
      data: { id: rid(), userId, songId: null, songTitle: 'مكافأة إعلان', points: REWARD_POINTS }
    })
    const updated = await db.userAccount.update({
      where: { id: userId },
      data: { balance: { increment: REWARD_POINTS } }
    })

    return NextResponse.json({
      ok: true,
      points: REWARD_POINTS,
      balance: updated.balance,
      remainingToday: MAX_PER_DAY - todayCount - 1,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'تعذر منح المكافأة' }, { status: 500 })
  }
}
