'use client'

import { useNavStore } from '@/lib/stores/nav-store'
import { useQuery } from '@tanstack/react-query'
import { fetchHomeData } from '@/lib/api-client'
import { ChevronRight, Newspaper, Calendar, Tag, Sparkles, Music2, TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export function NewsPage() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const { data } = useQuery({ queryKey: ['home'], queryFn: fetchHomeData, staleTime: 60_000 })

  // إنشاء "أخبار" من الأغاني الأحدث
  const newsItems = (data?.latest || []).slice(0, 8).map((song: any, i: number) => ({
    id: song.id,
    title: `إضافة جديدة: ${song.title}`,
    desc: song.artistName ? `أغنية جديدة من ${song.artistName}` : 'أغنية جديدة في مكتبة MusiX',
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('ar-MA'),
    type: 'أغنية جديدة',
    cover: song.coverUrl,
    songId: song.id,
  }))

  const announcements = [
    {
      title: '🎉 إطلاق نظام النقاط والمكافآت',
      desc: 'اربح 5 نقاط لكل أغنية تستمع إليها، و50 نقطة عن كل إعلان تشاهده!',
      date: 'أكتوبر 2026',
      type: 'ميزة جديدة',
      icon: Sparkles,
      color: 'from-yellow-500/20 to-amber-500/20',
    },
    {
      title: '📱 MusiX متاح الآن كـ PWA',
      desc: 'ثبّت التطبيق على هاتفك واستمتع بتجربة أصلية بدون متصفّح',
      date: 'أكتوبر 2026',
      type: 'تحديث',
      icon: Music2,
      color: 'from-purple-500/20 to-pink-500/20',
    },
    {
      title: '💬 مساعد MusiX الذكي',
      desc: 'اسأل مساعد MusiX عن أي نوع من الموسيقى وسيقترح لك أفضل الأغاني',
      date: 'أكتوبر 2026',
      type: 'ميزة جديدة',
      icon: TrendingUp,
      color: 'from-blue-500/20 to-cyan-500/20',
    },
  ]

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Hero */}
        <div className="rounded-3xl gradient-purple p-6 text-center text-white">
          <Newspaper className="mx-auto h-8 w-8 mb-2" />
          <h1 className="text-2xl font-extrabold">أخبار وتحديثات MusiX</h1>
          <p className="mt-2 text-xs opacity-90">آخر الميزات والأغاني الجديدة</p>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="mb-2 text-base font-bold">آخر الإعلانات</h2>
          <div className="space-y-2">
            {announcements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border border-border/40 bg-gradient-to-r ${item.color} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card/60">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-medium text-primary">{item.type}</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="h-3 w-3" />{item.date}</span>
                    </div>
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* New Songs */}
        {newsItems.length > 0 && (
          <div>
            <h2 className="mb-2 text-base font-bold">أحدث الإضافات</h2>
            <div className="space-y-2">
              {newsItems.map((item: any, i: number) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate('song', { songId: item.songId })}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/40 bg-card/40 p-3 text-right tap-scale"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.cover ? (
                      <img src={item.cover} alt={item.title} className="h-full w-full object-cover scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center gradient-purple">
                        <Music2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <Tag className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-muted-foreground">{item.type}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />{item.date}</span>
                    </div>
                    <p className="truncate text-sm font-bold">{item.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rotate-180" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => navigate('home')}
          className="w-full rounded-2xl gradient-purple p-4 text-center text-white text-sm font-bold tap-scale"
        >
          استكشف المزيد ←
        </button>
      </motion.div>
    </div>
  )
}
