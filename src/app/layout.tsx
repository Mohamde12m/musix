import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"], display: "swap" });
const tajawal = Tajawal({ variable: "--font-tajawal", subsets: ["arabic", "latin"], weight: ["400", "500", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "MusiX - تطبيق الموسيقى العربية",
  description: "تطبيق موسيقي عربي احترافي",
  keywords: ["موسيقى", "أغاني", "MusiX", "راي", "عربية"],
  authors: [{ name: "MusiX" }],
  icons: { icon: "/icon.jpg", apple: "/icon.jpg", shortcut: "/icon.jpg" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5, viewportFit: "cover", themeColor: "#0a0612",
};

const splashBootstrap = `(function(){try{if(sessionStorage.getItem('musix_splash_shown')){var s=document.createElement('style');s.id='musix-splash-hide';s.textContent='.splash-root{display:none!important}';document.head.appendChild(s);}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashBootstrap }} />
      </head>
      <body className={`${cairo.variable} ${tajawal.variable} font-sans antialiased app-bg min-h-screen`} style={{ fontFamily: "var(--font-cairo), system-ui, sans-serif" }}>
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
