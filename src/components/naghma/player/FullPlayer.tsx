'use client'

import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Heart, ChevronDown, MoreVertical, ListMusic, Mic2, Volume2, VolumeX, Music2 } from 'lucide-react'
import { useState } from 'react'
import { usePlayerStore, formatTime } from '@/lib/stores/player-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { motion } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export function FullPlayer() {
  const open = useNavStore((s) => s.fullPlayerOpen)
  const setOpen = useNavStore((s) => s.setFullPlayer)
  const navigate = useNavStore((s) => s.navigate)
  const queue = usePlayerStore((s) => s.queue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const isLoading = usePlayerStore((s) => s.isLoading)
  const error = usePlayerStore((s) => s.error)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const next = usePlayerStore((s) => s.next)
  const prev = usePlayerStore((s) => s.prev)
  const seek = usePlayerStore((s) => s.seek)
  const setVolume = usePlayerStore((s) => s.setVolume)
  const toggleMute = usePlayerStore((s) => s.toggleMute)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat)
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue)
  const toggleFav = useLibraryStore((s) => s.toggleFavorite)
  const favIds = useLibraryStore((s) => s.favoriteIds)
  const [showQueue, setShowQueue] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)

  const track = queue[currentIndex]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="h-[100dvh] max-h-[100dvh] overflow-hidden border-0 p-0" style={{ background: 'linear-gradient(180deg, oklch(0.04 0.02 290), var(--background) 40%)' }}>
        <SheetHeader className="sr-only"><SheetTitle>{track?.title || 'المشغل'}</SheetTitle><SheetDescription>مشغل موسيقى MusiX</SheetDescription></SheetHeader>
        <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-2">
          <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/50 text-foreground tap-scale" aria-label="إغلاق"><ChevronDown className="h-5 w-5" /></button>
          <div className="text-center"><p className="text-[10px] text-muted-foreground">{showQueue ? 'قائمة الانتظار' : showLyrics ? 'الكلمات' : 'قيد التشغيل'}</p></div>
          <button onClick={() => track && navigate('song', { songId: track.id })} className="flex h-10 w-10 items-center justify-center rounded-full bg-card/50 text-foreground tap-scale" aria-label="تفاصيل"><MoreVertical className="h-5 w-5" /></button>
        </div>
        {!track ? (
          <div className="flex h-[80%] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-purple"><ListMusic className="h-10 w-10 text-white" /></div>
            <p className="text-sm font-semibold">لا توجد أغانٍ في قائمة الانتظار</p>
          </div>
        ) : showQueue ? (
          <div className="flex h-full flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <div className="flex items-center justify-between py-2"><h3 className="text-sm font-bold">قائمة الانتظار ({queue.length})</h3><button onClick={() => setShowQueue(false)} className="text-xs text-muted-foreground">إغلاق</button></div>
            <div className="custom-scroll flex-1 overflow-y-auto">
              {queue.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">القائمة فارغة</p> : (
                <div className="space-y-1">
                  {queue.map((t, i) => (
                    <div key={t.id + i} className={`group flex items-center gap-2 rounded-xl p-2 transition-colors ${i === currentIndex ? 'bg-primary/15' : 'hover:bg-accent/40'}`}>
                      <button onClick={() => { usePlayerStore.getState().playQueue(queue, i); setShowQueue(false) }} className="flex min-w-0 flex-1 items-center gap-2 text-right">
                        <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">{t.coverUrl ? <Image src={t.coverUrl} alt="" fill sizes="40px" className="object-cover" unoptimized /> : null}</div>
                        <div className="min-w-0 flex-1"><p className={`truncate text-xs font-semibold ${i === currentIndex ? 'text-primary' : ''}`}>{t.title}</p><p className="truncate text-[10px] text-muted-foreground">{t.artistName}</p></div>
                      </button>
                      <button onClick={() => removeFromQueue(i)} className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive" aria-label="حذف"><span className="text-lg leading-none">×</span></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : showLyrics ? (
          <div className="flex h-full flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <div className="flex items-center justify-between py-2"><h3 className="text-sm font-bold">كلمات الأغنية</h3><button onClick={() => setShowLyrics(false)} className="text-xs text-muted-foreground">إغلاق</button></div>
            <div className="custom-scroll flex-1 overflow-y-auto whitespace-pre-line py-4 text-center text-sm leading-relaxed">{track.lyrics || 'لا تتوفر كلمات لهذه الأغنية'}</div>
          </div>
        ) : (
          <div className="flex h-[calc(100%-60px)] flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <div className="relative flex-1 flex items-center justify-center">
              <div className="relative aspect-square w-full max-w-[min(80vw,360px)] overflow-hidden rounded-3xl ambient-glow pulse-glow">
                {track.coverUrl ? <Image src={track.coverUrl} alt={track.title} fill sizes="360px" className={`object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`} unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Play className="h-20 w-20 text-white" fill="currentColor" /></div>}
                {isPlaying && <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/40 to-transparent p-6"><div className="flex items-end gap-1 h-12">{Array.from({ length: 24 }).map((_, i) => <span key={i} className="w-1 rounded-full bg-white/80 wave-bar" style={{ animationDelay: `${i * 60}ms`, height: `${30 + Math.sin(i) * 30 + 30}%` }} />)}</div></div>}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-2 py-3">
              <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-bold">{track.title}</h1><button onClick={() => { if (track.artistId) { setOpen(false); navigate('artist', { artistId: track.artistId }) } }} className="truncate text-sm text-muted-foreground hover:text-primary" disabled={!track.artistId}>{track.artistName || 'فنان غير معروف'}</button></div>
              <button onClick={() => toggleFav(track.id)} className={`flex h-10 w-10 items-center justify-center rounded-full tap-scale ${favIds.includes(track.id) ? 'text-red-500' : 'text-muted-foreground'}`} aria-label="مفضلة"><Heart className="h-6 w-6" fill={favIds.includes(track.id) ? 'currentColor' : 'none'} /></button>
            </div>
            <div className="px-2">
              <Slider value={[currentTime]} max={duration || 0} step={1} onValueChange={(v) => seek(v[0])} className="cursor-pointer" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
            </div>
            {error && <div className="mt-2 flex items-center gap-2 rounded-xl bg-destructive/10 p-2 text-xs text-destructive"><span className="flex-1">{error}</span><button onClick={() => { usePlayerStore.getState().setError(null); usePlayerStore.getState().play() }} className="rounded-full bg-destructive/20 px-2 py-1 tap-scale">إعادة</button></div>}
            <div className="flex items-center justify-between gap-2 px-2 py-3">
              <button onClick={toggleShuffle} className={`rounded-full p-2 tap-scale ${shuffle ? 'text-primary' : 'text-muted-foreground'}`} aria-label="عشوائي"><Shuffle className="h-5 w-5" /></button>
              <button onClick={prev} className="rounded-full p-2 tap-scale hover:bg-accent" aria-label="السابقة"><SkipBack className="h-7 w-7" fill="currentColor" /></button>
              <button onClick={togglePlay} className="flex h-16 w-16 items-center justify-center rounded-full gradient-purple text-white shadow-2xl tap-scale glow-purple" aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
                {isLoading ? <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent" /> : isPlaying ? <Pause className="h-7 w-7" fill="currentColor" /> : <Play className="h-7 w-7 mr-1" fill="currentColor" />}
              </button>
              <button onClick={() => next(false)} className="rounded-full p-2 tap-scale hover:bg-accent" aria-label="التالية"><SkipForward className="h-7 w-7" fill="currentColor" /></button>
              <button onClick={cycleRepeat} className={`rounded-full p-2 tap-scale ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground'}`} aria-label="تكرار">{repeat === 'one' ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}</button>
            </div>
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="flex items-center gap-2 flex-1">
                <button onClick={toggleMute} className="rounded-full p-1.5 text-muted-foreground tap-scale" aria-label={muted ? 'تشغيل' : 'كتم'}>{muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
                <Slider value={[muted ? 0 : volume * 100]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} className="flex-1 max-w-[140px]" />
              </div>
              <div className="flex items-center gap-1">
                {track.lyrics && <button onClick={() => setShowLyrics(true)} className="rounded-full p-2 text-muted-foreground tap-scale hover:text-primary" aria-label="الكلمات"><Mic2 className="h-5 w-5" /></button>}
                <button onClick={() => setShowQueue(true)} className="rounded-full p-2 text-muted-foreground tap-scale hover:text-primary" aria-label="قائمة الانتظار"><ListMusic className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
