import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { playlistToApi } from '@/lib/api-helpers'
export async function GET() {
  try {
    const playlists = await db.playlist.findMany({ where: { isPublic: true }, orderBy: { createdAt: 'desc' }, include: { _count: { select: { songs: true } } } })
    return NextResponse.json(playlists.map(playlistToApi))
  } catch { return NextResponse.json([]) }
}
