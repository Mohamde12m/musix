import { MetadataRoute } from 'next'

const BASE_URL = 'https://musix-livid.vercel.app'

// robots.txt محسّن — يسمح لمحركات البحث بِزحف الموقع + رابط sitemap
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // السماح لِكل البوتات بِزحف الموقع العام
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/admin/*',
          '/api/auth/*',
          '/api/earnings/*',
          '/api/ads',
          '/admin-*',
        ],
      },
      {
        // السماح لِـ Googlebot بِزحف الصور أيضاً
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        // السماح لِـ Bingbot
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        // السماح لِـ Facebook (لِمشاركة الموقع)
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        // السماح لِـ Twitter
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        // السماح لِـ WhatsApp (لِمشاركة الروابط)
        userAgent: 'WhatsApp',
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
