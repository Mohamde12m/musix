import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categoryToApi } from '@/lib/api-helpers'
export async function GET() {
  try {
    const cats = await db.category.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { songs: { where: { published: true } } } } } })
    return NextResponse.json(cats.map(categoryToApi))
  } catch { return NextResponse.json([]) }
}
