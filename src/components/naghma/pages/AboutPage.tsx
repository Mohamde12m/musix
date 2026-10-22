'use client'

import { useNavStore } from '@/lib/stores/nav-store'
import { useQuery } from '@tanstack/react-query'
import { fetchHomeData } from '@/lib/api-client'
import { ChevronRight, Music2, Gift, Wallet, Sparkles, Heart, Shield, Zap, TrendingUp, Headphones, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export function AboutPage() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const { data } = useQuery({ queryKey: ['home'], queryFn: fetchHomeData, staleTime: 60_000 })

  const features = [
    { icon: Music2, title: 'مكتبة موسيقية ضخمة', desc: 'استمع لأجمل الأغاني العربية والمغربية والراي' },
    { icon: Wallet, title: 'نظام نقاط ومكافآت', desc: 'اربح 5 نقاط لكل أغنية واستمع لها يومياً' },
    { icon: Gift, title: 'مكافآت يومية', desc: 'شاهد الإعلانات واحصل على 50 نقطة إضافية' },
    { icon: Sparkles, title: 'مساعد ذكي', desc: 'مساعد MusiX يرشحك أغاني حسب ذوقك' },
    { icon: Heart, title: 'قائمة مفضلة', desc: 'احفظ أغانيك المفضلة واستمع لها في أي وقت' },
    { icon: Headphones, title: 'استماع لا محدود', desc: 'استمتع بالموسيقى بدون انقطاع وبجودة عالية' },
  ]

  const stats = [
    { label: 'أغنية', value: data?.latest?.length || 0 },
    { label: 'فنان', value: data?.artists?.length || 0 },
    { label: 'تصنيف', value: data?.categories?.length || 0 },
  ]

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl gradient-purple p-6 text-center text-white">
          <div className="absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
          <div className="relative">
            <h1 className="text-3xl font-extrabold mb-2">MusiX</h1>
            <p className="text-sm opacity-90">تطبيق الموسيقى العربية الأول</p>
            <p className="mt-3 text-xs opacity-80">عالم الموسيقى بين يديك الآن — استمع واربح النقاط!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-card/40 p-3 text-center"
            >
              <p className="text-2xl font-extrabold gradient-purple-text">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* About Text */}
        <div className="rounded-2xl bg-card/40 p-4">
          <h2 className="mb-2 text-base font-bold">من نحن</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">MusiX</span> هو تطبيق موسيقي عربي احترافي يجمع لك أجمل الأغاني العربية والمغربية والراي والشعبي في مكان واحد. هدفنا تقديم تجربة موسيقية مميزة مع إمكانية كسب النقاط ومكافآت يومية عبر الاستماع والإعلانات.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            بدأنا في عام 2024 بِهدف تقديم محتوى موسيقي عربي عالي الجودة، مع نظام مكافآت فريد يُمكّن المستخدمين من كسب دراهم حقيقية عبر الاستماع لأغانيهم المفضلة.
          </p>
        </div>

        {/* Features */}
        <div>
          <h2 className="mb-3 text-base font-bold">مميزات MusiX</h2>
          <div className="space-y-2">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card/40 p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-purple">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{f.title}</p>
                  <p className="text-[11px] text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('home')}
          className="w-full rounded-2xl gradient-purple p-4 text-center text-white text-sm font-bold tap-scale"
        >
          ابدأ الاستماع الآن ←
        </button>

        {/* Privacy Policy */}
        <button
          onClick={() => navigate('contact')}
          className="w-full rounded-2xl border border-border/40 bg-card/40 p-3 text-center text-xs text-muted-foreground tap-scale"
        >
          تواصل معنا
        </button>
      </motion.div>
    </div>
  )
}
