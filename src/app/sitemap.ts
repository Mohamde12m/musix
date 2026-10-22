import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL = 'https://musix-livid.vercel.app'

// sitemap.xml ديناميكي — يتحدّث تلقائياً عند إضافة أغاني/فنانين/تصنيفات جديدة
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // الصفحات الثابتة (أولوية عالية)
  const staticPages = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/discover', priority: 0.9, changeFrequency: 'daily' as const },
    { url: '/favorites', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/library', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/profile', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/search', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/assistant', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  for (const p of staticPages) {
    entries.push({
      url: `${BASE_URL}${p.url}`,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })
  }

  // الأغاني (كل أغنية منشورة)
  try {
    const songs = await db.song.findMany({
      where: { published: true },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    })
    for (const s of songs) {
      entries.push({
        url: `${BASE_URL}/?song=${s.id}`,
        lastModified: s.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch {}

  // الفنانون
  try {
    const artists = await db.artist.findMany({
      select: { id: true, name: true, updatedAt: true },
      orderBy: { name: 'asc' },
    })
    for (const a of artists) {
      entries.push({
        url: `${BASE_URL}/?artist=${a.id}`,
        lastModified: a.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {}

  // التصنيفات
  try {
    const categories = await db.category.findMany({
      select: { id: true, slug: true, name: true, updatedAt: true },
      orderBy: { order: 'asc' },
    })
    for (const c of categories) {
      entries.push({
        url: `${BASE_URL}/?category=${c.id}`,
        lastModified: c.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  } catch {}

  return entries
}
