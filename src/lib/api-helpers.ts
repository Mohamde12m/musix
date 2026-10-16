import { db } from '@/lib/db'

export function songToApi(s: any) {
  return {
    id: s.id,
    title: s.title,
    artistId: s.artistId,
    artistName: s.artist?.name ?? null,
    artistImage: s.artist?.image ?? null,
    albumId: s.albumId,
    albumTitle: s.album?.title ?? null,
    audioUrl: s.audioUrl,
    coverUrl: s.coverUrl,
    categoryId: s.categoryId,
    categoryName: s.category?.name ?? null,
    categorySlug: s.category?.slug ?? null,
    description: s.description,
    lyrics: s.lyrics,
    duration: s.duration,
    keywords: s.keywords ? s.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
    published: s.published,
    featured: s.featured,
    playCount: s.playCount ?? 0,
    rights: s.rights,
    createdAt: s.createdAt?.toISOString?.() ?? s.createdAt,
  }
}

export function artistToApi(a: any) {
  return {
    id: a.id,
    name: a.name,
    image: a.image,
    bio: a.bio,
    country: a.country,
    songCount: a._count?.songs ?? a.songs?.length ?? 0,
    createdAt: a.createdAt?.toISOString?.() ?? a.createdAt,
  }
}

export function categoryToApi(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    emoji: c.emoji,
    order: c.order ?? 0,
    songCount: c._count?.songs ?? c.songs?.length ?? 0,
  }
}

export function albumToApi(a: any) {
  return {
    id: a.id,
    title: a.title,
    artistId: a.artistId,
    artistName: a.artist?.name ?? null,
    coverUrl: a.coverUrl,
    year: a.year,
    songCount: a._count?.songs ?? a.songs?.length ?? 0,
  }
}

export function playlistToApi(p: any) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    coverUrl: p.coverUrl,
    isPublic: p.isPublic,
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
    songCount: p._count?.songs ?? p.songs?.length,
  }
}
