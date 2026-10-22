import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { DEFAULT_SOCIAL_LINKS, DEFAULT_ADSENSE } from '@/app/api/settings/route'

// إعادة ضبط الذاكرة المؤقتة عند التحديث
async function invalidateCache() {
  try {
    // استدعاء داخلي لتفريغ الكاش — نستخدم fetch محلي
    const base = process.env.NODE_ENV === 'production' ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    await fetch(`${base}/api/settings`, { method: 'GET' }).catch(() => {})
  } catch {}
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const rows = await db.appSetting.findMany({ where: { id: { startsWith: 'social_' } } })
    const adsenseRows = await db.appSetting.findMany({ where: { id: { startsWith: 'adsense_' } } })
    const allRows = [...rows, ...adsenseRows]
    const map: Record<string, string> = {}
    for (const r of allRows) map[r.id] = r.value
    return NextResponse.json({
      facebook: {
        url: map['social_facebook_url'] || DEFAULT_SOCIAL_LINKS.facebook.url,
        handle: map['social_facebook_handle'] || DEFAULT_SOCIAL_LINKS.facebook.handle,
      },
      whatsapp: {
        url: map['social_whatsapp_url'] || DEFAULT_SOCIAL_LINKS.whatsapp.url,
        handle: map['social_whatsapp_handle'] || DEFAULT_SOCIAL_LINKS.whatsapp.handle,
      },
      instagram: {
        url: map['social_instagram_url'] || DEFAULT_SOCIAL_LINKS.instagram.url,
        handle: map['social_instagram_handle'] || DEFAULT_SOCIAL_LINKS.instagram.handle,
      },
      adsense: {
        publisherId: map['adsense_publisher_id'] || DEFAULT_ADSENSE.publisherId,
        enabled: map['adsense_enabled'] === 'true',
        scriptUrl: map['adsense_script_url'] || DEFAULT_ADSENSE.scriptUrl,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'فشل قراءة الإعدادات: ' + (e?.message || '') }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }

  const { facebook, whatsapp, instagram, adsense } = body
  const updates: { id: string; value: string }[] = []
  if (facebook?.url?.trim()) updates.push({ id: 'social_facebook_url', value: facebook.url.trim() })
  if (facebook?.handle?.trim()) updates.push({ id: 'social_facebook_handle', value: facebook.handle.trim() })
  if (whatsapp?.url?.trim()) updates.push({ id: 'social_whatsapp_url', value: whatsapp.url.trim() })
  if (whatsapp?.handle?.trim()) updates.push({ id: 'social_whatsapp_handle', value: whatsapp.handle.trim() })
  if (instagram?.url?.trim()) updates.push({ id: 'social_instagram_url', value: instagram.url.trim() })
  if (instagram?.handle?.trim()) updates.push({ id: 'social_instagram_handle', value: instagram.handle.trim() })

  // إعدادات Google AdSense
  if (adsense) {
    if (typeof adsense.enabled === 'boolean') updates.push({ id: 'adsense_enabled', value: String(adsense.enabled) })
    if (adsense.publisherId?.trim() !== undefined) updates.push({ id: 'adsense_publisher_id', value: adsense.publisherId.trim() })
    if (adsense.scriptUrl?.trim() !== undefined) updates.push({ id: 'adsense_script_url', value: adsense.scriptUrl.trim() })
  }

  try {
    for (const u of updates) {
      await db.appSetting.upsert({
        where: { id: u.id },
        update: { value: u.value },
        create: { id: u.id, value: u.value },
      })
    }
    await invalidateCache()
    return NextResponse.json({ ok: true, count: updates.length })
  } catch (e: any) {
    return NextResponse.json({ error: 'فشل الحفظ: ' + (e?.message || '') }, { status: 500 })
  }
}
