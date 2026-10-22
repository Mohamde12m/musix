import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// القيم الافتراضية للروابط (تُستخدم إذا لم تكن هناك قيم في قاعدة البيانات)
export const DEFAULT_SOCIAL_LINKS = {
  facebook: {
    url: 'https://www.facebook.com/share/19oiL3PSdL/',
    name: 'فيسبوك',
    handle: 'simo.el.awidi',
  },
  whatsapp: {
    url: 'https://wa.me/212713416046',
    name: 'واتساب',
    handle: '+212713416046',
  },
  instagram: {
    url: 'https://www.instagram.com/el__aouidi_mohamed?obrf=ZzdlY3lqenUzeG44',
    name: 'انستقرام',
    handle: 'el__aouidi_mohamed',
  },
}

// القيم الافتراضية لإعدادات Google AdSense
export const DEFAULT_ADSENSE = {
  publisherId: '',                 // مثل: ca-pub-1234567890123456
  enabled: false,
  // AdSense script URL الرسمي (يعمل في المتصفحات)
  scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
}

// ذاكرة مؤقتة محلية (تُفرغ عند إعادة تشغيل الخادم)
let cache: { data: any; ts: number } | null = null
const CACHE_TTL = 60_000 // دقيقة واحدة

export async function GET() {
  try {
    // استخدم ذاكرة مؤقتة لتقليل الضغط على قاعدة البيانات
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }
    // اقرأ الإعدادات من قاعدة البيانات
    const rows = await db.appSetting.findMany({
      where: {
        id: { startsWith: 'social_' },
      },
    })
    const map: Record<string, string> = {}
    for (const r of rows) map[r.id] = r.value

    const data = {
      facebook: {
        url: map['social_facebook_url'] || DEFAULT_SOCIAL_LINKS.facebook.url,
        name: 'فيسبوك',
        handle: map['social_facebook_handle'] || DEFAULT_SOCIAL_LINKS.facebook.handle,
      },
      whatsapp: {
        url: map['social_whatsapp_url'] || DEFAULT_SOCIAL_LINKS.whatsapp.url,
        name: 'واتساب',
        handle: map['social_whatsapp_handle'] || DEFAULT_SOCIAL_LINKS.whatsapp.handle,
      },
      instagram: {
        url: map['social_instagram_url'] || DEFAULT_SOCIAL_LINKS.instagram.url,
        name: 'انستقرام',
        handle: map['social_instagram_handle'] || DEFAULT_SOCIAL_LINKS.instagram.handle,
      },
      adsense: {
        publisherId: map['adsense_publisher_id'] || DEFAULT_ADSENSE.publisherId,
        enabled: map['adsense_enabled'] === 'true',
        scriptUrl: map['adsense_script_url'] || DEFAULT_ADSENSE.scriptUrl,
      },
    }
    cache = { data, ts: Date.now() }
    return NextResponse.json(data)
  } catch {
    // في حالة فشل الاتصال بقاعدة البيانات، أرجع القيم الافتراضية
    return NextResponse.json({
      ...DEFAULT_SOCIAL_LINKS,
      adsense: DEFAULT_ADSENSE,
    })
  }
}
