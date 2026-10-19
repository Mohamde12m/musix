'use client'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Play, Pause, Heart, Share2, ChevronRight, Music2, Clock, ListMusic, Disc3, AlertCircle } from 'lucide-react'
import { fetchSong, fetchSongs } from '@/lib/api-client'
import { useNavStore } from '@/lib/stores/nav-store'
import { usePlayerStore, formatTime } from '@/lib/stores/player-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { LoadingSpinner, EmptyState } from '@/components/naghma/common/EmptyState'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export function SongDetailPage() {
  const songId = useNavStore((s) => s.params.songId)
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentId = usePlayerStore((s) => s.queue[s.currentIndex]?.id)
  const toggleFav = useLibraryStore((s) => s.toggleFavorite)
  const isFav = useLibraryStore((s) => s.favoriteIds.includes(songId || ''))
  const { data: song, isLoading } = useQuery({ queryKey: ['song', songId], queryFn: () => fetchSong(songId!), enabled: !!songId })
  const { data: related } = useQuery({ queryKey: ['songs', 'related', song?.categoryId], queryFn: () => fetchSongs({ categoryId: song?.categoryId, limit: 12 }), enabled: !!song?.categoryId })
  if (isLoading) return <LoadingSpinner label="جارٍ تحميل الأغنية" />
  if (!song) return <EmptyState title="الأغنية غير موجودة" action={<Button onClick={back}>العودة</Button>} />
  const isActive = currentId === song.id
  const handlePlay = () => {
    if (isActive) togglePlay()
    else playTrack({ id: song.id, title: song.title, artistName: song.artistName || undefined, artistId: song.artistId || undefined, audioUrl: song.audioUrl, coverUrl: song.coverUrl || undefined, duration: song.duration || undefined, lyrics: song.lyrics || undefined }, related ? related.filter(s => s.id !== song.id).concat(song).map(s => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined })).slice(0, 12) : [song].map(s => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined })))
  }
  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl ambient-glow">
          {song.coverUrl ? <Image src={song.coverUrl} alt={song.title} fill sizes="320px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Music2 className="h-16 w-16 text-white" /></div>}
        </div>
        <div className="mt-4 text-center"><h1 className="text-2xl font-extrabold">{song.title}</h1>{song.artistName && <button onClick={() => song.artistId && navigate('artist', { artistId: song.artistId })} className="text-sm text-primary hover:underline" disabled={!song.artistId}>{song.artistName}</button>}</div>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button onClick={() => toggleFav(song.id)} className="flex h-11 w-11 items-center justify-center rounded-full bg-card/60 tap-scale" aria-label="مفضلة"><Heart className={`h-5 w-5 ${isFav ? 'text-red-500' : 'text-muted-foreground'}`} fill={isFav ? 'currentColor' : 'none'} /></button>
          <button onClick={handlePlay} className="flex h-14 w-14 items-center justify-center rounded-full gradient-purple text-white shadow-2xl tap-scale glow-purple" aria-label="تشغيل">{isActive && isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6 mr-0.5" fill="currentColor" />}</button>
          <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/?song=${song.id}`); toast.success('تم نسخ الرابط') }} className="flex h-11 w-11 items-center justify-center rounded-full bg-card/60 tap-scale" aria-label="مشاركة"><Share2 className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          {song.categoryName && <button onClick={() => song.categoryId && navigate('category', { categoryId: song.categoryId })} className="flex items-center gap-2 rounded-xl bg-card/40 p-2.5 text-right tap-scale"><Disc3 className="h-4 w-4 text-primary" /><div><p className="text-[10px] text-muted-foreground">التصنيف</p><p className="font-semibold">{song.categoryName}</p></div></button>}
          {song.duration && <div className="flex items-center gap-2 rounded-xl bg-card/40 p-2.5"><Clock className="h-4 w-4 text-primary" /><div><p className="text-[10px] text-muted-foreground">المدة</p><p className="font-semibold">{formatTime(song.duration)}</p></div></div>}
          {song.playCount > 0 && <div className="flex items-center gap-2 rounded-xl bg-card/40 p-2.5"><ListMusic className="h-4 w-4 text-primary" /><div><p className="text-[10px] text-muted-foreground">الاستماعات</p><p className="font-semibold">{song.playCount}</p></div></div>}
        </div>
        {song.description && <div className="mt-4"><h3 className="mb-1 text-sm font-semibold">عن الأغنية</h3><p className="text-xs leading-relaxed text-muted-foreground">{song.description}</p></div>}
        {song.lyrics && <div className="mt-4 rounded-2xl bg-card/40 p-3"><h3 className="mb-2 text-sm font-semibold">كلمات الأغنية</h3><p className="custom-scroll max-h-60 overflow-y-auto whitespace-pre-line text-xs leading-relaxed">{song.lyrics}</p></div>}
        {song.keywords.length > 0 && <div className="mt-4"><h3 className="mb-2 text-sm font-semibold">الكلمات المفتاحية</h3><div className="flex flex-wrap gap-1.5">{song.keywords.map((k) => <span key={k} className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] text-primary">#{k}</span>)}</div></div>}
        {song.rights && <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/40 p-2 text-[10px] text-muted-foreground"><AlertCircle className="h-3.5 w-3.5" />{song.rights}</div>}
        {related && related.filter(s => s.id !== song.id).length > 0 && <div className="mt-6"><h3 className="mb-2 text-sm font-semibold">أغانٍ ذات صلة</h3><div className="space-y-1">{related.filter(s => s.id !== song.id).slice(0, 10).map((s) => <SongCard key={s.id} song={s} queue={related} variant="list" />)}</div></div>}
      </motion.div>
    </div>
  )
}
