import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { setUserCookie, createUserToken } from '@/lib/user-auth'

const rid = () => 'c' + crypto.randomBytes(16).toString('hex')

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const email = body?.email?.toString?.()?.trim()?.toLowerCase()
  const password = body?.password?.toString?.()
  const displayName = body?.displayName?.toString?.()?.trim() || email?.split('@')[0] || 'مستخدم'
  if (!email || !password) return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })

  try {
    const existing = await db.userAccount.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'هذا البريد مسجل بالفعل' }, { status: 400 })
    const hashed = crypto.scryptSync(password, email, 64).toString('hex')
    const user = await db.userAccount.create({ data: { id: rid(), email, password: hashed, displayName } })
    const token = createUserToken(user.id)
    await setUserCookie(token, Date.now() + 30 * 24 * 60 * 60 * 1000)
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, displayName: user.displayName, balance: user.balance } })
  } catch (e: any) { console.error('register error', e); return NextResponse.json({ error: 'تعذر التسجيل: ' + (e?.message || 'unknown') }, { status: 500 }) }
}
