'use client'

import type { ApiSong } from '@/lib/types'

const DB_NAME = 'musix-downloads'
const DB_VERSION = 1
const STORE_NAME = 'songs'
const CACHE_NAME = 'musix-songs-v1'

// فتح IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// حفظ بيانات الأغنية في IndexedDB
async function saveToDB(song: ApiSong): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ ...song, downloadedAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// حذف من IndexedDB
async function deleteFromDB(songId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(songId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// كل الأغاني المخزّنة من IndexedDB
async function getAllFromDB(): Promise<any[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

// هل الأغنية مخزّنة؟
async function isInDB(songId: string): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(songId)
    req.onsuccess = () => resolve(!!req.result)
    req.onerror = () => reject(req.error)
  })
}

// === الواجهة العامة ===

// تنزيل أغنية (جلب MP3 + تخزين محلي)
export async function downloadSong(song: ApiSong): Promise<{ ok: boolean; error?: string }> {
  try {
    const cache = await caches.open(CACHE_NAME)
    const downloadUrl = `/api/songs/${song.id}/stream`

    // جلب ملف MP3 عبر الـ proxy
    const res = await fetch(downloadUrl)
    if (!res.ok) return { ok: false, error: 'تعذر جلب الأغنية' }

    // تخزين في Cache API
    const resClone = res.clone()
    await cache.put(downloadUrl, resClone)

    // تخزين بيانات الأغنية في IndexedDB
    await saveToDB(song)

    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

// حذف أغنية مخزّنة
export async function deleteDownloadedSong(songId: string): Promise<void> {
  await deleteFromDB(songId)
  const cache = await caches.open(CACHE_NAME)
  await cache.delete(`/api/songs/${songId}/stream`)
}

// كل الأغاني المخزّنة
export async function getDownloadedSongs(): Promise<ApiSong[]> {
  return await getAllFromDB()
}

// هل الأغنية مخزّنة؟
export async function isDownloaded(songId: string): Promise<boolean> {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(`/api/songs/${songId}/stream`)
  return !!cached
}

// احصل على رابط التشغيل المحلي (للأوفلاين)
export function getOfflineStreamUrl(songId: string): string {
  return `/api/songs/${songId}/stream`
}

// هل التخزين المحلي متاح؟
export async function estimateStorage(): Promise<{ usage: number; quota: number }> {
  if (navigator.storage?.estimate) {
    const est = await navigator.storage.estimate()
    return { usage: est.usage || 0, quota: est.quota || 0 }
  }
  return { usage: 0, quota: 0 }
}

// مسح كل الأغاني المخزّنة
export async function clearAllDownloads(): Promise<void> {
  const cache = await caches.open(CACHE_NAME)
  const keys = await cache.keys()
  await Promise.all(keys.map((k) => cache.delete(k)))
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve()
  })
}
