import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { songToApi } from '@/lib/api-helpers'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const songs = await db.song.findMany({ include: { artist: true, album: true, category: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json(songs.map(songToApi))
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const { title, audioUrl } = body
  if (!title?.trim()) return NextResponse.json({ error: 'اسم الأغنية مطلوب' }, { status: 400 })
  if (!audioUrl?.trim()) return NextResponse.json({ error: 'رابط MP3 مطلوب' }, { status: 400 })
  try { new URL(audioUrl) } catch { return NextResponse.json({ error: 'رابط غير صالح' }, { status: 400 }) }

  try {
    let artistId: string | null = null
    if (body.artistName?.trim()) {
      const existing = await db.artist.findFirst({ where: { name: body.artistName.trim() } })
      if (existing) artistId = existing.id
      else { const a = await db.artist.create({ data: { name: body.artistName.trim() } }); artistId = a.id }
    }
    let albumId: string | null = null
    if (body.albumTitle?.trim()) {
      const existing = await db.album.findFirst({ where: { title: body.albumTitle.trim(), artistId } })
      if (existing) albumId = existing.id
      else { const a = await db.album.create({ data: { title: body.albumTitle.trim(), artistId } }); albumId = a.id }
    }
    let categoryId: string | null = null
    if (body.categoryName?.trim()) {
      const slug = body.categoryName.trim().replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '').toLowerCase()
      const existing = await db.category.findFirst({ where: { OR: [{ name: body.categoryName.trim() }, { slug }] } })
      if (existing) categoryId = existing.id
      else { const c = await db.category.create({ data: { name: body.categoryName.trim(), slug, order: (await db.category.count()) + 1 } }); categoryId = c.id }
    }
    const song = await db.song.create({
      data: {
        title: title.trim(), artistId, albumId, categoryId,
        audioUrl: audioUrl.trim(),
        coverUrl: body.coverUrl?.trim() || null,
        description: body.description?.trim() || null,
        lyrics: body.lyrics?.trim() || null,
        duration: typeof body.duration === 'number' && body.duration > 0 ? body.duration : null,
        keywords: Array.isArray(body.keywords) ? body.keywords.filter(Boolean).join(',') : (typeof body.keywords === 'string' ? body.keywords : null),
        published: !!body.published, featured: !!body.featured,
        rights: body.rights?.trim() || null,
      },
      include: { artist: true, album: true, category: true },
    })
    return NextResponse.json(songToApi(song))
  } catch (e: any) {
    console.error('create song error', e)
    return NextResponse.json({ error: 'تعذر حفظ الأغنية: ' + (e?.message || '') }, { status: 500 })
  }
}
