import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { setUserCookie, createUserSession, bindUserSession } from '@/lib/user-auth'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const email = body?.email?.toString?.()?.trim()?.toLowerCase()
  const password = body?.password?.toString?.()
  if (!email || !password) return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })

  try {
    const user = await db.userAccount.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'البريد غير مسجل' }, { status: 401 })
    const hashed = crypto.scryptSync(password, email, 64).toString('hex')
    if (hashed !== user.password) return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
    const { token, expires } = createUserSession()
    bindUserSession(token, user.id)
    await setUserCookie(token, expires)
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, displayName: user.displayName, balance: user.balance, totalSongsListened: user.totalSongsListened } })
  } catch (e: any) { console.error('login error', e); return NextResponse.json({ error: 'تعذر الدخول' }, { status: 500 }) }
}
