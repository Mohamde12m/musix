import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mohamde12345'
const SESSION_COOKIE = 'musix_admin_session'
const SESSION_MAX_AGE = 12 * 60 * 60 * 1000

const sessions = new Set<string>()
const attempts = new Map<string, { count: number; lockedUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCK_DURATION = 5 * 60 * 1000

export function isRateLimited(ip: string) {
  const rec = attempts.get(ip)
  if (!rec) return { limited: false, remainingMs: 0 }
  if (rec.lockedUntil > Date.now()) return { limited: true, remainingMs: rec.lockedUntil - Date.now() }
  if (rec.lockedUntil > 0 && rec.lockedUntil <= Date.now()) attempts.delete(ip)
  return { limited: false, remainingMs: 0 }
}

export function recordFailedAttempt(ip: string) {
  const rec = attempts.get(ip) || { count: 0, lockedUntil: 0 }
  rec.count += 1
  if (rec.count >= MAX_ATTEMPTS) {
    rec.lockedUntil = Date.now() + LOCK_DURATION
    rec.count = 0
    attempts.set(ip, rec)
    return { locked: true, lockMs: LOCK_DURATION }
  }
  attempts.set(ip, rec)
  return { locked: false, lockMs: 0 }
}

export function clearAttempts(ip: string) { attempts.delete(ip) }

export function createSession() {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + SESSION_MAX_AGE
  sessions.add(token)
  if (sessions.size > 1000) { sessions.clear(); sessions.add(token) }
  return { token, expires }
}

export function validateSession(token?: string | null) {
  if (!token) return false
  return sessions.has(token)
}

export function destroySession(token?: string | null) { if (token) sessions.delete(token) }

export async function getAdminSession() {
  const c = await cookies()
  return c.get(SESSION_COOKIE)?.value
}

export async function isAdmin() {
  return validateSession(await getAdminSession())
}

export async function setAdminCookie(token: string, expires: number) {
  const c = await cookies()
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expires),
  })
}

export async function clearAdminCookie() {
  const c = await cookies()
  c.delete(SESSION_COOKIE)
}

export function getClientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export { ADMIN_PASSWORD }
