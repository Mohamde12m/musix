'use client'

import Image from 'next/image'
import { Play, Pause, SkipForward, Heart, AlertCircle, RotateCw, Coins } from 'lucide-react'
import { usePlayerStore, formatTime } from '@/lib/stores/player-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useEarningsStore } from '@/lib/stores/earnings-store'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export function MiniPlayer() {
  const queue = usePlayerStore((s) => s.queue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const error = usePlayerStore((s) => s.error)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const setFullPlayer = useNavStore((s) => s.setFullPlayer)
  const toggleFav = useLibraryStore((s) => s.toggleFavorite)
  const favIds = useLibraryStore((s) => s.favoriteIds)

  const track = queue[currentIndex]
  if (!track) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const isFav = favIds.includes(track.id)

  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed inset-x-0 z-30 px-2" style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="mx-auto max-w-md">
        <div className="bw-opaque overflow-hidden rounded-2xl shadow-xl">
          <div className="h-0.5 w-full bw-divider"><div className="h-full gradient-purple transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
          {error ? (
            <div className="flex items-center gap-2 p-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p className="flex-1 truncate text-xs text-red-500">{error}</p>
              <button onClick={() => { usePlayerStore.getState().setError(null); usePlayerStore.getState().play() }} className="rounded-full p-2 text-white tap-scale" style={{ background: 'oklch(0.65 0.28 295)' }} aria-label="إعادة المحاولة"><RotateCw className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-2">
              <button onClick={() => setFullPlayer(true)} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-800 tap-scale" aria-label="فتح المشغل الكامل">
                {track.coverUrl ? <Image src={track.coverUrl} alt={track.title} fill sizes="48px" className="object-cover scale-110 transition-transform duration-500" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Play className="h-5 w-5 text-white" fill="currentColor" /></div>}
                {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>}
              </button>
              <button onClick={() => setFullPlayer(true)} className="min-w-0 flex-1 text-right"><p className="truncate text-xs font-semibold leading-tight text-white">{track.title}</p><p className="truncate text-[10px] bw-muted">{track.artistName || 'فنان غير معروف'}</p></button>
              {isPlaying && !isLoading && <div className="flex items-end gap-0.5 h-4">{[0,150,300,450].map((d) => <span key={d} className="w-0.5 h-full gradient-purple wave-bar" style={{ animationDelay: `${d}ms` }} />)}</div>}
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFav(track.id)} className={`rounded-full p-2 tap-scale ${isFav ? 'text-red-500' : 'bw-muted hover:text-white'}`} aria-label="مفضلة"><Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} /></button>
                <button onClick={() => togglePlay()} className="flex h-9 w-9 items-center justify-center rounded-full gradient-purple text-white shadow-lg tap-scale" aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
                  {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 mr-0.5" fill="currentColor" />}
                </button>
                <button onClick={() => next(false)} className="rounded-full p-2 text-white/70 tap-scale hover:bg-white/10" aria-label="التالية"><SkipForward className="h-4 w-4" fill="currentColor" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
      <PointsAnimation />
    </motion.div>
  )
}

function PointsAnimation() {
  const showAnimation = useEarningsStore((s) => s.showAnimation)
  const recentEarned = useEarningsStore((s) => s.recentEarned)
  const clearAnimation = useEarningsStore((s) => s.clearAnimation)

  useEffect(() => {
    if (showAnimation) {
      const t = setTimeout(clearAnimation, 2500)
      return () => clearTimeout(t)
    }
  }, [showAnimation, clearAnimation])

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -80, scale: 1.3 }}
          exit={{ opacity: 0, y: -120, scale: 0.8 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="fixed bottom-[140px] left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 shadow-2xl border border-green-300/50"
        >
          <motion.span animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 0.5, repeat: 2 }}>🪙</motion.span>
          <span className="text-xl font-extrabold text-white">+{recentEarned}</span>
          <span className="text-sm text-white/90">نقطة</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
