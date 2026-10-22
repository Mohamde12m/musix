'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Play, X, Check, Loader2 } from 'lucide-react'
import { useEarningsStore } from '@/lib/stores/earnings-store'
import { toast } from 'sonner'

const AD_DURATION = 15 // 15 ثانية
const REWARD_POINTS = 50

export function RewardedVideoAd() {
  const [show, setShow] = useState(false)
  const [countdown, setCountdown] = useState(AD_DURATION)
  const [canClaim, setCanClaim] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const triggerAnimation = useEarningsStore((s) => s.triggerAnimation)
  const setPoints = useEarningsStore((s) => s.setPoints)

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
    setShow(true)
    setClaimed(false)
    setCanClaim(false)
    setCountdown(AD_DURATION)
    let remaining = AD_DURATION
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
        toast.success(`🎉 ربحت ${data.points} نقطة!`)
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
        className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-right tap-scale"
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 pulse-glow">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-green-400">شاهد إعلان واربح 50 نقطة! 🎁</p>
          <p className="text-[10px] text-muted-foreground">15 ثانية فقط — حتى 5 مرات يوميًا</p>
        </div>
        <Play className="h-5 w-5 text-green-400" fill="currentColor" />
        <span className="absolute right-24 top-0 text-xl opacity-15 animate-bounce">🎁</span>
        <span className="absolute right-40 top-2 text-base opacity-10 animate-bounce" style={{ animationDelay: '0.3s' }}>💰</span>
      </button>

      {/* نافذة الإعلان بملء الشاشة */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-md mx-4"
            >
              <div className="overflow-hidden rounded-3xl border border-green-500/30 glass-strong">
                {/* رأس */}
                <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-bold">إعلان بمكافأة</span>
                  </div>
                  {canClaim && !claiming && !claimed ? (
                    <button onClick={() => setShow(false)} className="rounded-full bg-muted p-1.5 tap-scale">
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                {/* محتوى الإعلان */}
                <div className="p-4">
                  {claimed ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                        <Check className="h-10 w-10 text-green-500" />
                      </div>
                      <p className="text-lg font-bold text-green-400">+{REWARD_POINTS} نقطة!</p>
                      <p className="text-xs text-muted-foreground">تم إضافتها لرصيدك</p>
                    </div>
                  ) : (
                    <>
                      {/* منطقة الإعلان */}
                      <div className="relative min-h-[200px] overflow-hidden rounded-2xl bg-muted/30">
                        {/* إعلان Adsterra */}
                        <AdsterraInReward />

                        {/* عدّاد فوق الإعلان */}
                        {!canClaim && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                            <div className="text-4xl font-extrabold text-white">{countdown}</div>
                            <p className="text-xs text-white/80 mt-1">انتظر انتهاء الإعلان</p>
                          </div>
                        )}

                        {/* شريط تقدم */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: AD_DURATION, ease: 'linear' }}
                            className="h-full gradient-purple"
                          />
                        </div>
                      </div>

                      {/* زر استلام المكافأة */}
                      {canClaim && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={claim}
                          disabled={claiming}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-white font-bold tap-scale disabled:opacity-50"
                        >
                          {claiming ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> جارٍ منح النقاط...</>
                          ) : (
                            <><Gift className="h-5 w-5" /> استلام 50 نقطة 🎁</>
                          )}
                        </motion.button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// إعلان Adsterra داخل مكوّن المكافأة
function AdsterraInReward() {
  return (
    <div id="container-b107567049babbd9d8c92a1d06179f82" className="min-h-[200px] w-full" />
  )
}
