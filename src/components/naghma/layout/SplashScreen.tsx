'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const SPLASH_KEY = 'musix_splash_shown'
const SPLASH_DURATION = 5000

interface SplashScreenProps { onDone?: () => void }

export function SplashScreen({ onDone }: SplashScreenProps = {}) {
  const [show, setShow] = useState(true)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    const alreadyDone = typeof document !== 'undefined' && !!document.getElementById('musix-splash-hide')
    if (alreadyDone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimate(false)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(false)
      return
    }
    const timer = setTimeout(() => {
      setShow(false)
      try { sessionStorage.setItem(SPLASH_KEY, '1') } catch {}
    }, SPLASH_DURATION)
    return () => clearTimeout(timer)
  }, [])

  const skip = () => {
    setShow(false)
    try { sessionStorage.setItem(SPLASH_KEY, '1') } catch {}
  }

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          data-splash=""
          initial={animate ? { opacity: 1 } : false}
          animate={{ opacity: 1 }}
          exit={animate ? { opacity: 0, scale: 1.05, transition: { duration: 0.6, ease: 'easeInOut' } } : { opacity: 0, transition: { duration: 0 } }}
          onClick={skip}
          className="splash-root fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 30%, oklch(0.25 0.18 295 / 0.55), transparent 60%),radial-gradient(ellipse 80% 60% at 100% 100%, oklch(0.3 0.16 330 / 0.35), transparent 55%),radial-gradient(ellipse 80% 60% at 0% 0%, oklch(0.28 0.14 260 / 0.3), transparent 55%),oklch(0.04 0.02 290)' }}
          dir="ltr"
        >
          {animate && (
            <>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.2, opacity: 0.4 }} transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }} className="absolute h-[60vw] w-[60vw] max-w-[400px] max-h-[400px] rounded-full blur-3xl" style={{ background: 'oklch(0.65 0.28 295 / 0.3)' }} />
              <motion.div initial={{ scale: 1.1, opacity: 0.3 }} animate={{ scale: 0.9, opacity: 0.2 }} transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }} className="absolute h-[45vw] w-[45vw] max-w-[300px] max-h-[300px] rounded-full blur-3xl" style={{ background: 'oklch(0.7 0.25 330 / 0.4)' }} />
            </>
          )}
          <motion.div initial={animate ? { scale: 0.5, opacity: 0, y: 20 } : false} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
              {animate && <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute -inset-4 rounded-full border-2 border-transparent" style={{ background: 'conic-gradient(from 0deg, transparent 0%, oklch(0.7 0.28 295) 25%, transparent 50%, oklch(0.75 0.25 330) 75%, transparent 100%)', WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))', mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))' }} />}
              <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] overflow-hidden pulse-glow">
                <Image src="/icon.jpg" alt="MusiX" fill sizes="112px" className="object-cover" priority />
              </div>
            </div>
            <motion.h1 initial={animate ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-5xl font-extrabold tracking-tight gradient-purple-text text-glow" style={{ fontFamily: 'var(--font-tajawal), system-ui, sans-serif' }}>MusiX</motion.h1>
            <motion.p initial={animate ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="mt-2 text-sm text-muted-foreground" dir="rtl">عالم الموسيقى العربية بين يديك</motion.p>
            {animate && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex items-end justify-center gap-1.5 h-8">{Array.from({ length: 5 }).map((_, i) => <span key={i} className="w-1.5 rounded-full gradient-purple wave-bar" style={{ animationDelay: `${i * 180}ms`, height: '100%' }} />)}</motion.div>}
          </motion.div>
          {animate && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-[calc(env(safe-area-inset-bottom)+48px)] flex flex-col items-center gap-3"><div className="relative h-7 w-7"><div className="absolute inset-0 rounded-full border-2 border-muted/40" /><div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" style={{ animationDuration: '0.9s' }} /></div><p className="text-[10px] text-muted-foreground">جارٍ التحميل...</p></motion.div>}
          {animate && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.8 }} className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] text-[10px] text-muted-foreground/60">المس للتخطي</motion.p>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
