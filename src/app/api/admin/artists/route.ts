import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { artistToApi } from '@/lib/api-helpers'
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const artists = await db.artist.findMany({ include: { _count: { select: { songs: true } } }, orderBy: { name: 'asc' } })
    return NextResponse.json(artists.map(artistToApi))
  } catch { return NextResponse.json([]) }
}
