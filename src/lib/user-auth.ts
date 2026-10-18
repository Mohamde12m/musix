import { cookies } from 'next/headers'
import crypto from 'crypto'

const USER_COOKIE = 'musix_user_session'
const MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 يوم

// جلسات المستخدمين في الذاكرة: token → userId
const userSessions = new Map<string, string>()
;(globalThis as any).__userSessions = userSessions

export function createUserSession(): { token: string; expires: number } {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + MAX_AGE
  // ستحفظ الجلسة بعد تسجيل الدخول (ربط token بـ userId)
  return { token, expires }
}

export function bindUserSession(token: string, userId: string) {
  userSessions.set(token, userId)
}

export function validateUserSession(token?: string | null): boolean {
  if (!token) return false
  return userSessions.has(token)
}

export function getUserId(token?: string | null): string | null {
  if (!token) return null
  return userSessions.get(token) || null
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const token = await getUserSession()
  return getUserId(token)
}

export async function getUserSession() {
  const c = await cookies()
  return c.get(USER_COOKIE)?.value
}

export async function setUserCookie(token: string, expires: number, userId?: string) {
  if (userId) bindUserSession(token, userId)
  const c = await cookies()
  c.set(USER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires),
  })
}

export function destroyUserSession(token?: string | null) {
  if (token) userSessions.delete(token)
}

export async function clearUserCookie() {
  const c = await cookies()
  c.delete(USER_COOKIE)
}
