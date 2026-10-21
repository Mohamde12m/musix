'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { Play, Heart, Bell, Search, Sparkles, TrendingUp, Clock, Zap, Wallet } from 'lucide-react'
import { fetchHomeData, fetchSocialLinks } from '@/lib/api-client'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { ArtistCard } from '@/components/naghma/cards/ArtistCard'
import { CategoryCard } from '@/components/naghma/cards/CategoryCard'
import { SectionHeader } from '@/components/naghma/common/SectionHeader'
import { HScroll } from '@/components/naghma/common/EmptyState'
import { EmptyState, SkeletonCard } from '@/components/naghma/common/EmptyState'
import { AdBanner } from '@/components/naghma/common/AdBanner'
import { UnityBannerAd } from '@/components/naghma/common/UnityAds'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function HomePage() {
  const { data, isLoading } = useQuery({ queryKey: ['home'], queryFn: fetchHomeData, staleTime: 60_000 })
  // جلب إعدادات Unity Ads من API
  const { data: socialLinks } = useQuery({ queryKey: ['social-links'], queryFn: fetchSocialLinks, staleTime: 5 * 60_000 })
  const unityAdsConfig = socialLinks?.unityAds
  const navigate = useNavStore((s) => s.navigate)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const toggleFav = useLibraryStore((s) => s.toggleFavorite)
  const favIds = useLibraryStore((s) => s.favoriteIds)
  const [featuredIdx, setFeaturedIdx] = useState(0)
  const featured = data?.featured || []
  const hero = featured[featuredIdx]

  const toTrack = (s: any) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, categoryName: s.categoryName || undefined, categoryId: s.categoryId || undefined, lyrics: s.lyrics || undefined })

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-lg ring-1 ring-primary/30">
            <Image src="/icon.jpg" alt="MusiX" fill sizes="36px" className="object-cover" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">أهلًا بك في</p>
            <h1 className="text-lg font-extrabold gradient-purple-text leading-tight">MusiX</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => navigate('search')} className="flex h-9 w-9 items-center justify-center rounded-full glass tap-scale" aria-label="بحث"><Search className="h-4 w-4" /></button>
          <button onClick={() => toast('لا توجد إشعارات جديدة')} className="relative flex h-9 w-9 items-center justify-center rounded-full glass tap-scale" aria-label="الإشعارات"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" /></button>
          <button onClick={() => navigate('profile')} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full gradient-purple text-white text-xs font-bold" aria-label="حسابي">زائر</button>
        </div>
      </header>

      {/* بانر استمع واربح */}
      <button
        onClick={() => navigate('profile')}
        className="relative mb-4 flex w-full items-center gap-3 overflow-hidden rounded-2xl p-3 text-right tap-scale"
        style={{ background: 'linear-gradient(135deg, oklch(0.35 0.2 145 / 0.3), oklch(0.3 0.15 295 / 0.3))' }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 pulse-glow">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">استمع واربح 💰</p>
          <p className="text-[10px] text-white/80">5 نقاط لكل أغنية — حولها إلى دراهم!</p>
        </div>
        <span className="text-xs font-bold text-green-400">ابدأ ←</span>
        {/* عملات متحركة في الخلفية */}
        <span className="absolute right-20 top-0 text-xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>🪙</span>
        <span className="absolute right-32 top-2 text-lg opacity-15 animate-bounce" style={{ animationDelay: '0.3s' }}>💰</span>
        <span className="absolute right-44 top-0 text-base opacity-10 animate-bounce" style={{ animationDelay: '0.6s' }}>🪙</span>
      </button>

      {/* إعلان */}
      <AdBanner position="home" />

      {isLoading ? (
        <div className="space-y-8">
          <div className="h-52 animate-pulse rounded-3xl bg-muted" />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : !data || (data.featured.length === 0 && data.latest.length === 0) ? (
        <EmptyState title="لا توجد أغانٍ بعد" description="ستظهر الأغاني هنا فور إضافتها من لوحة الإدارة." />
      ) : (
        <div className="space-y-6">
          {hero && (
            <motion.div key={hero.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative overflow-hidden rounded-3xl border border-border/30">
              <div className="relative h-52 sm:h-60">
                <Image src={hero.coverUrl || '/icon.jpg'} alt={hero.title} fill sizes="(max-width:640px) 100vw, 600px" className="object-cover scale-110 transition-transform duration-1000" unoptimized priority loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute -bottom-10 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" />
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold text-primary-foreground backdrop-blur"><Sparkles className="h-3 w-3" />مميزة</span>
                    {featured.length > 1 && <div className="flex gap-1">{featured.slice(0, 5).map((_, i) => <button key={i} onClick={() => setFeaturedIdx(i)} className={`h-1.5 rounded-full transition-all ${i === featuredIdx ? 'w-5 bg-primary' : 'w-1.5 bg-white/40'}`} />)}</div>}
                  </div>
                  <div>
                    <p className="text-[10px] text-white/70">{hero.categoryName}</p>
                    <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">{hero.title}</h2>
                    <p className="text-sm text-white/80">{hero.artistName || 'فنان غير معروف'}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => playTrack(toTrack(hero), featured.map(toTrack))} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black tap-scale"><Play className="h-4 w-4" fill="currentColor" />تشغيل</button>
                      <button onClick={() => toggleFav(hero.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur tap-scale" aria-label="مفضلة"><Heart className={`h-5 w-5 ${favIds.includes(hero.id) ? 'text-red-500' : 'text-white'}`} fill={favIds.includes(hero.id) ? 'currentColor' : 'none'} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {data.categories.length > 0 && (
            <section>
              <SectionHeader title="التصنيفات" subtitle="تصفّح حسب النوع" />
              <HScroll>{data.categories.map((c) => <CategoryCard key={c.id} category={c} />)}</HScroll>
            </section>
          )}

          {data.byCategory.map((sec) => (
            <section key={sec.category.id}>
              <SectionHeader title={sec.category.name} subtitle={`${sec.category.songCount} أغنية`} onSeeAll={() => navigate('category', { categoryId: sec.category.id })} />
              <HScroll>{sec.songs.map((s) => <SongCard key={s.id} song={s} queue={sec.songs} />)}</HScroll>
            </section>
          ))}

          {/* بانر Unity Ads */}
          {unityAdsConfig && <UnityBannerAd config={unityAdsConfig} />}

          {data.mostPlayed.length > 0 && (
            <section>
              <SectionHeader title="الأكثر استماعًا" icon={<TrendingUp className="h-5 w-5 text-primary" />} onSeeAll={() => navigate('discover')} />
              <HScroll>{data.mostPlayed.map((s) => <SongCard key={s.id} song={s} queue={data.mostPlayed} />)}</HScroll>
            </section>
          )}

          {data.latest.length > 0 && (
            <section>
              <SectionHeader title="أغانٍ جديدة" icon={<Clock className="h-5 w-5 text-primary" />} onSeeAll={() => navigate('discover')} />
              <HScroll>{data.latest.map((s) => <SongCard key={s.id} song={s} queue={data.latest} />)}</HScroll>
            </section>
          )}

          {data.featured.length > 0 && (
            <section>
              <SectionHeader title="اقتراحات لك" icon={<Zap className="h-5 w-5 text-primary" />} />
              <HScroll>{data.featured.map((s) => <SongCard key={s.id} song={s} queue={data.featured} />)}</HScroll>
            </section>
          )}

          {data.artists.length > 0 && (
            <section>
              <SectionHeader title="فنانون مميزون" onSeeAll={() => navigate('discover')} />
              <HScroll>{data.artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</HScroll>
            </section>
          )}

          <button onClick={() => navigate('assistant')} className="relative w-full overflow-hidden rounded-3xl p-4 text-right tap-scale" style={{ background: 'linear-gradient(135deg, oklch(0.3 0.15 295 / 0.4), oklch(0.25 0.12 320 / 0.3))' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-purple pulse-glow"><Sparkles className="h-6 w-6 text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold">مساعد MusiX الذكي</p><p className="text-xs text-muted-foreground">اسألني عن أي نوع من الموسيقى</p></div>
              <span className="text-xs text-primary">جرّب ←</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

function SkeletonRow() {
  return <section><div className="mb-3 h-5 w-32 animate-pulse rounded bg-muted" /><HScroll>{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</HScroll></section>
}
