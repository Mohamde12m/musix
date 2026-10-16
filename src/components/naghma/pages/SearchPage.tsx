'use client'
import { useState, useEffect } from 'react'
import { Search, X, Clock, Filter, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchSongs, fetchCategories, fetchArtists } from '@/lib/api-client'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { CategoryCard } from '@/components/naghma/cards/CategoryCard'
import { ArtistCard } from '@/components/naghma/cards/ArtistCard'
import { HScroll, EmptyState, LoadingSpinner } from '@/components/naghma/common/EmptyState'
import { SectionHeader } from '@/components/naghma/common/SectionHeader'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SearchPage() {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [sort, setSort] = useState<'latest' | 'popular' | 'title'>('latest')
  const [catFilter, setCatFilter] = useState<string>('all')
  const recent = useLibraryStore((s) => s.recentSearches)
  const addRecent = useLibraryStore((s) => s.addRecentSearch)
  const clearRecent = useLibraryStore((s) => s.clearRecentSearches)
  const navigate = useNavStore((s) => s.navigate)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350)
    return () => clearTimeout(t)
  }, [q])

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 300000 })
  const { data: artists } = useQuery({ queryKey: ['artists'], queryFn: fetchArtists, staleTime: 300000 })
  const { data: results, isLoading } = useQuery({ queryKey: ['search', debounced, sort, catFilter], queryFn: () => fetchSongs({ query: debounced || undefined, sort, categoryId: catFilter !== 'all' ? catFilter : undefined, limit: 60 }) })

  const submitSearch = (term: string) => { setQ(term); if (term.trim()) addRecent(term.trim()) }

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-4"><h1 className="text-2xl font-extrabold gradient-purple-text">البحث</h1><p className="text-xs text-muted-foreground">ابحث عن أغانٍ وفنانين وتصنيفات</p></header>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} onBlur={() => { if (q.trim()) addRecent(q.trim()) }} placeholder="اكتب اسم الأغنية أو الفنان..." className="h-12 rounded-2xl glass border-border/40 pr-10 text-base" />
        {q && <button onClick={() => setQ('')} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-muted p-1 tap-scale" aria-label="مسح"><X className="h-4 w-4" /></button>}
      </div>
      {!debounced && (
        <section className="mb-6">
          {recent.length > 0 && (
            <div className="mb-4"><div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-1.5 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" />عمليات البحث الأخيرة</h3><button onClick={clearRecent} className="text-xs text-muted-foreground hover:text-destructive">مسح الكل</button></div><div className="flex flex-wrap gap-2">{recent.map((r) => <button key={r} onClick={() => submitSearch(r)} className="rounded-full border border-border/40 px-3 py-1.5 text-xs tap-scale hover:bg-accent">{r}</button>)}</div></div>
          )}
          {categories?.length ? <section className="mb-6"><SectionHeader title="تصفّح التصنيفات" /><HScroll>{categories.map((c) => <CategoryCard key={c.id} category={c} />)}</HScroll></section> : null}
          {artists?.length ? <section><SectionHeader title="الفنانون" onSeeAll={() => navigate('discover')} /><HScroll>{artists.slice(0, 12).map((a) => <ArtistCard key={a.id} artist={a} />)}</HScroll></section> : null}
          <EmptyState title="ابدأ البحث" description="اكتب كلمة للبحث في الأغاني والفنانين والتصنيفات" icon={<Sparkles className="h-8 w-8" />} />
        </section>
      )}
      {debounced && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <Select value={catFilter} onValueChange={setCatFilter}><SelectTrigger className="h-9 w-32 rounded-full text-xs"><Filter className="h-3.5 w-3.5 ml-1" /><SelectValue placeholder="التصنيف" /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <Select value={sort} onValueChange={(v: any) => setSort(v)}><SelectTrigger className="h-9 w-32 rounded-full text-xs"><SelectValue placeholder="ترتيب" /></SelectTrigger><SelectContent><SelectItem value="latest">الأحدث</SelectItem><SelectItem value="popular">الأكثر استماعًا</SelectItem><SelectItem value="title">حسب الاسم</SelectItem></SelectContent></Select>
          </div>
          <div className="mb-2 text-xs text-muted-foreground">{isLoading ? 'جارٍ البحث...' : `${results?.length || 0} نتيجة`}</div>
          {isLoading ? <LoadingSpinner label="جارٍ البحث" /> : results?.length ? <div className="space-y-1">{results.map((s) => <SongCard key={s.id} song={s} queue={results} variant="list" />)}</div> : <EmptyState title="لا توجد نتائج" description="لم نجد نتائج مطابقة." action={<button onClick={() => { setQ(''); setCatFilter('all') }} className="mt-2 rounded-full gradient-purple px-4 py-2 text-sm font-semibold text-white">مسح البحث</button>} />}
        </>
      )}
    </div>
  )
}
