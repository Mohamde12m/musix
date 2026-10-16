import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const ids = url.searchParams.get('ids')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200)

  try {
    if (ids) {
      const idArr = ids.split(',').filter(Boolean)
      const songs = await db.song.findMany({ where: { id: { in: idArr }, published: true }, include: { artist: true, album: true, category: true } })
      const order = idArr.map((id) => songs.find((s) => s.id === id)).filter(Boolean)
      return NextResponse.json(order.map(songToApi))
    }
    const where: any = { published: true }
    const songs = await db.song.findMany({ where, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' }, take: limit })
    return NextResponse.json(songs.map(songToApi))
  } catch (e: any) {
    console.error('songs fetch error', e)
    return NextResponse.json([])
  }
}
