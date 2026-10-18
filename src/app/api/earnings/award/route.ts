import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/user-auth'

const POINTS_PER_SONG = 5

// POST /api/earnings/award - منح نقاط عند إكمال أغنية
export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ error: 'غير مسجل' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const songId = body?.songId
  const songTitle = body?.songTitle
  if (!songId) return NextResponse.json({ error: 'معرف الأغنية مطلوب' }, { status: 400 })

  try {
    // تحقق من عدم منح نقاط مكررة لنفس الأغنية في نفس الساعة
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recent = await db.earningLog.findFirst({
      where: { userId, songId, earnedAt: { gt: oneHourAgo } }
    })
    if (recent) return NextResponse.json({ ok: true, points: 0, message: 'تم منح نقاط لهذه الأغنية مؤخرًا' })

    // منح النقاط
    const log = await db.earningLog.create({ data: { userId, songId, songTitle, points: POINTS_PER_SONG } })
    // تحديث الرصيد وعدد الأغاني
    const updated = await db.userAccount.update({
      where: { id: userId },
      data: { balance: { increment: POINTS_PER_SONG }, totalSongsListened: { increment: 1 } }
    })
    return NextResponse.json({ ok: true, points: POINTS_PER_SONG, balance: updated.balance, totalSongsListened: updated.totalSongsListened })
  } catch (e: any) { console.error('award error', e); return NextResponse.json({ error: 'تعذر منح النقاط' }, { status: 500 }) }
}
