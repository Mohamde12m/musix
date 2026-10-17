import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { categoryToApi } from '@/lib/api-helpers'
import { saveBackupToFile } from '@/app/api/admin/backup/route'
import { clearHomeCache } from '@/app/api/songs/home/route'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  try {
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
    const data: any = {}
    if (typeof body.name === 'string' && body.name.trim()) {
      data.name = body.name.trim()
      if (typeof body.slug !== 'string' || !body.slug.trim()) {
        data.slug = body.name.trim().replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '').toLowerCase()
      }
    }
    if (typeof body.slug === 'string' && body.slug.trim()) data.slug = body.slug.trim().replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '').toLowerCase()
    if ('description' in body) data.description = body.description?.toString?.()?.trim() || null
    if ('image' in body) {
      const img = body.image?.toString?.()?.trim() || ''
      if (img) {
        try { new URL(img); data.image = img } catch { return NextResponse.json({ error: 'رابط الصورة غير صالح' }, { status: 400 }) }
      } else data.image = null
    }
    if ('emoji' in body) data.emoji = body.emoji?.toString?.()?.trim() || null
    if (typeof body.order === 'number') data.order = body.order
    const updated = await db.category.update({ where: { id }, data, include: { _count: { select: { songs: true } } } })
    await saveBackupToFile(); clearHomeCache()
    return NextResponse.json(categoryToApi(updated))
  } catch (e: any) { console.error('update category error', e); return NextResponse.json({ error: 'تعذر التعديل (قد يكون الاسم مكررًا)' }, { status: 400 }) }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  try {
    await db.song.updateMany({ where: { categoryId: id }, data: { categoryId: null } })
    await db.category.delete({ where: { id } })
    await saveBackupToFile(); clearHomeCache()
    return new NextResponse(null, { status: 204 })
  } catch { return NextResponse.json({ error: 'تعذر الحذف' }, { status: 500 }) }
}
