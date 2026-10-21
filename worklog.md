
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

---
Task ID: 2
Agent: Z.ai Code (main)
Task: تغيير الثالث السفلي من الشاشة (المشغل + شريط التنقل) إلى ألوان أبيض وأسود مع لمسات بنفسجية، وإضافة فجوة صغيرة بين المشغل المصغر وشريط التنقل، مع التركيز على وضع الهاتف العمودي.

Work Log:
- قرأت ملفات العمل السابقة في worklog.md
- فحصت الهيكل الحالي للمشغل و شريط التنقل في `src/components/naghma/layout/MiniPlayer.tsx` و `BottomNav.tsx`
- راجعت `src/app/page.tsx` لفهم ترتيب العناصر في الصفحة الرئيسية
- أضفت 5 فئات CSS جديدة في `src/app/globals.css` تحت قسم "لوحة أبيض وأسود للثالث السفلي":
  - `.bw-glass` (أسود شفاف + blur)
  - `.bw-glass-strong` (أسود داكن جداً + blur + box-shadow)
  - `.bw-divider` (رمادي للفواصل)
  - `.bw-muted` (رمادي فاتح للنصوص الثانوية)
  - `.bw-accent-dot` (نفسجي مطابق للون الرئيسي للنقطة النشطة)
- حدّثت `MiniPlayer.tsx`:
  - استبدلت `glass-strong` بـ `bw-glass-strong`
  - استبدلت `border-border/40` بلا حدود بنفسجي، استخدمت رمادي محايد `border-neutral-700/60`
  - غيرت النص من `text-muted-foreground` إلى `bw-muted`، والنص الرئيسي إلى `text-white`
  - أضفت فجوة 8px باستخدام `style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}` بدلاً من `bottom-[64px]` — الآن يفصل بين المشغل و الشريط مسافة 8px + دعم المنطقة الآمنة
  - أزلت `safe-bottom` عن المشغل لأن المعادلة الآن تعالج المنطقة الآمنة تلقائياً
  - حافظت على `gradient-purple` لزر التشغيل وشريط التقدم للحفاظ على هوية التطبيق
- حدّثت `BottomNav.tsx`:
  - استبدلت `glass-strong` بـ `bw-glass-strong`
  - استبدلت الحدود `border-border/40` بـ `border-neutral-700/60`
  - غيرت الأيقونات من `text-muted-foreground` إلى `bw-muted` والعنصر النشط من `text-primary`/`bg-primary/15` إلى `text-white` مع `bw-accent-dot` (نفسجي مطابق)
- شغّلت lint: لا أخطاء، فقط تحذير مسبق في SplashScreen غير مرتبط
- اختبرت النتيجة بـ Agent Browser مع محاكاة iPhone 14 (وضع الهاتف العمودي):
  - دخلت كأدمن
  - نشّطت أغنية "TGV" للتشغيل
  - أخذت لقطة شاشة و حلّلتها بـ VLM:
    - شريط التنقل السفلي: أسود ✅
    - المشغل المصغر: رمادي داكن (كربوني) ✅
    - توجد فجوة واضحة بين المشغل وشريط التنقل ✅
    - أيقونات شريط التنقل: بيضاء ✅

Stage Summary:
- الثالث السفلي الآن بِأبيض وأسود (grayscale) مع لمسات بنفسجية بسيطة (شريط التقدم، زر التشغيل، النقطة النشطة في الشريط) — يتماشى مع الألوان الرئيسية
- فجوة 8px ظاهرة بين المشغل المصغر وشريط التنقل، مع دعم المنطقة الآمنة على أجهزة iPhone
- التصميم مهيأ لوضع الهاتف العمودي (max-w-md يحصر العرض، calc مع safe-area-inset-bottom)
- الفئات الجديدة يمكن إعادة استخدامها لاحقاً في مكونات أخرى إذا لزم

---
Task ID: 3
Agent: Z.ai Code (main)
Task: جعل خلفية المشغل المصغر غير شفافة تماماً + إضافة حافة بلون مختلف للمؤشرات المنزلقة (نقطة شريط التنقل النشطة + مقابض شريط التمرير في FullPlayer).

Work Log:
- قرأت العمل السابق في worklog.md لمعرفة السياق
- فحصت CSS الحالي ووجدت أن `.bw-glass-strong` يستخدم `oklch(0.04 0 0 / 0.96)` (96% شفافية) مع `backdrop-filter: blur()` — شفاف جزئياً
- راجعت slider.tsx لمعرفة بنية مؤشر التمرير (Thumb)
- أضفت في globals.css فئتين جديدتين:
  - `.bw-opaque` — خلفية سوداء صلبة تماماً (alpha=1، بدون backdrop-filter، بدون شفافية) للمشغل
  - `.bw-accent-bordered` — مؤشر بنفسجي داخلي + حافة بيضاء 1.5px + هالة بنفسجية خفيفة
- حدّثت MiniPlayer.tsx: استبدلت `bw-glass-strong` بـ `bw-opaque` — الآن الخلفية سوداء مصمتة
- حدّثت BottomNav.tsx: استبدلت `bw-accent-dot` بـ `bw-accent-bordered` للنقطة النشطة — الآن لها حافة بيضاء واضحة
- حدّثت slider.tsx: المقبض (Thumb) الجديد = خلفية بنفسجية (`bg-primary`) + حافة بيضاء 2px
  - لاحظت أن `border-white` لم يعمل لأن قاعدة `* { border-color: var(--border); }` في globals.css (خارج أي layer) تتجاوزها بسبب ترتيب CSS layers في Tailwind v4
  - استخدمت `style={{ border: '2px solid oklch(0.97 0 0)' }}` بدلاً من ذلك لضمان الحافة البيضاء
- شغّلت lint: لا أخطاء
- اختبرت بـ Agent Browser (iPhone 14 viewport):
  - فحصت الـ computed style لـ `.bw-opaque`: ✅ الخلفية `oklch(0.04 0 0)` بدون شفافية (alpha=1)
  - فحصت الـ computed style للمقبض: ✅ الحافة `2px solid oklch(0.97 0 0)` (أبيض نقي)
  - حلّلت لقطة الشاشة بـ VLM:
    - "المشغل المصغر خلفيته سوداء مصمتة" ✅
    - "النقطة النشطة لها حافة بيضاء واضحة" ✅
    - "المقبض الداخلي بنفسجي + إطار دائري أبيض رفيع" ✅

Stage Summary:
- المشغل المصغر الآن خلفيته سوداء مصمتة 100% (لا شفافية، لا blur)
- النقطة النشطة في شريط التنقل لها حافة بيضاء (مختلفة عن اللون البنفسجي الداخلي)
- مقابض شريط التمرير (seek + volume) في FullPlayer لها حافة بيضاء 2px حول اللون البنفسجي الداخلي
- جميع المؤشرات المنزلقة الآن لها "بلون الحواف مختلف" كما طلب المستخدم
- التغييرات تركز على وضع الهاتف العمودي (iPhone 14 viewport)

---
Task ID: 4
Agent: Z.ai Code (main)
Task: إضافة زوم خفيف (5-10%) على صور الأغلفة (YouTube thumbnails) في كل التطبيق لملء الحاويات بالكامل بدون ظهور خلفية سوداء.

Work Log:
- قرأت العمل السابق في worklog.md لمعرفة السياق
- بحثت عن كل صور الأغلفة (object-cover) في src/ — ووجدت 8 أماكن تعرض صور أغلفة الأغاني
- طبّعت الزوم على النحو التالي:
  - **scale-110** (10% زوم) للصور الصغيرة (حجم ≤ 56px): SongCard (list variant), MiniPlayer, FullPlayer queue items, AssistantPage
  - **scale-105** (5% زوم) للصور الكبيرة: SongCard (default variant), HomePage hero, SongDetailPage, FullPlayer large cover
- للحفاظ على التأثير الحركي عند الـ hover، أبقيت `group-hover:scale-110` على SongCard الكبيرة فوق الزوم الافتراضي (scale-105)
- لـ FullPlayer الكبير: غيّرت المنطق من `isPlaying ? scale-105 : scale-100` إلى `scale-105` دائماً + `scale-110` عند التشغيل (zoom إضافي كتأثير حركي)
- أضفت `transition-transform duration-500` على كل الصور المعدّلة للحركة السلسة
- شغّلت lint: لا أخطاء (تحذير مسبق في SplashScreen فقط)
- اختبرت بـ Agent Browser (iPhone 14 viewport):
  - حلّلت لقطة شاشة للصفحة الرئيسية بـ VLM:
    - "الصور ممتلئة بالكامل بدون خلفية سوداء" ✅
    - "الصور مكبّرة قليلاً (zoomed in)" ✅
    - "رأس المغني وقسم من الجيتار في أعلى الصورة قد تم قصهما قليلاً، مما يشير إلى أن الصورة أكبر من إطار العرض وقد تم تكبيرها لملء المساحة" ✅
  - حلّلت لقطة شاشة لصفحة تفاصيل الأغنية:
    - "الصورة تملأ عرض الحاوية بالكامل" ✅
    - "لا يوجد إطار أسود حول الصورة داخل الحاوية" ✅
    - "الصورة مكبرة أو مقصوصة (Cropped)" ✅

Stage Summary:
- كل صور أغلفة الأغاني (8 مواقع في التطبيق) الآن عليها زوم خفيف (5-10%)
- لن تظهر خلفية سوداء داخل أي حاوية صورة غلاف أغنية بعد الآن
- الزوم صُمّم ليكون متدرّجاً: 5% للصور الكبيرة، 10% للصور الصغيرة (لأن الزوم يكون أكثر وضوحاً على الصور الصغيرة)
- الحاويات لديها `overflow-hidden` فلن يفيض الزوم خارج الإطار
- الحركة السلسة مضمونة عبر `transition-transform duration-500` على كل الصور

الملفات المعدّلة:
- src/components/naghma/cards/SongCard.tsx (سطران)
- src/components/naghma/layout/MiniPlayer.tsx
- src/components/naghma/player/FullPlayer.tsx (سطران)
- src/components/naghma/home/HomePage.tsx
- src/components/naghma/pages/SongDetailPage.tsx
- src/components/naghma/assistant/AssistantPage.tsx

---
Task ID: 5
Agent: Z.ai Code (main)
Task: زيادة الزوم على جميع البطاقات (الأغاني + التصنيفات + الفنانون + الألبومات) لتعبئة البطاقة بالكامل بدون أي خلفية سوداء.

Work Log:
- قرأت العمل السابق في worklog.md
- لاحظت أن الزوم السابق (5-10%) لم يكن كافياً لبعض البطاقات، فرفعت القيم
- حدّثت جميع البطاقات بمستويات زوم متدرّجة:
  - **scale-125** (25%) للصور الصغيرة (≤56px): SongCard list, MiniPlayer, FullPlayer queue, AssistantPage
  - **scale-110** دائماً + **group-hover:scale-125** عند الـ hover للبطاقات الكبيرة: SongCard default, CategoryCard, ArtistCard, DiscoverPage categories
  - **scale-110** للبانرات والصور الكبيرة: HomePage hero, SongDetailPage, FullPlayer large cover (with scale-125 when playing), CategoryDetailPage banner, ArtistDetailPage artist image & album covers
- شغّلت lint: لا أخطاء (تحذير مسبق في SplashScreen فقط)
- اختبرت بـ Agent Browser (iPhone 14 viewport):
  - فحصت الـ computed style لصورة مصغّرة من يوتيوب (mqdefault.jpg):
    - className: `object-cover scale-110 transition-transform duration-500 group-hover:scale-125`
    - --tw-scale-x: 110% ✅
    - scale: 1.1 ✅ (Tailwind v4 يستخدم خاصية `scale` الجديدة من CSS Transform Module Level 2)
    - objectFit: cover ✅
  - فحصت الـ bounding box للصورة:
    - الصورة: x=-630, w=176 (أعرض من البطاقة بـ 16px)
    - البطاقة: x=-622, w=160
    - imgCoversParent: true ✅ — الصورة تغطّي البطاقة بالكامل
  - حلّلت لقطة شاشة بـ VLM للصفحة الرئيسية:
    - "جميع البطاقات الثلاث (مربعة أو مستطيلة) تحتوي على صور تملأ مساحتها بالكامل، ولا يوجد أي فراغ أسود حول الصور داخل حدود البطاقات" ✅

Stage Summary:
- جميع البطاقات الآن عليها زوم كافٍ لتعبئتها بالكامل (10-25% حسب حجم الصورة)
- الزوم مطبّق على: SongCard (list + default), CategoryCard, ArtistCard, DiscoverPage categories, ArtistDetailPage (artist + albums), MiniPlayer, FullPlayer (large + queue), HomePage hero, SongDetailPage, CategoryDetailPage, AssistantPage
- تقنياً، استخدمت Tailwind v4 utilities (`scale-110`, `scale-125`, `group-hover:scale-125`) التي تستخدم خاصية `scale` الجديدة (CSS Transform Module Level 2) بدلاً من `transform: scale()` القديم
- الحاوية الأصلية لديها `overflow-hidden` لقطع الفيض

الملفات المعدّلة (11 ملف):
1. src/components/naghma/cards/SongCard.tsx (list + default)
2. src/components/naghma/cards/CategoryCard.tsx
3. src/components/naghma/cards/ArtistCard.tsx
4. src/components/naghma/pages/ArtistDetailPage.tsx (artist + album covers)
5. src/components/naghma/pages/DiscoverPage.tsx (categories)
6. src/components/naghma/pages/CategoryDetailPage.tsx (banner)
7. src/components/naghma/pages/SongDetailPage.tsx
8. src/components/naghma/layout/MiniPlayer.tsx
9. src/components/naghma/player/FullPlayer.tsx (large cover + queue items)
10. src/components/naghma/home/HomePage.tsx (hero banner)
11. src/components/naghma/assistant/AssistantPage.tsx

---
Task ID: 6
Agent: Z.ai Code (main)
Task: إضافة قسم مواقع التواصل الاجتماعي (فيسبوك + واتساب + انستقرام) في صفحة الحساب.

Work Log:
- قرأت العمل السابق في worklog.md
- فحصت بنية صفحة الحساب `ProfilePage.tsx` — وجدت أن القسم يحتوي على أقسام: الحساب، التفضيلات، الإدارة
- قرّرت أن أفضل مكان لإضافة قسمم التواصل الاجتماعي هو أسفل قسم "الإدارة" وقبل الـ footer
- استوردت أيقونات Lucide: `Facebook` و `Instagram` (متوفرة رسمياً)
- لاحظت أن Lucide لا يحتوي على أيقونة WhatsApp رسمية، لذلك أنشأت مكوّن `WhatsAppIcon` مخصص باستخدام SVG path رسمي لشعار واتساب
- أضفت ثابت `SOCIAL_LINKS` في أعلى الملف مع روابط placeholder وملاحظات توضيحية بالعربية لكيفية تعديلها:
  - facebook: `https://facebook.com/musix`
  - whatsapp: `https://wa.me/212600000000`
  - instagram: `https://instagram.com/musix`
- أضفت قسم "تابعنا على مواقع التواصل" بتصميم شبكي (grid-cols-3) مع:
  - كل أيقونة بدائرة ملوّنة بتدرج لون العلامة التجارية:
    - فيسبوك: تدرّج أزرق (#1877F2 → #0a4da8)
    - واتساب: تدرّج أخضر (#25D366 → #128C3F)
    - انستقرام: تدرّج برتقالي/وردي/بنفسجي (#F58529 → #DD2A7B → #8134AF)
  - كل بطاقة في `rounded-2xl border border-border/40 bg-card/40 p-3`
  - تأثير `group-hover:scale-110` على الأيقونة الدائرية (تتوسّع عند التحويم)
  - تأثير `tap-scale` (انكماش عند اللمس)
  - خصائص `target="_blank" rel="noopener noreferrer"` لفتح الرابط في تبويب جديد بأمان
- شغّلت lint: لا أخطاء (تحذير مسبق في SplashScreen فقط)
- اختبرت بـ Agent Browser (iPhone 14 viewport):
  - دخلت كأدمن
  - انتقلت إلى صفحة الحساب
  - لاحظت أن القسم ليس مرئيًا في أعلى الصفحة (يحتاج تمرير لأسفل)
  - مرّرت لأسفل وأخذت لقطة شاشة
  - حلّلت اللقطة بـ VLM:
    - "فيسبوك: أيقونة دائرية زرقاء اللون عليها حرف f أبيض" ✅
    - "واتساب: أيقونة دائرية خضراء اللون عليها رمز الهاتف الأبيض" ✅
    - "انستقرام: أيقونة دائرية مائلة للبرتقالي/الوردي (تدرج لوني) عليها رمز الكاميرا الأبيض" ✅

Stage Summary:
- تمت إضافة قسم "تابعنا على مواقع التواصل" في أسفل صفحة الحساب
- ثلاث بطاقات شبكية: فيسبوك، واتساب، انستقرام — بألوان علاماتهم التجارية
- أيقونة واتساب رسمية (SVG مخصص) لأن Lucide لا يوفرها
- الروابط قابلة للتعديل بسهولة من ثابت `SOCIAL_LINKS` في أعلى الملف
- كل رابط يفتح في تبويب جديد مع حماية `noopener noreferrer`
- التصميم متناسق مع باقي بطاقات الصفحة (نفس الحواف والخلفيات)

الملفات المعدّلة:
- src/components/naghma/pages/ProfilePage.tsx

---
Task ID: 7
Agent: Z.ai Code (main)
Task: إنشاء قسم «تواصل معي» احترافي مع إمكانية التعديل من لوحة تحكم المسؤول، باستخدام الروابط الرسمية المقدمة.

Work Log:
- قرأت العمل السابق في worklog.md
- لاحظت أن نموذج `AppSetting` (id/value) موجود مسبقاً في schema.prisma — استخدمته لتخزين الروابط
- أنشأت ملفّي API:
  - `src/app/api/settings/route.ts` (GET عام): يرجع الروابط مع fallback للقيم الافتراضية، مع ذاكرة مؤقتة لمدة دقيقة
  - `src/app/api/admin/settings/route.ts` (GET/PUT للمسؤول): يقرأ ويحدّث الروابط في قاعدة البيانات
- أضفت القيم الافتراضية الرسمية المقدمة من المستخدم:
  - Facebook: https://www.facebook.com/share/19oiL3PSdL/
  - WhatsApp: https://wa.me/212713416046
  - Instagram: https://www.instagram.com/el__aouidi_mohamed?obrf=ZzdlY3lqenUzeG44
- أضفت في api-client.ts ثلاث دوال: `fetchSocialLinks`, `adminFetchSettings`, `adminUpdateSettings`
- أضفت نوع `SocialLinks` للـ TypeScript
- أعدت تصميم قسم «تواصل معي» في ProfilePage.tsx بتصميم احترافي:
  - ترويسة بخلفية radial-gradient بنفسجية و glow
  - 3 بطاقات motion.a مع whileTap={scale:0.92} و whileHover={y:-3} (Framer Motion)
  - كل بطاقة:
    - دائرة كبيرة (h-12 w-12) بتدرّج لون العلامة التجارية
    - توهّج خلفي يظهر عند الـ hover بلون العلامة
    - الأيقونة تدور قليلاً عند الـ hover
    - اسم المنصة بالخط العريض
    - اسم الحساب/المعرّف أسفلها بـ dir="ltr"
  - شريط ألوان سفلي بلمسة لونية تجمع الألوان الثلاثة
- أضفت `admin-settings` إلى:
  - `PageId` في nav-store.ts
  - `SUB_PAGES` في AdminApp.tsx
  - `renderPage` في PageRouter.tsx (هذا كان السبب في إعادة توجيه غير مقصودة للصفحة الرئيسية — تم اكتشافه وإصلاحه)
- أضفت `SettingsView` في AdminApp.tsx — صفحة كاملة بـ:
  - 3 بطاقات لكل منصة مع أيقونة ملوّنة + حقل URL + حقل Handle/Name
  - زر حفظ بنمط gradient-purple مع حالة loading
  - تنبيه تفصيلي بالعربية يشرح أن الروابط تظهر في صفحة الحساب
  - تنبيه للصيغة الصحيحة لرقم واتساب (بدون + وبدون أصفار محلية)
- اختبرت بـ Agent Browser:
  - تحققت من أن API العام `GET /api/settings` يرجع القيم الافتراضية الصحيحة ✅
  - تحققت من أن API المسؤول `PUT /api/admin/settings` يحفظ التعديلات في قاعدة البيانات (عدّلت handle الفيسبوك من "MusiX" إلى "MusiX Aouidi" ثم تحققت من التحديث فوراً) ✅
  - تحققت من عمل إبطال الكاش (التحديث ظهر فوراً في API العام) ✅
  - اختبرت الروابط الثلاثة بـ curl:
    - Facebook: 200 OK → يُعيد توجيهاً إلى صفحة `simo.el.awidi` ✅
    - WhatsApp: 200 OK → يُعيد توجيهاً إلى `api.whatsapp.com/send/?phone=212713416046` ✅
    - Instagram: 429 (محدودية المعدل لطلبات السيرفر — لكنه يعمل في المتصفح الحقيقي) ⚠️
  - تحققت من ظهور قسم «تواصل معي» في صفحة الحساب بـ VLM:
    - "3 بطاقات بأيقونات ملوّنة (إنستغرام تدرّجي، واتساب أخضر، فيسبوك أزرق)" ✅
    - "أسماء الحسابات ظاهرة أسفل كل أيقونة" ✅
    - "التصميم احترافي وأنيق" ✅
    - "شريط ملون في الأسفل يجمع الألوان الثلاثة" ✅
  - تحققت من ظهور صفحة الإعدادات في لوحة المسؤول بـ VLM:
    - "بطاقات لروابط واتساب وانستقرام" ✅
    - "القيم المعبّأة: https://wa.me/212713416046 و +212713416046 للواتساب" ✅
    - "https://www.instagram.com/el__aouidi_mohamed و el__aouidi_mohamed للانستقرام" ✅
    - "زر حفظ بنفسجي في الأسفل" ✅

Stage Summary:
- قسم «تواصل معي» الاحترافي منفّذ في صفحة الحساب بتصميم عصري وأنيق
- الروابط تُخزّن في قاعدة البيانات (AppSetting) ويمكن تعديلها من لوحة تحكم المسؤول
- القيم الافتراضية المدمجة تستخدم الروابط الرسمية للمستخدم (Facebook share/19oiL3PSdL, WhatsApp 212713416046, Instagram el__aouidi_mohamed)
- ذاكرة مؤقتة لمدة دقيقة تقلل من ضغط قاعدة البيانات
- إبطال كاش تلقائي عند التحديث
- Framer Motion animations: whileTap + whileHover للأزرار
- ألوان العلامات التجارية الرسمية لكل منصة
- اسم الحساب ظاهر أسفل كل أيقونة (MusiX Aouidi / +212713416046 / el__aouidi_mohamed)
- شريط ألوان سفلي بلمسة بصرية

الملفات المعدّلة/المنشأة:
- NEW: src/app/api/settings/route.ts (GET عام)
- NEW: src/app/api/admin/settings/route.ts (GET/PUT للمسؤول)
- src/lib/api-client.ts (إضافة 3 دوال + نوع SocialLinks)
- src/lib/stores/nav-store.ts (إضافة 'admin-settings' إلى PageId)
- src/components/naghma/layout/PageRouter.tsx (إضافة case 'admin-settings')
- src/components/naghma/pages/ProfilePage.tsx (إعادة تصميم قسم «تواصل معي» + جلب من API)
- src/components/naghma/admin/AdminApp.tsx (إضافة SettingsView + تحديث SUB_PAGES و iconFor/labelFor)

---
Task ID: 8
Agent: Z.ai Code (main)
Task: نشر التغييرات على موقع Vercel الإنتاجي (https://musix-livid.vercel.app) - السبب: كانت التغييرات محلية فقط ولم تُنشر بعد.

Work Log:
- قرأت العمل السابق في worklog.md
- اكتشفت أن هناك 38 commits محلية لم تُنشر إلى GitHub (origin/main)
- اكتشفت أن هناك 3 commits على origin/main لم تكن لدي محليًا (ميزات الإعلانات: AdBanner، RewardedVideoAd، InterstitialAd)
- عملت git pull --rebase لدمج تغييراتي فوق تغييرات origin
- حدث تعارض في `src/components/naghma/pages/ProfilePage.tsx` (مرة واحدة في imports) — حُلّ بدمج الـ imports (Lucide icons + RewardedVideoAd)
- شغّلت lint: نجح بدون أخطاء (تحذير مسبق في SplashScreen فقط)
- نفّذت `git push origin main` — نجح الـ push!
- انتظرت 60 ثانية حتى ينتهي Vercel من البناء
- اختبرت API العام `https://musix-livid.vercel.app/api/settings`:
  - HTTP 200 ✅
  - يرجع القيم الصحيحة:
    - Facebook: url=https://www.facebook.com/share/19oiL3PSdL/, handle=simo.el.awidi ✅
    - WhatsApp: url=https://wa.me/212713416046, handle=+212713416046 ✅
    - Instagram: url=https://www.instagram.com/el__aouidi_mohamed?obrf=ZzdlY3lqenUzeG44, handle=el__aouidi_mohamed ✅
- اختبرت API المسؤول `https://musix-livid.vercel.app/api/admin/settings`:
  - POST /api/admin/login نجح ✅
  - GET /api/admin/settings نجح ويرجع القيم من قاعدة بيانات Supabase ✅

Stage Summary:
- جميع التغييرات منشورة الآن على موقع Vercel الإنتاجي
- قسم «تواصل معي» الاحترافي ظاهر في صفحة الحساب على https://musix-livid.vercel.app
- صفحة الإعدادات في لوحة المسؤول تعمل على الإنتاج
- الروابط الرسمية للمستخدم محفوظة في قاعدة البيانات (Supabase) ومتاحة عبر API
- ميزات الإعلانات (AdBanner، RewardedVideoAd، InterstitialAd) محفوظة من الـ origin
- جميع الميزات السابقة (B&W styling، zoom، الفجوة بين المشغل والشريط، ...) منشورة أيضًا

الموقع المباشر: https://musix-livid.vercel.app
