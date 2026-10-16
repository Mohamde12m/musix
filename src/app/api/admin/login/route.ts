import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_PASSWORD, getClientIp, isRateLimited, recordFailedAttempt, clearAttempts, createSession, setAdminCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const password = body?.password
  const ip = getClientIp(req)
  const rl = isRateLimited(ip)
  if (rl.limited) {
    const mins = Math.ceil(rl.remainingMs / 60000)
    return NextResponse.json({ error: `تم حظر المحاولات. حاول بعد ${mins} دقيقة.` }, { status: 429 })
  }
  if (typeof password !== 'string' || password.length === 0) return NextResponse.json({ error: 'أدخل رمز الدخول' }, { status: 400 })
  if (password !== ADMIN_PASSWORD) {
    const r = recordFailedAttempt(ip)
    if (r.locked) return NextResponse.json({ error: 'محاولات كثيرة فاشلة. تم الحظر 5 دقائق.' }, { status: 429 })
    return NextResponse.json({ error: 'رمز الدخول غير صحيح' }, { status: 401 })
  }
  clearAttempts(ip)
  const { token, expires } = createSession()
  await setAdminCookie(token, expires)
  return NextResponse.json({ ok: true, isAdmin: true })
}
