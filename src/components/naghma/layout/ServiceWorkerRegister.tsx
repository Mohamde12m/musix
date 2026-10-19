'use client'

import { useEffect } from 'react'

// تسجيل Service Worker الذي يلغي نفسه وينظف الكاش القديم
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW: cleanup registered'))
        .catch(() => {})
      // الاستماع لرسالة الإلغاء
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'UNREGISTERED') {
          window.location.reload()
        }
      })
    }
  }, [])
  return null
}
