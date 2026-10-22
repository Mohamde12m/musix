import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], display: "swap" });
const tajawal = Tajawal({ variable: "--font-tajawal", subsets: ["arabic", "latin"], weight: ["400", "500", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL('https://musix-livid.vercel.app'),
  title: {
    default: 'MusiX — تطبيق الموسيقى العربية الأول | استمع واربح النقاط',
    template: '%s | MusiX',
  },
  description: 'استمع لأجمل الأغاني العربية والمغربية والراي والشعبي على MusiX. تطبيق موسيقي عربي احترافي مع نظام نقاط ومكافآت يومية. شاهد الإعلانات واربح النقاط وحوّلها إلى دراهم!',
  keywords: [
    'موسيقى', 'أغاني', 'MusiX', 'راي', 'عربية', 'مغربية', 'شعبي',
    'استماع', 'تحميل أغاني', 'موسيقى عربية', 'أغاني مغربية', 'راي مغربي',
    'تطبيق موسيقى', 'ربح نقاط', 'استمع واربح', 'أغاني جزائرية', 'أغاني عربية'
  ],
  authors: [{ name: 'MusiX', url: 'https://musix-livid.vercel.app' }],
  creator: 'MusiX',
  publisher: 'MusiX',
  applicationName: 'MusiX',
  category: 'Music',
  classification: 'Music & Audio',
  alternates: {
    canonical: '/',
    languages: { 'ar': '/', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_MA',
    localeAlternate: ['ar_SA', 'ar_EG', 'ar_DZ', 'ar_TN'],
    url: 'https://musix-livid.vercel.app',
    siteName: 'MusiX — تطبيق الموسيقى العربية',
    title: 'MusiX — تطبيق الموسيقى العربية الأول',
    description: 'استمع لأجمل الأغاني العربية والمغربية والراي. تطبيق موسيقي عربي احترافي مع نظام نقاط ومكافآت يومية. شاهد الإعلانات واربح النقاط!',
    images: [
      { url: '/icon.jpg', width: 512, height: 512, alt: 'MusiX', type: 'image/jpeg' },
      { url: '/store-assets/feature-graphic-1024x500.png', width: 1024, height: 500, alt: 'MusiX', type: 'image/png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@MusiX',
    creator: '@MusiX',
    title: 'MusiX — تطبيق الموسيقى العربية الأول',
    description: 'استمع لأجمل الأغاني العربية والمغربية والراي. شاهد الإعلانات واربح النقاط!',
    images: ['/store-assets/feature-graphic-1024x500.png'],
  },
  formatDetection: { telephone: false, address: false, email: false },
  manifest: '/manifest.json',
  icons: { icon: '/icon.jpg', apple: '/icon.jpg', shortcut: '/icon.jpg' },
  other: {
    'application-name': 'MusiX',
    'theme-color': '#0a0612',
    'msapplication-TileColor': '#0a0612',
  },
}


export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#0a0612",
};

const splashBootstrap = `(function(){try{if(sessionStorage.getItem('musix_splash_shown')){var s=document.createElement('style');s.id='musix-splash-hide';s.textContent='.splash-root{display:none!important}';document.head.appendChild(s);}}catch(e){}})();`;

// JSON-LD Structured Data — يساعد Google على فهم نوع الموقع
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MusiX — تطبيق الموسيقى العربية',
  alternateName: 'MusiX',
  url: 'https://musix-livid.vercel.app',
  description: 'تطبيق موسيقي عربي احترافي مع نظام نقاط ومكافآت يومية',
  inLanguage: 'ar',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://musix-livid.vercel.app/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'MusiX',
    url: 'https://musix-livid.vercel.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://musix-livid.vercel.app/icon.jpg',
      width: 512,
      height: 512,
    },
  },
};

const jsonLdMusic = {
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: 'MusiX',
  url: 'https://musix-livid.vercel.app',
  description: 'تطبيق موسيقي عربي يضم أجمل الأغاني العربية والمغربية والراي',
  genre: ['راي', 'شعبي', 'مغربية', 'عربية', 'جزائرية', 'راب'],
  sameAs: [
    'https://www.facebook.com/share/19oiL3PSdL/',
    'https://www.instagram.com/el__aouidi_mohamed',
    'https://wa.me/212713416046',
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashBootstrap }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdMusic) }} />
      </head>
      <body className={`${cairo.variable} ${tajawal.variable} font-sans antialiased app-bg min-h-screen`} style={{ fontFamily: "var(--font-cairo), system-ui, sans-serif" }}>
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
