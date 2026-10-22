'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play } from 'lucide-react'

// إعلان فيديو بين الصفحات — يظهر كل 3 تنقلات
const NAV_KEY = 'musix_nav_count'
const SHOW_EVERY = 3 // كل 3 تنقلات
const AD_DURATION = 5000 // 5 ثواني قبل إمكانية التخطي

export function VideoAdInterstitial() {
  const [show, setShow] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // زيادة عدّاد التنقل
    let count = 0
    try {
      count = parseInt(sessionStorage.getItem(NAV_KEY) || '0') + 1
      sessionStorage.setItem(NAV_KEY, String(count))
    } catch {}

    // إظهار الإعلان كل SHOW_EVERY تنقلات
    if (count % SHOW_EVERY === 0) {
      setShow(true)
      // عدّاد تنازلي
      let remaining = 5
      setCountdown(remaining)
      const interval = setInterval(() => {
        remaining--
        setCountdown(remaining)
        if (remaining <= 0) {
          setCanSkip(true)
          clearInterval(interval)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  const close = () => setShow(false)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={canSkip ? close : undefined}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* إطار الإعلان */}
            <div className="overflow-hidden rounded-3xl border border-primary/30 glass-strong">
              {/* رأس الإعلان */}
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold">إعلان</span>
                </div>
                {canSkip ? (
                  <button
                    onClick={close}
                    className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary tap-scale"
                  >
                    تخطي <X className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    تخطي بعد {countdown}...
                  </span>
                )}
              </div>

              {/* محتوى الإعلان */}
              <div className="p-4">
                {/* إعلان Adsterra داخل الإعلان البيني */}
                <AdsterraVideoAd />
              </div>

              {/* شريط تقدم */}
              {!canSkip && (
                <div className="h-1 w-full bg-muted/30">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-full gradient-purple"
                  />
                </div>
              )}
            </div>

            {/* زر إغلاق في الزاوية */}
            {canSkip && (
              <button
                onClick={close}
                className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white shadow-lg"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// إعلان Adsterra داخل الإعلان البيني
function AdsterraVideoAd() {
  useEffect(() => {
    try {
      const script = document.createElement('script')
      script.async = true
      script.setAttribute('data-cfasync', 'false')
      script.src = 'https://bauval.org/21/b107567049babbd9d8c92a1d06179f82'
      document.body.appendChild(script)
    } catch {}
  }, [])

  return (
    <div className="flex flex-col items-center gap-3">
      <div id="container-b107567049babbd9d8c92a1d06179f82" className="min-h-[150px] w-full" />
      <p className="text-[10px] text-muted-foreground">شاهد الإعلان لدعم التطبيق 💜</p>
    </div>
  )
}
