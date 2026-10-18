'use client'

import Image from 'next/image'
import { Play, Heart, Download } from 'lucide-react'
import { usePlayerStore, formatTime } from '@/lib/stores/player-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useNavStore } from '@/lib/stores/nav-store'
import type { ApiSong } from '@/lib/types'

export function SongCard({ song, queue, variant = 'default', showFavorite = true }: { song: ApiSong; queue?: ApiSong[]; variant?: 'default' | 'compact' | 'list'; showFavorite?: boolean }) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentId = usePlayerStore((s) => s.queue[s.currentIndex]?.id)
  const toggleFav = useLibraryStore((s) => s.toggleFavorite)
  const isFav = useLibraryStore((s) => s.favoriteIds.includes(song.id))
  const navigate = useNavStore((s) => s.navigate)

  const isActive = currentId === song.id
  const q = queue && queue.length > 0 ? queue : [song]

  const toTrack = (s: ApiSong) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, albumTitle: s.albumTitle || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, categoryId: s.categoryId || undefined, categoryName: s.categoryName || undefined, lyrics: s.lyrics || undefined, description: s.description || undefined })

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isActive) usePlayerStore.getState().togglePlay()
    else playTrack(toTrack(song), q.map(toTrack))
  }

  if (variant === 'list') {
    return (
      <div onClick={() => navigate('song', { songId: song.id })} className={`group flex items-center gap-3 rounded-2xl p-2.5 transition-all cursor-pointer tap-scale hover:bg-accent/40 ${isActive ? 'bg-accent/40 ring-1 ring-primary/30' : ''}`}>
        <button onClick={handlePlay} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted" aria-label="تشغيل">
          {song.coverUrl ? <Image src={song.coverUrl} alt={song.title} fill sizes="56px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Play className="h-5 w-5 text-primary-foreground" /></div>}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${isActive ? 'text-primary' : ''}`}>{song.title}</p>
          <p className="truncate text-xs text-muted-foreground">{song.artistName || 'فنان غير معروف'}{song.categoryName ? ` · ${song.categoryName}` : ''}</p>
        </div>
        {song.duration ? <span className="text-xs text-muted-foreground">{formatTime(song.duration)}</span> : null}
        {showFavorite && <button onClick={(e) => { e.stopPropagation(); toggleFav(song.id) }} className={`rounded-full p-1.5 tap-scale ${isFav ? 'text-red-500' : 'text-muted-foreground'}`} aria-label="مفضلة"><Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} /></button>}
        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.open(`/api/songs/${song.id}/download`, '_blank') }}
          className="rounded-full p-1.5 text-primary tap-scale hover:bg-primary/10"
          aria-label="تنزيل"
          title="تنزيل الأغنية"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div onClick={() => navigate('song', { songId: song.id })} className={`group relative shrink-0 cursor-pointer rounded-2xl p-2 transition-all tap-scale hover:bg-accent/40 ${isActive ? 'bg-accent/40 ring-1 ring-primary/30' : ''} ${variant === 'compact' ? 'w-32' : 'w-40'}`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted ambient-glow">
        {song.coverUrl ? <Image src={song.coverUrl} alt={song.title} fill sizes="(max-width:640px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Play className="h-8 w-8 text-primary-foreground" /></div>}
        <button onClick={handlePlay} className="absolute bottom-2 left-2 flex h-10 w-10 items-center justify-center rounded-full gradient-purple text-primary-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg transition-all duration-300 sm:translate-y-2 sm:group-hover:translate-y-0" aria-label="تشغيل">
          {isActive && isPlaying ? <span className="flex items-end gap-0.5 h-3">{[0,200,400].map((d) => <span key={d} className="w-0.5 h-full bg-current wave-bar" style={{ animationDelay: `${d}ms` }} />)}</span> : <Play className="h-5 w-5" fill="currentColor" />}
        </button>
        {showFavorite && <button onClick={(e) => { e.stopPropagation(); toggleFav(song.id) }} className={`absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all ${isFav ? 'text-red-500' : 'text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`} aria-label="مفضلة"><Heart className="h-4 w-4" fill={isFav ? 'currentColor' : 'none'} /></button>}
      </div>
      <div className="mt-2 px-1">
        <p className={`truncate text-sm font-semibold ${isActive ? 'text-primary' : ''}`}>{song.title}</p>
        <p className="truncate text-xs text-muted-foreground">{song.artistName || 'فنان غير معروف'}</p>
      </div>
    </div>
  )
}
