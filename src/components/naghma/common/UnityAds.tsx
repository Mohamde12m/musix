'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Play, X, Loader2, Check, Gamepad2 } from 'lucide-react'
import { useEarningsStore } from '@/lib/stores/earnings-store'
import { toast } from 'sonner'

// ====== إعدادات Unity Ads الافتراضية — عدّلها من لوحة المسؤول ======
// يمكن للمسؤول تعديل هذه القيم من صفحة الإعدادات في لوحة التحكم
// احصل على Game ID من https://dashboard.unity3d.com
const DEFAULT_UNITY_CONFIG = {
  gameId: 'YOUR_UNITY_GAME_ID',           // ← استبدل بـ Game ID الخاص بك
  bannerPlacementId: 'banner',           // ← استبدل بـ Banner Placement ID
  rewardedPlacementId: 'rewardedVideo',   // ← استبدل بـ Rewarded Placement ID
  interstitialPlacementId: 'video',       // ← استبدل بـ Interstitial Placement ID
  enabled: false,                          // ← فعّل Unity Ads
  scriptUrl: 'https://cdn.unityads.unity3d.com/sdk/unityads-web-1.0.0.min.js',
}

// تحميل Unity Ads SDK مرة واحدة فقط
let sdkLoaded = false
let sdkLoading = false
const sdkCallbacks: (() => void)[] = []

function loadUnitySDK(scriptUrl: string, onReady?: () => void) {
  if (typeof window === 'undefined') return
  // @ts-ignore - Unity Ads SDK global
  if (window.UnityAds) { onReady?.(); return }
  if (sdkLoaded) { onReady?.(); return }
  sdkCallbacks.push(() => onReady?.())
  if (sdkLoading) return
  sdkLoading = true
  const script = document.createElement('script')
  script.src = scriptUrl
  script.async = true
  script.onload = () => {
    sdkLoaded = true
    sdkLoading = false
    sdkCallbacks.splice(0).forEach(cb => cb())
  }
  script.onerror = () => {
    sdkLoading = false
    // SDK فشل التحميل — أزل الكاش
    sdkCallbacks.splice(0)
  }
  document.head.appendChild(script)
}

// تهيئة Unity Ads
function initUnityAds(gameId: string, scriptUrl: string, onReady?: () => void) {
  loadUnitySDK(scriptUrl, () => {
    try {
      // @ts-ignore - Unity Ads SDK global
      if (window.UnityAds && typeof window.UnityAds.init === 'function') {
        // @ts-ignore
        window.UnityAds.init({ gameId })
      }
      onReady?.()
    } catch {}
  })
}

// ====== بانر Unity Ads ======
export function UnityBannerAd({ config = DEFAULT_UNITY_CONFIG }: { config?: typeof DEFAULT_UNITY_CONFIG }) {
  const bannerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!config.enabled || !config.gameId || config.gameId === 'YOUR_UNITY_GAME_ID') return
    initUnityAds(config.gameId, config.scriptUrl, () => {
      try {
        // @ts-ignore
        if (window.UnityAds?.showBanner && bannerRef.current) {
          // @ts-ignore
          window.UnityAds.showBanner(bannerRef.current, config.bannerPlacementId)
        }
      } catch {}
    })
  }, [config])

  // لو غير مفعل أو بدون Game ID — اعرض placeholder
  if (!config.enabled || config.gameId === 'YOUR_UNITY_GAME_ID') {
    return null
  }

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-2">
      <div ref={bannerRef} className="min-h-[60px] w-full flex items-center justify-center gap-2 text-green-400">
        <Gamepad2 className="h-5 w-5" />
        <span className="text-xs font-medium">Unity Ads Banner</span>
      </div>
    </div>
  )
}

// ====== إعلان Unity Ads بمكافأة (Rewarded Video) ======
export function UnityRewardedAd({ config = DEFAULT_UNITY_CONFIG }: { config?: typeof DEFAULT_UNITY_CONFIG }) {
  const [show, setShow] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const [canClaim, setCanClaim] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [loading, setLoading] = useState(false)
  const triggerAnimation = useEarningsStore((s) => s.triggerAnimation)
  const setPoints = useEarningsStore((s) => s.setPoints)
  const REWARD_POINTS = 50

  const start = async () => {
    // تحقق من تسجيل دخول المستخدم قبل تشغيل الإعلان
    try {
      const r = await fetch('/api/auth/check')
      const d = await r.json()
      if (!d.user) {
        toast.info('📝 سجّل دخولك أولاً لربح النقاط! اضغط زر "إنشاء حساب"')
        return
      }
    } catch {}
    setLoading(true)
    setShow(true)
    setClaimed(false)
    setCanClaim(false)
    setCountdown(15)

    // محاولة عرض إعلان Unity حقيقي
    let adShown = false
    if (config.enabled && config.gameId && config.gameId !== 'YOUR_UNITY_GAME_ID') {
      try {
        // @ts-ignore
        if (window.UnityAds?.showRewardedVideo) {
          // @ts-ignore
          window.UnityAds.showRewardedVideo(config.rewardedPlacementId, {
            onComplete: () => { adShown = true; startCountdown() },
            onSkipped: () => { adShown = true; startCountdown() },
            onError: () => { adShown = true; startCountdown() },
          })
        }
      } catch {}
    }

    // إذا فشل عرض إعلان Unity حقيقي، استخدم العدّاد التجريبي
    setTimeout(() => {
      if (!adShown) startCountdown()
      setLoading(false)
    }, 1500)
  }

  const startCountdown = () => {
    let remaining = 15
    setCountdown(remaining)
    const interval = setInterval(() => {
      remaining--
      setCountdown(remaining)
      if (remaining <= 0) {
        setCanClaim(true)
        clearInterval(interval)
      }
    }, 1000)
  }

  const claim = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/earnings/reward', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setClaimed(true)
        triggerAnimation(data.points)
        setPoints(data.balance, data.balance, 0)
        toast.success(`🎉 ربحت ${data.points} نقطة من Unity Ads!`)
        setTimeout(() => setShow(false), 2000)
      } else {
        toast.error(data.error || 'تعذر منح المكافأة')
        setShow(false)
      }
    } catch {
      toast.error('خطأ')
      setShow(false)
    } finally {
      setClaiming(false)
    }
  }

  return (
    <>
      {/* زر مشاهدة الإعلان */}
      <button
        onClick={start}
        className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-4 text-right tap-scale"
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 pulse-glow">
          <Gamepad2 className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-purple-400">Unity Ads — شاهد واربح 50 نقطة! 🎮</p>
          <p className="text-[10px] text-muted-foreground">15 ثانية فقط — حتى 5 مرات يوميًا</p>
        </div>
        <Play className="h-5 w-5 text-purple-400" fill="currentColor" />
        <span className="absolute right-24 top-0 text-xl opacity-15 animate-bounce">🎮</span>
        <span className="absolute right-40 top-2 text-base opacity-10 animate-bounce" style={{ animationDelay: '0.3s' }}>💰</span>
      </button>

      {/* نافذة الإعلان بملء الشاشة */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 to-black border border-purple-500/40"
            >
              {/* ترويسة Unity */}
              <div className="flex items-center justify-between border-b border-purple-500/30 bg-purple-500/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700">
                    <Gamepad2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Unity Ads</p>
                    <p className="text-[10px] text-purple-300">Rewarded Video</p>
                  </div>
                </div>
                {canClaim && (
                  <button onClick={() => setShow(false)} className="rounded-full p-1.5 text-purple-300 hover:bg-purple-500/20" aria-label="إغلاق">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* منطقة الإعلان */}
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                    <p className="text-xs text-purple-300">جارٍ تحميل إعلان Unity...</p>
                  </div>
                ) : claimed ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-bold text-green-400">+{REWARD_POINTS} نقطة!</p>
                  </div>
                ) : canClaim ? (
                  <div className="flex flex-col items-center gap-3">
                    <Gift className="h-12 w-12 text-purple-400" />
                    <p className="text-sm text-white">اكتمل الإعلان!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-purple-500">
                      <span className="text-2xl font-bold text-purple-400">{countdown}</span>
                    </div>
                    <p className="text-xs text-purple-300">شاهد الإعلان حتى النهاية</p>
                  </div>
                )}
              </div>

              {/* زر المطالبة */}
              <div className="p-4">
                {canClaim && !claimed && (
                  <button
                    onClick={claim}
                    disabled={claiming}
                    className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-sm font-bold text-white tap-scale disabled:opacity-50"
                  >
                    {claiming ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : `احصل على ${REWARD_POINTS} نقطة`}
                  </button>
                )}
                {!canClaim && (
                  <p className="text-center text-[10px] text-purple-300">يمكنك التخطي بعد {countdown} ثانية</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ====== إعلان Unity Ads بين الصفحات (Interstitial) ======
const NAV_KEY_UNITY = 'musix_unity_nav_count'
const SHOW_EVERY_UNITY = 4 // كل 4 تنقلات

export function UnityInterstitialAd({ config = DEFAULT_UNITY_CONFIG }: { config?: typeof DEFAULT_UNITY_CONFIG }) {
  const [show, setShow] = useState(false)
  const [canSkip, setCanSkip] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!config.enabled) return
    let count = 0
    try {
      count = parseInt(sessionStorage.getItem(NAV_KEY_UNITY) || '0') + 1
      sessionStorage.setItem(NAV_KEY_UNITY, String(count))
    } catch {}

    if (count % SHOW_EVERY_UNITY === 0) {
      setShow(true)
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
  }, [config.enabled])

  const close = () => setShow(false)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950 to-black"
          >
            <div className="flex items-center justify-between border-b border-purple-500/30 bg-purple-500/10 p-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-400">Unity Ads</span>
              </div>
              {canSkip && (
                <button onClick={close} className="rounded-full p-1.5 text-purple-300 hover:bg-purple-500/20" aria-label="تخطي">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 pulse-glow">
                  <Gamepad2 className="h-8 w-8 text-white" />
                </div>
                <p className="text-xs text-purple-300">إعلان Unity Ads</p>
              </div>
            </div>
            <div className="p-3 text-center">
              {!canSkip ? (
                <p className="text-[10px] text-purple-300">يمكنك التخطي بعد {countdown} ثانية</p>
              ) : (
                <button onClick={close} className="text-xs text-purple-300 underline">تخطي الإعلان</button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
