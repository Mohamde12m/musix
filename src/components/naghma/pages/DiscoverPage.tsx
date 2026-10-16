'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Compass, TrendingUp, Clock, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchSongs, fetchCategories, fetchArtists } from '@/lib/api-client'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { CategoryCard } from '@/components/naghma/cards/CategoryCard'
import { ArtistCard } from '@/components/naghma/cards/ArtistCard'
import { HScroll, EmptyState } from '@/components/naghma/common/EmptyState'
import { SectionHeader } from '@/components/naghma/common/SectionHeader'
import { useNavStore } from '@/lib/stores/nav-store'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DiscoverPage() {
  const navigate = useNavStore((s) => s.navigate)
  const [tab, setTab] = useState('all')
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 300000 })
  const { data: artists } = useQuery({ queryKey: ['artists'], queryFn: fetchArtists, staleTime: 300000 })
  const { data: latest } = useQuery({ queryKey: ['songs', 'latest', '60'], queryFn: () => fetchSongs({ sort: 'latest', limit: 60 }) })
  const { data: popular } = useQuery({ queryKey: ['songs', 'popular', '60'], queryFn: () => fetchSongs({ sort: 'popular', limit: 60 }) })

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-4"><h1 className="text-2xl font-extrabold gradient-purple-text">اكتشف</h1><p className="text-xs text-muted-foreground">استكشف الموسيقى والفنانين والتصنيفات</p></header>
      <Tabs value={tab} onValueChange={setTab} className="mb-4"><TabsList className="w-full justify-start overflow-x-auto no-scrollbar h-auto"><TabsTrigger value="all" className="rounded-full">الكل</TabsTrigger><TabsTrigger value="cats" className="rounded-full">التصنيفات</TabsTrigger><TabsTrigger value="artists" className="rounded-full">الفنانون</TabsTrigger><TabsTrigger value="latest" className="rounded-full">الأحدث</TabsTrigger><TabsTrigger value="popular" className="rounded-full">الأكثر استماعًا</TabsTrigger></TabsList></Tabs>
      {tab === 'all' && (
        <div className="space-y-6">
          {categories?.length ? <section><SectionHeader title="التصنيفات" /><HScroll>{categories.map((c) => <CategoryCard key={c.id} category={c} />)}</HScroll></section> : null}
          {artists?.length ? <section><SectionHeader title="الفنانون" onSeeAll={() => setTab('artists')} /><HScroll>{artists.slice(0, 12).map((a) => <ArtistCard key={a.id} artist={a} />)}</HScroll></section> : null}
          {latest?.length ? <section><SectionHeader title="الأحدث" icon={<Clock className="h-4 w-4 text-primary" />} onSeeAll={() => setTab('latest')} /><HScroll>{latest.slice(0, 12).map((s) => <SongCard key={s.id} song={s} queue={latest.slice(0,12)} />)}</HScroll></section> : null}
          {popular?.length ? <section><SectionHeader title="الأكثر استماعًا" icon={<TrendingUp className="h-4 w-4 text-primary" />} onSeeAll={() => setTab('popular')} /><HScroll>{popular.slice(0, 12).map((s) => <SongCard key={s.id} song={s} queue={popular.slice(0,12)} />)}</HScroll></section> : null}
          <button onClick={() => navigate('assistant')} className="w-full rounded-2xl gradient-purple p-4 text-center text-white tap-scale"><Sparkles className="mx-auto h-6 w-6 mb-1" /><p className="text-sm font-bold">اسأل مساعد MusiX الذكي</p></button>
        </div>
      )}
      {tab === 'cats' && categories?.length ? (
        <div className="grid grid-cols-2 gap-2">{categories.map((c) => <button key={c.id} onClick={() => navigate('category', { categoryId: c.id })} className="group relative h-24 overflow-hidden rounded-2xl text-right tap-scale ring-1 ring-border/30">{c.image ? <Image src={c.image} alt={c.name} fill sizes="(max-width:640px) 50vw, 200px" className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized /> : <div className="absolute inset-0 gradient-purple" />}<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" /><div className="relative flex h-full flex-col justify-end p-3"><p className="text-sm font-bold text-white drop-shadow-md line-clamp-1">{c.name}</p><p className="text-[10px] text-white/85 drop-shadow">{c.songCount} أغنية</p></div></button>)}</div>
      ) : tab === 'cats' ? <EmptyState title="لا توجد تصنيفات" /> : null}
      {tab === 'artists' && artists?.length ? <div className="grid grid-cols-3 gap-2">{artists.map((a) => <ArtistCard key={a.id} artist={a} variant="compact" />)}</div> : tab === 'artists' ? <EmptyState title="لا يوجد فنانون" /> : null}
      {tab === 'latest' && latest?.length ? <div className="space-y-1">{latest.map((s) => <SongCard key={s.id} song={s} queue={latest} variant="list" />)}</div> : tab === 'latest' ? <EmptyState title="لا توجد أغانٍ" /> : null}
      {tab === 'popular' && popular?.length ? <div className="space-y-1">{popular.map((s) => <SongCard key={s.id} song={s} queue={popular} variant="list" />)}</div> : tab === 'popular' ? <EmptyState title="لا توجد أغانٍ" /> : null}
    </div>
  )
}
