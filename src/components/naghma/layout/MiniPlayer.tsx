'use client'

import Image from 'next/image'
import { Play, Pause, SkipForward, Heart, AlertCircle, RotateCw } from 'lucide-react'
import { usePlayerStore, formatTime } from '@/lib/stores/player-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { motion } from 'framer-motion'

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
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed bottom-[64px] inset-x-0 z-30 px-2 safe-bottom">
      <div className="mx-auto max-w-md">
        <div className="glass-strong overflow-hidden rounded-2xl border border-border/40 shadow-xl">
          <div className="h-0.5 w-full bg-muted/50"><div className="h-full gradient-purple transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
          {error ? (
            <div className="flex items-center gap-2 p-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="flex-1 truncate text-xs text-destructive">{error}</p>
              <button onClick={() => { usePlayerStore.getState().setError(null); usePlayerStore.getState().play() }} className="rounded-full bg-primary/15 p-2 text-primary tap-scale" aria-label="إعادة المحاولة"><RotateCw className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-2">
              <button onClick={() => setFullPlayer(true)} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted tap-scale" aria-label="فتح المشغل الكامل">
                {track.coverUrl ? <Image src={track.coverUrl} alt={track.title} fill sizes="48px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Play className="h-5 w-5 text-white" fill="currentColor" /></div>}
                {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>}
              </button>
              <button onClick={() => setFullPlayer(true)} className="min-w-0 flex-1 text-right"><p className="truncate text-xs font-semibold leading-tight">{track.title}</p><p className="truncate text-[10px] text-muted-foreground">{track.artistName || 'فنان غير معروف'}</p></button>
              {isPlaying && !isLoading && <div className="flex items-end gap-0.5 h-4">{[0,150,300,450].map((d) => <span key={d} className="w-0.5 h-full gradient-purple wave-bar" style={{ animationDelay: `${d}ms` }} />)}</div>}
              <div className="flex items-center gap-1">
                <button onClick={() => toggleFav(track.id)} className={`rounded-full p-2 tap-scale ${isFav ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`} aria-label="مفضلة"><Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} /></button>
                <button onClick={() => togglePlay()} className="flex h-9 w-9 items-center justify-center rounded-full gradient-purple text-white shadow-lg tap-scale" aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
                  {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="h-4 w-4 mr-0.5" fill="currentColor" />}
                </button>
                <button onClick={() => next(false)} className="rounded-full p-2 text-foreground/80 tap-scale hover:bg-accent" aria-label="التالية"><SkipForward className="h-4 w-4" fill="currentColor" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
