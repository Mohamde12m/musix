
---
Task ID: FIX-CARDS
Agent: main-orchestrator
Task: إصلاح بطاقات الأغاني غير العاملة

Work Log:
- المشكلة: SongCard (النسخة الافتراضية/الشبكة) لم يكن لها onClick على الجسم الخارجي - فقط أزرار التشغيل والمفضلة (المطلقة) تعمل
- الإصلاح 1: إضافة onClick={() => navigate('song', { songId: song.id })} على البطاقة → النقر ينتقل لصفحة الأغنية
- الإصلاح 2: زر التشغيل opacity-0 → opacity-100 على الهاتف (sm:opacity-0 sm:group-hover:opacity-100 على الحاسوب)
- الإصلاح 3: زر المفضلة opacity-0 → opacity-100 على الهاتف (نفس النمط)
- e.stopPropagation() في أزرار التشغيل/المفضلة يمنع تفعيل onClick البطاقة عند النقر على الأزرار

النتيجة المُتحققة:
- النقر على بطاقة الأغنية → صفحة التفاصيل تفتح ✅
- النقر على زر التشغيل → الأغنية تشتغل (يظهر زر إيقاف) ✅
- زر التشغيل والمفضلة ظاهران دائمًا على الهاتف ✅

---
Task ID: 1-research
Agent: Explore
Task: Find ad placement code

Work Log:
- Searched `/home/z/my-project/src` and `/home/z/my-project/public` for every ad-related signal:
  - Networks: `adsense`, `adsterra`, `adsbygoogle`, `googlesyndication`, `ca-pub-`, `gtag`, `google-analytics`, `googletagmanager`, `propellerads`, `popads`, `popcash`, `monetag`, `hilltop`, `admob`, `applovin`, `unity-ads`.
  - Component names: `AdBanner`, `AdComponent`, `AdSlot`, `AdUnit`, `AdContainer`, `BannerAd`, `NativeAd`, `Interstitial`, `RewardedAd`, `InFeedAd`, `AdGrid`, `AdCard`.
  - HTML/attrs: `data-ad-*`, `ad-slot`, `<ins>`, `dangerouslySetInnerHTML` + ad src, `NEXT_PUBLIC_AD*`, `ADSENSE`, `ADSTERRA`, `AD_CLIENT`, `AD_SLOT`.
  - Glob patterns: `**/ads/**`, `**/[Aa]d*.tsx`, `public/**/*ad*`.
  - Ad-format keywords: `banner`, `sponsor`, `monetiz`, `advert`, `ad-zone`, `ad-wrap`, `ad-container`.
- Read the key structural files to map the page layout:
  - `src/app/layout.tsx` (root layout, `<head>` script, no ad script)
  - `src/app/page.tsx` (the main page — `AppContent` returns `AudioEngine` + `PageRouter` + `MiniPlayer` + `BottomNav` + `FullPlayer` + `AssistantFloatingButton` + spacer divs; no ad components)
  - `src/components/naghma/layout/PageRouter.tsx` (the router that mounts each screen via a `switch` on `page` state)
  - `src/components/naghma/home/HomePage.tsx` (home screen layout — header, hero, categories, by-category rows, most-played, latest, featured, artists, plus an assistant promo; no ad slots)
- Inspected `public/sw.js`, `public/robots.txt`, `.env`, and `package.json` for any ad SDK / publisher ID / script include.
- Confirmed the only `<script>` tags in the app are: the splash-hiding bootstrap in `src/app/layout.tsx`, and `chart.tsx`/`dropdown-menu.tsx`/`command.tsx`/`context-menu.tsx`/`alert.tsx`/`menubar.tsx` (shadcn UI internals, no ad scripts).

Findings:
1. Ad component definitions — **NONE**. No `AdBanner`, `AdComponent`, `AdSlot`, etc. exist anywhere. The `src/components/` tree contains only shadcn/ui primitives (`src/components/ui/*`) and naghma feature components (`src/components/naghma/*`).
2. Current ad placements — **NONE**. No page renders any third-party ad. The closest in-app "banners" are not ads:
   - `src/components/naghma/home/HomePage.tsx` (lines 51–69): a self-promo button labeled "استمع واربح 💰" (Listen-and-Earn rewards button) that routes to the profile page.
   - `src/components/naghma/home/HomePage.tsx` (lines 148–154): a self-promo button for the in-app AI assistant.
   These are first-party call-to-action cards, not AdSense/Adsterra units.
3. Ad types — **NONE registered**. No banner, native banner, interstitial, rewarded video, in-feed, or sticky ad code paths exist.
4. Main page structure (`src/app/page.tsx`):
   - Root `Home()` → `ThemeProvider` → `QueryClientProvider` → `AppInner()`.
   - `AppInner()` renders `ServiceWorkerRegister`, `SplashScreen`, then `AppContent()` once ready.
   - `AppContent()` returns: `<AudioEngine />`, `<PageRouter />`, `<MiniPlayer />` (when track + not admin), `<BottomNav />` (when not admin), `<FullPlayer />`, `<AssistantFloatingButton />` (when not admin), then bottom spacers (`h-32` with track / `h-20` without). No ad slot is inserted at any of these positions.
5. Where ads would be inserted (candidate slots if added later): inside `AppContent()` between `PageRouter` and `MiniPlayer` (top-of-feed banner), inside `HomePage.tsx` between sections (in-feed native), or as a sticky element above `BottomNav`. None are currently present.

Stage Summary:
- The codebase at `/home/z/my-project` is a Next.js 16 music-streaming PWA ("MusiX / نغم") with **zero existing ad infrastructure**: no AdSense, no Adsterra, no ad components, no ad scripts in `layout.tsx`/`page.tsx`, no ad env vars, and no ad-related npm packages in `package.json`.
- The main page (`src/app/page.tsx`) composes `AudioEngine` + `PageRouter` (which renders `HomePage` and other screens via `src/components/naghma/layout/PageRouter.tsx`) + `MiniPlayer` + `BottomNav` + `FullPlayer` + `AssistantFloatingButton`; there are no ad slots at any position.
- The only "banner-like" elements are two first-party promo cards in `src/components/naghma/home/HomePage.tsx` (a rewards CTA and an assistant CTA) — neither is a third-party ad.
- To add ads, the next agent should create a dedicated component (e.g. `src/components/naghma/ads/AdBanner.tsx`, `AdsterraNative.tsx`, `RewardedAdModal.tsx`), load the network script in `src/app/layout.tsx` (or via `next/script`), and insert slots into `AppContent()` (sticky banner above `BottomNav`) and `HomePage.tsx` (in-feed between sections). No existing code needs to be removed — only added.
