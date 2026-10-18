import { cookies } from 'next/headers'
import crypto from 'crypto'

const USER_COOKIE = 'musix_user_session'
const SECRET = process.env.ADMIN_PASSWORD || 'mohamde12345'

// إنشاء توكن موقّع يحتوي على userId (JWT مبسّط)
export function createUserToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

// التحقق من التوكن واستخراج userId
export function verifyUserToken(token?: string | null): string | null {
  if (!token) return null
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
    if (sig !== expectedSig) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (data.exp < Date.now()) return null
    return data.uid
  } catch { return null }
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const c = await cookies()
  const token = c.get(USER_COOKIE)?.value
  return verifyUserToken(token)
}

export async function setUserCookie(token: string, expires: number) {
  const c = await cookies()
  c.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires),
  })
}

export async function clearUserCookie() {
  const c = await cookies()
  c.delete(USER_COOKIE)
}

export async function getUserSession(): Promise<string | undefined> {
  const c = await cookies()
  return c.get(USER_COOKIE)?.value
}
