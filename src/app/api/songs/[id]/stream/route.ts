import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/songs/[id]/stream - بث/تنزيل ملف MP3 (proxy لتجاوز CORS)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const song = await db.song.findUnique({ where: { id } })
    if (!song || !song.published) {
      return NextResponse.json({ error: 'غير موجود' }, { status: 404 })
    }

    const res = await fetch(song.audioUrl, { signal: AbortSignal.timeout(60000) })
    if (!res.ok) return NextResponse.json({ error: 'تعذر جلب الملف' }, { status: 502 })

    const contentType = res.headers.get('content-type') || 'audio/mpeg'
    const arrayBuffer = await res.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(arrayBuffer.byteLength),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'تعذر البث' }, { status: 500 })
  }
}
