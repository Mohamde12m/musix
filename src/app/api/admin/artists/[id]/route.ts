import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

// PATCH /api/admin/artists/[id] - تعديل بيانات الفنان (الصورة)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  try {
    const data: any = {}
    if (typeof body.image === 'string') data.image = body.image.trim() || null
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
    if (typeof body.bio === 'string') data.bio = body.bio.trim() || null
    if (typeof body.country === 'string') data.country = body.country.trim() || null
    const updated = await db.artist.update({ where: { id }, data })
    return NextResponse.json({ ok: true, id: updated.id, name: updated.name, image: updated.image })
  } catch (e: any) { return NextResponse.json({ error: 'تعذر التعديل' }, { status: 500 }) }
}
