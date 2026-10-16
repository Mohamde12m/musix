import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { artistToApi, songToApi, albumToApi } from '@/lib/api-helpers'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const artist = await db.artist.findUnique({ where: { id } })
    if (!artist) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    const [songs, albums] = await Promise.all([
      db.song.findMany({ where: { artistId: id, published: true }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' } }),
      db.album.findMany({ where: { artistId: id }, include: { _count: { select: { songs: { where: { published: true } } } } }, orderBy: { year: 'desc' } }),
    ])
    return NextResponse.json({ artist: artistToApi({ ...artist, _count: { songs: songs.length } }), songs: songs.map(songToApi), albums: albums.map(albumToApi) })
  } catch { return NextResponse.json({ error: 'خطأ' }, { status: 500 }) }
}
