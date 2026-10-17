// instrumentation.ts - يُشغّل تلقائيًا عند بدء خادم Next.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // سخّن الكاش في الخلفية بعد بدء الخادم
    setTimeout(async () => {
      try {
        // اطلب الصفحة الرئيسية لتسخين كاش Supabase
        const res = await fetch('http://localhost:3000/api/songs/home')
        if (res.ok) console.log('✅ Cache prewarmed on server start')
      } catch (e) {
        // الخادم قد لا يكون جاهزًا بعد - أعد المحاولة
        setTimeout(async () => {
          try { await fetch('http://localhost:3000/api/songs/home') } catch {}
        }, 5000)
      }
    }, 3000)
  }
}
