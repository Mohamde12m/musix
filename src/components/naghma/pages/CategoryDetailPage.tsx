'use client'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { ChevronRight, Play, Shuffle } from 'lucide-react'
import { fetchCategory } from '@/lib/api-client'
import { useNavStore } from '@/lib/stores/nav-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { LoadingSpinner, EmptyState } from '@/components/naghma/common/EmptyState'
import { Button } from '@/components/ui/button'

export function CategoryDetailPage() {
  const categoryId = useNavStore((s) => s.params.categoryId)
  const back = useNavStore((s) => s.back)
  const playQueue = usePlayerStore((s) => s.playQueue)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const { data, isLoading } = useQuery({ queryKey: ['category', categoryId], queryFn: () => fetchCategory(categoryId!), enabled: !!categoryId })
  if (isLoading) return <LoadingSpinner label="جارٍ تحميل التصنيف" />
  if (!data) return <EmptyState title="التصنيف غير موجود" />
  const { category, songs } = data
  const tracks = songs.map((s) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined }))
  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>
      <div className="relative mb-4 overflow-hidden rounded-3xl p-6 text-center">
        {category.image ? <Image src={category.image} alt={category.name} fill sizes="(max-width:640px) 100vw, 600px" className="object-cover scale-110 transition-transform duration-500" unoptimized priority /> : <div className="absolute inset-0 gradient-purple" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        <div className="relative"><h1 className="text-2xl font-extrabold text-white drop-shadow-lg">{category.name}</h1>{category.description && <p className="mt-1 text-xs text-white/90 drop-shadow">{category.description}</p>}<p className="mt-2 text-xs text-white/80 drop-shadow">{category.songCount} أغنية</p></div>
      </div>
      {songs.length === 0 ? <EmptyState title="لا توجد أغانٍ" description="لم تُضَف أغانٍ لهذا التصنيف بعد." /> : (
        <>
          <div className="mb-3 flex gap-2"><Button onClick={() => playQueue(tracks, 0)} className="flex-1 rounded-full gradient-purple text-white"><Play className="h-4 w-4 ml-1" fill="currentColor" />تشغيل الكل</Button><Button onClick={() => { toggleShuffle(); playQueue(tracks, Math.floor(Math.random() * tracks.length)) }} variant="outline" className="rounded-full"><Shuffle className="h-4 w-4 ml-1" />عشوائي</Button></div>
          <div className="space-y-1">{songs.map((s) => <SongCard key={s.id} song={s} queue={songs} variant="list" />)}</div>
        </>
      )}
    </div>
  )
}
