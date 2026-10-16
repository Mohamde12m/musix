'use client'

import type { ApiSong, ApiArtist, ApiCategory, ApiAlbum, ApiPlaylist } from '@/lib/types'

const API = '/api'

async function jfetch(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const j = await res.json(); if (j.error) msg = j.error } catch {}
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function fetchHomeData() {
  return jfetch(`${API}/songs/home`)
}

export async function fetchSongs(opts?: {
  categoryId?: string; artistId?: string; albumId?: string; query?: string
  sort?: 'latest' | 'popular' | 'title'; limit?: number; offset?: number; featured?: boolean
}): Promise<ApiSong[]> {
  const p = new URLSearchParams()
  if (opts?.categoryId) p.set('categoryId', opts.categoryId)
  if (opts?.artistId) p.set('artistId', opts.artistId)
  if (opts?.albumId) p.set('albumId', opts.albumId)
  if (opts?.query) p.set('q', opts.query)
  if (opts?.sort) p.set('sort', opts.sort)
  if (opts?.limit) p.set('limit', String(opts.limit))
  if (opts?.offset) p.set('offset', String(opts.offset))
  if (opts?.featured) p.set('featured', '1')
  return jfetch(`${API}/songs?${p.toString()}`)
}

export async function fetchSong(id: string) {
  try { return await jfetch(`${API}/songs/${id}`) } catch { return null }
}

export async function fetchArtists(): Promise<ApiArtist[]> { return jfetch(`${API}/artists`) }
export async function fetchArtist(id: string) {
  try { return await jfetch(`${API}/artists/${id}`) } catch { return null }
}
export async function fetchCategories(): Promise<ApiCategory[]> { return jfetch(`${API}/categories`) }
export async function fetchCategory(id: string) {
  try { return await jfetch(`${API}/categories/${id}`) } catch { return null }
}
export async function fetchPlaylists(): Promise<ApiPlaylist[]> { return jfetch(`${API}/playlists`) }
export async function fetchPlaylist(id: string) {
  try { return await jfetch(`${API}/playlists/${id}`) } catch { return null }
}
export async function recordPlay(songId: string) {
  try { await fetch(`${API}/songs/${songId}/play`, { method: 'POST' }) } catch {}
}
export async function fetchSongsByIds(ids: string[]): Promise<ApiSong[]> {
  if (ids.length === 0) return []
  return jfetch(`${API}/songs?ids=${ids.join(',')}`)
}
export async function askAssistant(message: string, history?: { role: string; content: string }[]) {
  return jfetch(`${API}/assistant`, { method: 'POST', body: JSON.stringify({ message, history }) })
}

export async function adminFetchSongs(): Promise<ApiSong[]> { return jfetch(`${API}/admin/songs`) }
export async function adminCreateSong(data: any): Promise<ApiSong> {
  return jfetch(`${API}/admin/songs`, { method: 'POST', body: JSON.stringify(data) })
}
export async function adminUpdateSong(id: string, data: any): Promise<ApiSong> {
  return jfetch(`${API}/admin/songs/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}
export async function adminDeleteSong(id: string) {
  await jfetch(`${API}/admin/songs/${id}`, { method: 'DELETE' })
}
export async function adminFetchArtists(): Promise<ApiArtist[]> { return jfetch(`${API}/admin/artists`) }
export async function adminFetchCategories(): Promise<ApiCategory[]> { return jfetch(`${API}/admin/categories`) }
export async function adminCreateCategory(data: any): Promise<ApiCategory> {
  return jfetch(`${API}/admin/categories`, { method: 'POST', body: JSON.stringify(data) })
}
export async function adminUpdateCategory(id: string, data: any): Promise<ApiCategory> {
  return jfetch(`${API}/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}
export async function adminDeleteCategory(id: string) {
  await jfetch(`${API}/admin/categories/${id}`, { method: 'DELETE' })
}
export async function adminLogin(password: string) {
  try {
    const res = await fetch(`${API}/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    const j = await res.json()
    if (!res.ok) return { ok: false, error: j.error || 'فشل الدخول' }
    return { ok: true }
  } catch (e: any) { return { ok: false, error: e.message } }
}
export async function adminLogout() { await fetch(`${API}/admin/logout`, { method: 'POST' }) }
export async function adminCheck() {
  try { const res = await fetch(`${API}/admin/check`); const j = await res.json(); return !!j.isAdmin } catch { return false }
}
