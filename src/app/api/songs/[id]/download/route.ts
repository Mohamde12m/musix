import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/songs/[id]/download - تنزيل الأغنية (proxy لتجاوز CORS)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const song = await db.song.findUnique({ where: { id }, include: { artist: true } })
    if (!song || !song.published) {
      return NextResponse.json({ error: 'الأغنية غير موجودة' }, { status: 404 })
    }

    // جلب ملف الصوت من الرابط الخارجي
    const res = await fetch(song.audioUrl, { signal: AbortSignal.timeout(30000) })
    if (!res.ok) {
      return NextResponse.json({ error: 'تعذر جلب الملف الصوتي' }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg'
    const arrayBuffer = await res.arrayBuffer()

    // اسم الملف: العنوان - الفنان.mp3
    const artistName = song.artist?.name || 'موسيقى'
    const fileName = `${song.title} - ${artistName}.mp3`.replace(/[<>:"/\\|?*]/g, '')

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': String(arrayBuffer.byteLength),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (e: any) {
    console.error('download error', e)
    return NextResponse.json({ error: 'تعذر التنزيل: ' + (e?.message || '') }, { status: 500 })
  }
}
