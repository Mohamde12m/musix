import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/user-auth'

const MIN_WITHDRAW = 10000 // 10000 نقطة = 10 درهم
const POINTS_TO_DH = 1000

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return NextResponse.json({ error: 'غير مسجل' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }

  const paymentMethod = body?.paymentMethod?.toString?.()?.trim()
  const paymentDetails = body?.paymentDetails?.toString?.()?.trim()
  if (!paymentMethod || !paymentDetails) return NextResponse.json({ error: 'طريقة الدفع مطلوبة' }, { status: 400 })

  try {
    const user = await db.userAccount.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    if (user.balance < MIN_WITHDRAW) return NextResponse.json({ error: `الحد الأدنى للسحب ${MIN_WITHDRAW / POINTS_TO_DH} درهم` }, { status: 400 })

    // تحقق من عدم وجود طلب سحب معلق
    const pending = await db.withdrawalRequest.count({ where: { userId, status: 'pending' } })
    if (pending > 0) return NextResponse.json({ error: 'لديك طلب سحب معلق بالفعل' }, { status: 400 })

    const amount = user.balance
    await db.withdrawalRequest.create({
      data: { userId, userEmail: user.email, userDisplayName: user.displayName, amount, status: 'pending', paymentMethod, paymentDetails }
    })
    // خصم الرصيد (سيُعاد إذا رُفض الطلب)
    await db.userAccount.update({ where: { id: userId }, data: { balance: 0 } })
    return NextResponse.json({ ok: true, message: 'تم إرسال طلب السحب بنجاح' })
  } catch (e: any) { console.error('withdraw error', e); return NextResponse.json({ error: 'تعذر إرسال الطلب' }, { status: 500 }) }
}
