import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { songToApi } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  try {
    const existing = await db.song.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'الأغنية غير موجودة' }, { status: 404 })
    const data: any = {}
    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.audioUrl === 'string' && body.audioUrl.trim()) {
      try { new URL(body.audioUrl); data.audioUrl = body.audioUrl.trim() } catch { return NextResponse.json({ error: 'رابط صوت غير صالح' }, { status: 400 }) }
    }
    if ('coverUrl' in body) data.coverUrl = body.coverUrl?.trim() || null
    if ('description' in body) data.description = body.description?.trim() || null
    if ('lyrics' in body) data.lyrics = body.lyrics?.trim() || null
    if ('duration' in body) data.duration = typeof body.duration === 'number' && body.duration > 0 ? body.duration : null
    if ('published' in body) data.published = !!body.published
    if ('featured' in body) data.featured = !!body.featured
    if ('rights' in body) data.rights = body.rights?.trim() || null
    if ('keywords' in body) data.keywords = Array.isArray(body.keywords) ? body.keywords.filter(Boolean).join(',') : (typeof body.keywords === 'string' ? body.keywords : null)
    if (typeof body.artistName === 'string' && body.artistName.trim()) {
      let artist = await db.artist.findFirst({ where: { name: body.artistName.trim() } })
      if (!artist) artist = await db.artist.create({ data: { name: body.artistName.trim() } })
      data.artistId = artist.id
    } else if (body.artistName === null || body.artistName === '') { data.artistId = null }
    if (typeof body.albumTitle === 'string' && body.albumTitle.trim()) {
      let album = await db.album.findFirst({ where: { title: body.albumTitle.trim(), artistId: data.artistId ?? existing.artistId } })
      if (!album) album = await db.album.create({ data: { title: body.albumTitle.trim(), artistId: data.artistId ?? existing.artistId } })
      data.albumId = album.id
    }
    if (typeof body.categoryName === 'string' && body.categoryName.trim()) {
      const slug = body.categoryName.trim().replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '').toLowerCase()
      let cat = await db.category.findFirst({ where: { OR: [{ name: body.categoryName.trim() }, { slug }] } })
      if (!cat) cat = await db.category.create({ data: { name: body.categoryName.trim(), slug, order: (await db.category.count()) + 1 } })
      data.categoryId = cat.id
    }
    const updated = await db.song.update({ where: { id }, data, include: { artist: true, album: true, category: true } })
    return NextResponse.json(songToApi(updated))
  } catch (e: any) { console.error('update song error', e); return NextResponse.json({ error: 'تعذر التعديل' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  try { await db.song.delete({ where: { id } }); return new NextResponse(null, { status: 204 }) }
  catch { return NextResponse.json({ error: 'تعذر الحذف' }, { status: 500 }) }
}
