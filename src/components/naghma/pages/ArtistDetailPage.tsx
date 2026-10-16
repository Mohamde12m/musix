'use client'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { ChevronRight, Play, Shuffle, Music2 } from 'lucide-react'
import { fetchArtist } from '@/lib/api-client'
import { useNavStore } from '@/lib/stores/nav-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { LoadingSpinner, EmptyState } from '@/components/naghma/common/EmptyState'
import { Button } from '@/components/ui/button'

export function ArtistDetailPage() {
  const artistId = useNavStore((s) => s.params.artistId)
  const back = useNavStore((s) => s.back)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const { data, isLoading } = useQuery({ queryKey: ['artist', artistId], queryFn: () => fetchArtist(artistId!), enabled: !!artistId })
  if (isLoading) return <LoadingSpinner label="جارٍ تحميل الفنان" />
  if (!data) return <EmptyState title="الفنان غير موجود" />
  const { artist, songs, albums } = data
  const tracks = songs.map((s) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined }))
  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>
      <div className="relative -mx-3 mb-4 overflow-hidden px-3 pb-4 pt-4">
        <div className="absolute inset-0">{artist.image && <Image src={artist.image} alt={artist.name} fill sizes="100vw" className="object-cover opacity-20 blur-xl" unoptimized />}</div>
        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-primary/30 pulse-glow">
            <Image src={artist.image || '/artists/default.png'} alt={artist.name} fill sizes="112px" className="object-cover" unoptimized />
          </div>
          <div><h1 className="text-2xl font-extrabold">{artist.name}</h1>{artist.country && <p className="text-xs text-muted-foreground">{artist.country}</p>}<p className="mt-1 text-xs text-muted-foreground">{artist.songCount} أغنية منشورة</p></div>
          {artist.bio && <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{artist.bio}</p>}
          {songs.length > 0 && <div className="flex gap-2"><Button onClick={() => playQueue(tracks, 0)} className="rounded-full gradient-purple text-white"><Play className="h-4 w-4 ml-1" fill="currentColor" />تشغيل الكل</Button><Button onClick={() => { toggleShuffle(); playQueue(tracks, Math.floor(Math.random() * tracks.length)) }} variant="outline" className="rounded-full"><Shuffle className="h-4 w-4 ml-1" />عشوائي</Button></div>}
        </div>
      </div>
      {songs.length === 0 ? <EmptyState title="لا توجد أغانٍ منشورة" /> : (
        <>
          <h3 className="mb-2 text-sm font-semibold">الأغاني</h3>
          <div className="space-y-1">{songs.map((s) => <SongCard key={s.id} song={s} queue={songs} variant="list" />)}</div>
          {albums.length > 0 && <div className="mt-6"><h3 className="mb-2 text-sm font-semibold">الألبومات ({albums.length})</h3><div className="grid grid-cols-2 gap-2">{albums.map((a) => <div key={a.id} className="rounded-2xl bg-card/40 p-2"><div className="relative aspect-square overflow-hidden rounded-xl bg-muted">{a.coverUrl ? <Image src={a.coverUrl} alt={a.title} fill sizes="150px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Music2 className="h-8 w-8 text-white" /></div>}</div><p className="mt-1.5 truncate text-xs font-semibold">{a.title}</p><p className="text-[10px] text-muted-foreground">{a.songCount} أغنية</p></div>)}</div></div>}
        </>
      )}
    </div>
  )
}
