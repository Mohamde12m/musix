'use client'

import { useEffect } from 'react'

// تسجيل Service Worker للتشغيل الأوفلاين
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('✅ Service Worker مسجّل'))
        .catch((e) => console.error('SW error:', e))
    }
  }, [])
  return null
}
