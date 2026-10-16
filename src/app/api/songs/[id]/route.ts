import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi } from '@/lib/api-helpers'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const song = await db.song.findUnique({ where: { id }, include: { artist: true, album: true, category: true } })
    if (!song || !song.published) return NextResponse.json({ error: 'الأغنية غير موجودة' }, { status: 404 })
    return NextResponse.json(songToApi(song))
  } catch { return NextResponse.json({ error: 'خطأ' }, { status: 500 }) }
}
