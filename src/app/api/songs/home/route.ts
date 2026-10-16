import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi, artistToApi, categoryToApi } from '@/lib/api-helpers'

export async function GET() {
  try {
    const [featured, latest, mostPlayed, categories, artists] = await Promise.all([
      db.song.findMany({ where: { published: true, featured: true }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: 8 }),
      db.song.findMany({ where: { published: true }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
      db.song.findMany({ where: { published: true }, include: { artist: true, album: true, category: true }, orderBy: { playCount: 'desc' }, take: 20 }),
      db.category.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { songs: { where: { published: true } } } } } }),
      db.artist.findMany({ orderBy: { createdAt: 'desc' }, take: 12, include: { _count: { select: { songs: { where: { published: true } } } } } }),
    ])
    const byCategory = await Promise.all(categories.slice(0, 10).map(async (c) => {
      const songs = await db.song.findMany({ where: { published: true, categoryId: c.id }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: 6 })
      return { category: categoryToApi(c), songs: songs.map(songToApi) }
    }))
    return NextResponse.json({
      featured: featured.map(songToApi),
      latest: latest.map(songToApi),
      mostPlayed: mostPlayed.map(songToApi),
      categories: categories.map(categoryToApi),
      byCategory: byCategory.filter((b) => b.songs.length > 0),
      artists: artists.map(artistToApi),
    })
  } catch (e: any) {
    console.error('home fetch error', e)
    return NextResponse.json({ featured: [], latest: [], mostPlayed: [], categories: [], byCategory: [], artists: [] })
  }
}
