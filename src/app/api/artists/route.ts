import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { artistToApi } from '@/lib/api-helpers'
export async function GET() {
  try {
    const artists = await db.artist.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { songs: { where: { published: true } } } } } })
    return NextResponse.json(artists.map(artistToApi))
  } catch { return NextResponse.json([]) }
}
