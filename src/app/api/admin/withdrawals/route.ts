import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

// GET /api/admin/withdrawals - كل طلبات السحب
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const withdrawals = await db.withdrawalRequest.findMany({ orderBy: { requestedAt: 'desc' } })
    return NextResponse.json(withdrawals.map(w => ({
      id: w.id, userId: w.userId, userEmail: w.userEmail, userDisplayName: w.userDisplayName,
      amount: w.amount, amountDH: (w.amount / 1000).toFixed(2), status: w.status,
      paymentMethod: w.paymentMethod, paymentDetails: w.paymentDetails,
      requestedAt: w.requestedAt?.toISOString?.(), processedAt: w.processedAt?.toISOString?.(),
    })))
  } catch { return NextResponse.json([]) }
}

// PATCH - الموافقة/الرفض
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const { id, status } = body
  if (!id || !['approved', 'rejected'].includes(status)) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })

  try {
    const w = await db.withdrawalRequest.findUnique({ where: { id } })
    if (!w) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    if (w.status !== 'pending') return NextResponse.json({ error: 'تمت معالجة هذا الطلب' }, { status: 400 })

    await db.withdrawalRequest.update({ where: { id }, data: { status, processedAt: new Date() } })
    // إذا رُفض، أعد الرصيد للمستخدم
    if (status === 'rejected') {
      await db.userAccount.update({ where: { id: w.userId }, data: { balance: { increment: w.amount } } })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) { return NextResponse.json({ error: 'تعذر المعالجة' }, { status: 500 }) }
}
