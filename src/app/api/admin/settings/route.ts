import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { DEFAULT_SOCIAL_LINKS, DEFAULT_UNITY_ADS } from '@/app/api/settings/route'

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
    const unityRows = await db.appSetting.findMany({ where: { id: { startsWith: 'unity_' } } })
    const allRows = [...rows, ...unityRows]
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
      unityAds: {
        gameId: map['unity_game_id'] || DEFAULT_UNITY_ADS.gameId,
        bannerPlacementId: map['unity_banner_placement'] || DEFAULT_UNITY_ADS.bannerPlacementId,
        rewardedPlacementId: map['unity_rewarded_placement'] || DEFAULT_UNITY_ADS.rewardedPlacementId,
        interstitialPlacementId: map['unity_interstitial_placement'] || DEFAULT_UNITY_ADS.interstitialPlacementId,
        enabled: map['unity_enabled'] === 'true',
        scriptUrl: map['unity_script_url'] || DEFAULT_UNITY_ADS.scriptUrl,
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

  const { facebook, whatsapp, instagram, unityAds } = body
  const updates: { id: string; value: string }[] = []
  if (facebook?.url?.trim()) updates.push({ id: 'social_facebook_url', value: facebook.url.trim() })
  if (facebook?.handle?.trim()) updates.push({ id: 'social_facebook_handle', value: facebook.handle.trim() })
  if (whatsapp?.url?.trim()) updates.push({ id: 'social_whatsapp_url', value: whatsapp.url.trim() })
  if (whatsapp?.handle?.trim()) updates.push({ id: 'social_whatsapp_handle', value: whatsapp.handle.trim() })
  if (instagram?.url?.trim()) updates.push({ id: 'social_instagram_url', value: instagram.url.trim() })
  if (instagram?.handle?.trim()) updates.push({ id: 'social_instagram_handle', value: instagram.handle.trim() })

  // إعدادات Unity Ads
  if (unityAds) {
    if (typeof unityAds.enabled === 'boolean') updates.push({ id: 'unity_enabled', value: String(unityAds.enabled) })
    if (unityAds.gameId?.trim() !== undefined) updates.push({ id: 'unity_game_id', value: unityAds.gameId.trim() })
    if (unityAds.bannerPlacementId?.trim() !== undefined) updates.push({ id: 'unity_banner_placement', value: unityAds.bannerPlacementId.trim() })
    if (unityAds.rewardedPlacementId?.trim() !== undefined) updates.push({ id: 'unity_rewarded_placement', value: unityAds.rewardedPlacementId.trim() })
    if (unityAds.interstitialPlacementId?.trim() !== undefined) updates.push({ id: 'unity_interstitial_placement', value: unityAds.interstitialPlacementId.trim() })
    if (unityAds.scriptUrl?.trim() !== undefined) updates.push({ id: 'unity_script_url', value: unityAds.scriptUrl.trim() })
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
