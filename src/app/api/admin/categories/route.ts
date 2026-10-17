import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { categoryToApi } from '@/lib/api-helpers'
import { saveBackupToFile } from '@/app/api/admin/backup/route'
import { clearHomeCache } from '@/app/api/songs/home/route'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const cats = await db.category.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { songs: true } } } })
    return NextResponse.json(cats.map(categoryToApi))
  } catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const name = body?.name?.toString?.()?.trim()
  if (!name) return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })
  const slug = (body.slug?.toString?.()?.trim() || name).replace(/\s+/g, '-').replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '').toLowerCase()
  try {
    const c = await db.category.create({
      data: {
        name, slug,
        description: body.description?.toString?.()?.trim() || null,
        image: body.image?.toString?.()?.trim() || null,
        emoji: body.emoji?.toString?.()?.trim() || null,
        order: body.order ?? (await db.category.count()) + 1,
      },
    })
    await saveBackupToFile(); clearHomeCache()
    return NextResponse.json(categoryToApi({ ...c, _count: { songs: 0 } }))
  } catch { return NextResponse.json({ error: 'تعذر إنشاء التصنيف (قد يكون الاسم مكررًا)' }, { status: 400 }) }
}
