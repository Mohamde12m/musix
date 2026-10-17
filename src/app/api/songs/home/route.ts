import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi, artistToApi, categoryToApi } from '@/lib/api-helpers'

// تخزين مؤقت في الذاكرة لتسريع الاستجابات (Supabase بعيدة - سيدني)
let cache: { data: any; time: number } | null = null
const CACHE_TTL = 120_000 // دقيقتان

// تسخين الكاش مسبقًا عند بدء الخادم (يمنع انتهاء مهلة البوابة)
let warmingPromise: Promise<void> | null = null
function warmCache() {
  if (warmingPromise || (cache && Date.now() - cache.time < CACHE_TTL)) return
  warmingPromise = (async () => {
    try {
      const [featured, latest, mostPlayed, categories, artists] = await Promise.all([
        db.song.findMany({ where: { published: true, featured: true }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
        db.song.findMany({ where: { published: true }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
        db.song.findMany({ where: { published: true }, include: { artist: true, album: true, category: true }, orderBy: { playCount: 'desc' }, take: 20 }),
        db.category.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { songs: { where: { published: true } } } } } }),
        db.artist.findMany({ orderBy: { createdAt: 'desc' }, take: 12, include: { _count: { select: { songs: { where: { published: true } } } } } }),
      ])
      const byCategory = await Promise.all(
        categories.slice(0, 10).map(async (c) => {
          const songs = await db.song.findMany({ where: { published: true, categoryId: c.id }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: 6 })
          return { category: categoryToApi(c), songs: songs.map(songToApi) }
        })
      )
      cache = {
        data: {
          featured: featured.map(songToApi), latest: latest.map(songToApi),
          mostPlayed: mostPlayed.map(songToApi), categories: categories.map(categoryToApi),
          byCategory: byCategory.filter((b) => b.songs.length > 0), artists: artists.map(artistToApi),
        },
        time: Date.now(),
      }
    } catch (e) { console.error('warmCache error', e) }
    finally { warmingPromise = null }
  })()
}

// ابدأ التسخين عند استيراد الوحدة (عند بدء الخادم)
warmCache()

export async function GET() {
  // أرجع البيانات المخزّنة مؤقتًا فورًا (حتى لو منتهية الصلاحية)
  if (cache) {
    // إن كانت منتهية الصلاحية، أعد التسخين في الخلفية
    if (Date.now() - cache.time > CACHE_TTL) warmCache()
    return NextResponse.json(cache.data)
  }

  // إن لم يوجد كاش بعد، انتظر التسخين الجاري (أول طلب)
  if (warmingPromise) {
    await warmingPromise
    if (cache) return NextResponse.json(cache.data)
  }

  // إن لم يوجد شيء، سخّن الآن وانتظر
  warmCache()
  if (warmingPromise) await warmingPromise
  if (cache) return NextResponse.json(cache.data)
  return NextResponse.json({ featured: [], latest: [], mostPlayed: [], categories: [], byCategory: [], artists: [] })
}

export function clearHomeCache() { cache = null; warmCache() }
