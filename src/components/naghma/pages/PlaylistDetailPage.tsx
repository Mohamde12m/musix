'use client'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Play, Shuffle, ListMusic, Trash2 } from 'lucide-react'
import { fetchPlaylist, fetchSongsByIds } from '@/lib/api-client'
import { useNavStore } from '@/lib/stores/nav-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { LoadingSpinner, EmptyState } from '@/components/naghma/common/EmptyState'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function PlaylistDetailPage() {
  const playlistId = useNavStore((s) => s.params.playlistId)
  const back = useNavStore((s) => s.back)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const localPlaylists = useLibraryStore((s) => s.playlists)
  const removeFromPlaylist = useLibraryStore((s) => s.removeFromPlaylist)
  const localPlaylist = localPlaylists.find((p) => p.id === playlistId)
  const { data: remoteData, isLoading } = useQuery({ queryKey: ['playlist', playlistId], queryFn: () => fetchPlaylist(playlistId!), enabled: !!playlistId && !localPlaylist })
  const { data: localSongs } = useQuery({ queryKey: ['songs', 'ids', localPlaylist?.songIds.join(',')], queryFn: () => fetchSongsByIds(localPlaylist?.songIds || []), enabled: !!localPlaylist && localPlaylist.songIds.length > 0 })
  if (isLoading) return <LoadingSpinner label="جارٍ تحميل القائمة" />
  const isLocal = !!localPlaylist
  const songs = isLocal ? (localSongs || []) : (remoteData?.songs || [])
  const title = isLocal ? localPlaylist!.title : remoteData?.playlist.title || 'قائمة'
  const description = isLocal ? localPlaylist!.description : remoteData?.playlist.description
  const tracks = songs.map((s) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined }))
  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>
      <div className="relative mb-4 overflow-hidden rounded-3xl gradient-purple p-6 text-center">
        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"><ListMusic className="h-10 w-10 text-white" /></div>
        <h1 className="text-2xl font-extrabold text-white">{title}</h1>{description && <p className="mt-1 text-xs text-white/80">{description}</p>}<p className="mt-2 text-xs text-white/70">{songs.length} أغنية</p>{isLocal && <p className="mt-1 text-[10px] text-white/60">قائمة محلية</p>}
      </div>
      {songs.length === 0 ? <EmptyState title="القائمة فارغة" description="أضف أغانٍ من بطاقات الأغاني." /> : (
        <>
          <div className="mb-3 flex gap-2"><Button onClick={() => playQueue(tracks, 0)} className="flex-1 rounded-full gradient-purple text-white"><Play className="h-4 w-4 ml-1" fill="currentColor" />تشغيل</Button><Button onClick={() => { toggleShuffle(); playQueue(tracks, Math.floor(Math.random() * tracks.length)) }} variant="outline" className="rounded-full"><Shuffle className="h-4 w-4 ml-1" />عشوائي</Button></div>
          <div className="space-y-1">{songs.map((s) => <div key={s.id} className="group relative"><SongCard song={s} queue={songs} variant="list" />{isLocal && <button onClick={() => { removeFromPlaylist(localPlaylist!.id, s.id); toast.success('حُذفت الأغنية') }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-destructive/20 p-1.5 text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>}</div>)}</div>
        </>
      )}
    </div>
  )
}
