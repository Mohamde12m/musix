import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/ads?position=home — جلب الإعلانات النشطة
export async function GET(req: Request) {
  const url = new URL(req.url)
  const position = url.searchParams.get('position') || 'home'
  try {
    const ads = await db.ad.findMany({
      where: { active: true, position },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
    // تسجيل ظهور
    if (ads.length > 0) {
      await Promise.all(ads.map(a => db.ad.update({ where: { id: a.id }, data: { impressions: { increment: 1 } } })))
    }
    return NextResponse.json(ads.map(a => ({ id: a.id, title: a.title, imageUrl: a.imageUrl, linkUrl: a.linkUrl })))
  } catch { return NextResponse.json([]) }
}
