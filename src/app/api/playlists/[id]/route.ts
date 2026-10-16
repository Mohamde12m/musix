import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi, playlistToApi } from '@/lib/api-helpers'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const playlist = await db.playlist.findUnique({ where: { id }, include: { _count: { select: { songs: true } } } })
    if (!playlist || !playlist.isPublic) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    const rels = await db.playlistSong.findMany({ where: { playlistId: id }, orderBy: { order: 'asc' }, include: { song: { include: { artist: true, album: true, category: true } } } })
    const songs = rels.map((r) => r.song).filter(Boolean)
    return NextResponse.json({ playlist: playlistToApi(playlist), songs: songs.map(songToApi) })
  } catch { return NextResponse.json({ error: 'خطأ' }, { status: 500 }) }
}
