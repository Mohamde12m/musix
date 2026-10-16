import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi, categoryToApi } from '@/lib/api-helpers'
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const category = await db.category.findUnique({ where: { id } })
    if (!category) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    const songs = await db.song.findMany({ where: { categoryId: id, published: true }, include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ category: categoryToApi(category), songs: songs.map(songToApi) })
  } catch { return NextResponse.json({ error: 'خطأ' }, { status: 500 }) }
}
