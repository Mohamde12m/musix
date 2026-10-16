'use client'
import { useQuery } from '@tanstack/react-query'
import { Heart, Trash2, Shuffle, Play } from 'lucide-react'
import { fetchSongsByIds } from '@/lib/api-client'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { EmptyState, LoadingSpinner } from '@/components/naghma/common/EmptyState'
import { useLibraryStore } from '@/lib/stores/library-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function FavoritesPage() {
  const favIds = useLibraryStore((s) => s.favoriteIds)
  const clearFavorites = useLibraryStore((s) => s.clearFavorites)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const navigate = useNavStore((s) => s.navigate)
  const { data: songs, isLoading } = useQuery({ queryKey: ['favorites', favIds.join(',')], queryFn: () => fetchSongsByIds(favIds), enabled: favIds.length > 0 })

  const playAll = (shuffle: boolean) => {
    if (!songs?.length) return
    const tracks = songs.map((s) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined }))
    if (shuffle) { toggleShuffle(); playQueue(tracks, Math.floor(Math.random() * tracks.length)) }
    else playQueue(tracks, 0)
  }

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold gradient-purple-text flex items-center gap-2"><Heart className="h-6 w-6 text-red-500" fill="currentColor" />المفضلة</h1><p className="text-xs text-muted-foreground">{favIds.length} أغنية محفوظة محليًا</p></div>
        {favIds.length > 0 && <Button variant="ghost" size="sm" onClick={() => { if (confirm('مسح كل المفضلة؟')) { clearFavorites(); toast.success('تم مسح المفضلة') } }} className="text-destructive"><Trash2 className="h-4 w-4 ml-1" />مسح</Button>}
      </header>
      {favIds.length === 0 ? (
        <EmptyState title="لا توجد أغانٍ في مفضلتك" description="اضغط على أي قلب بجانب الأغنية لإضافتها هنا." icon={<Heart className="h-8 w-8" />} action={<button onClick={() => navigate('home')} className="mt-2 rounded-full gradient-purple px-4 py-2 text-sm font-semibold text-white">تصفّح الأغاني</button>} />
      ) : isLoading ? <LoadingSpinner label="جارٍ تحميل المفضلة" /> : (
        <>
          <div className="mb-4 flex gap-2">
            <Button onClick={() => playAll(false)} className="flex-1 rounded-full gradient-purple text-white"><Play className="h-4 w-4 ml-1" fill="currentColor" />تشغيل الكل</Button>
            <Button onClick={() => playAll(true)} variant="outline" className="rounded-full"><Shuffle className="h-4 w-4 ml-1" />عشوائي</Button>
          </div>
          <div className="space-y-1">{songs?.map((s) => <SongCard key={s.id} song={s} queue={songs} variant="list" />)}</div>
        </>
      )}
    </div>
  )
}
