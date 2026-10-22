'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { adminCheck, adminLogout, fetchSocialLinks, type SocialLinks } from '@/lib/api-client'
import { toast } from 'sonner'
import { Wallet, Music2, TrendingUp, LogOut, User, Settings, Heart, ListMusic, ChevronLeft, Moon, Shield, Facebook, Instagram, Mail, MessageCircle, Info, Newspaper, Phone } from 'lucide-react'
import { RewardedVideoAd } from '@/components/naghma/common/RewardedVideoAd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

// ====== القيم الافتراضية للروابط — تُستخدم إذا لم تكن هناك قيم في قاعدة البيانات ======
const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  facebook: { url: 'https://www.facebook.com/share/19oiL3PSdL/', name: 'فيسبوك', handle: 'MusiX' },
  whatsapp: { url: 'https://wa.me/212713416046', name: 'واتساب', handle: '+212713416046' },
  instagram: { url: 'https://www.instagram.com/el__aouidi_mohamed?obrf=ZzdlY3lqenUzeG44', name: 'انستقرام', handle: 'el__aouidi_mohamed' },
  adsense: { publisherId: '', enabled: false, scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' },
}
// =====================================================================================

// أيقونة واتساب (SVG مخصص - Lucide لا يحتوي على أيقونة WhatsApp رسمية)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.585 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

// قيم ألوان العلامات التجارية الرسمية
const BRAND_COLORS = {
  facebook: { from: '#1877F2', to: '#0a4da8', solid: '#1877F2' },
  whatsapp: { from: '#25D366', to: '#128C3F', solid: '#25D366' },
  instagram: { from: '#F58529', via: '#DD2A7B', to: '#8134AF', solid: '#DD2A7B' },
}

export function ProfilePage() {
  const navigate = useNavStore((s) => s.navigate)
  const favCount = useLibraryStore((s) => s.favoriteIds.length)
  const playlistCount = useLibraryStore((s) => s.playlists.length)
  const reduceMotion = useLibraryStore((s) => s.reduceMotion)
  const setReduceMotion = useLibraryStore((s) => s.setReduceMotion)
  const { theme, setTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [balance, setBalance] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [loading, setLoading] = useState(false)
  // جلب روابط التواصل الاجتماعي من API مع fallback للقيم الافتراضية
  const { data: socialLinks } = useQuery({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    staleTime: 5 * 60_000, // 5 دقائق
    placeholderData: DEFAULT_SOCIAL_LINKS,
  })
  const links = socialLinks || DEFAULT_SOCIAL_LINKS
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ paymentMethod: '', paymentDetails: '' })

  useEffect(() => { adminCheck().then(setIsAdmin); checkUser() }, [])

  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      if (data.user) { setUser(data.user); fetchBalance() }
    } catch {}
  }

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/earnings/balance')
      const data = await res.json()
      setBalance(data)
    } catch {}
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = loginMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.ok) {
        setUser(data.user)
        setShowLogin(false)
        toast.success(loginMode === 'login' ? 'مرحبًا بعودتك!' : 'تم إنشاء حسابك!')
        fetchBalance()
      } else { toast.error(data.error || 'فشل') }
    } catch { toast.error('خطأ') }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null); setBalance(null)
    toast.success('تم تسجيل الخروج')
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/earnings/withdraw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withdrawForm)
      })
      const data = await res.json()
      if (data.ok) { toast.success('تم إرسال طلب السحب!'); setShowWithdraw(false); fetchBalance() }
      else { toast.error(data.error || 'فشل') }
    } catch { toast.error('خطأ') }
    finally { setLoading(false) }
  }

  const handleAdminLogout = async () => { await adminLogout(); setIsAdmin(false); toast.success('تم تسجيل الخروج') }

  const balanceDH = balance ? (balance.balanceDH || '0.00') : '0.00'
  const points = user?.balance || 0
  const songsListened = user?.totalSongsListened || 0
  const canWithdraw = points >= 10000
  const POINTS_TO_DH = 1000

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-6 flex flex-col items-center gap-2 pt-2 text-center">
        {user ? (
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-full gradient-purple flex items-center justify-center text-white text-2xl font-bold pulse-glow">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'م'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.displayName}</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-full gradient-purple flex items-center justify-center text-white text-2xl font-bold pulse-glow">زائر</div>
            <div><h1 className="text-xl font-bold">زائر MusiX</h1><p className="text-xs text-muted-foreground">سجل دخول لربح النقاط</p></div>
            <Button onClick={() => { setShowLogin(true); setLoginMode('register') }} className="mt-2 rounded-full gradient-purple text-white">
              <User className="h-4 w-4 ml-1" /> إنشاء حساب
            </Button>
            <button onClick={() => { setShowLogin(true); setLoginMode('login') }} className="text-xs text-primary">لديك حساب؟ ادخل هنا</button>
          </div>
        )}
      </header>

      {/* إعلان بمكافأة — يظهر للمسؤول فقط */}
      {isAdmin && (
        <div className="space-y-2">
          <RewardedVideoAd />
        </div>
      )}

      {/* بطاقة الأرباح */}
      {user && balance && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 overflow-hidden rounded-3xl gradient-purple p-5 text-white">
          <div className="flex items-center gap-2 mb-2"><Wallet className="h-5 w-5" /><p className="text-sm opacity-90">رصيدك الحالي</p></div>
          <p className="text-4xl font-extrabold">{balanceDH} <span className="text-lg">درهم</span></p>
          <p className="text-sm opacity-80 mt-1">{points} نقطة</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/15 backdrop-blur p-2 text-center"><Music2 className="mx-auto h-4 w-4" /><p className="text-lg font-bold mt-1">{songsListened}</p><p className="text-[10px] opacity-80">أغنية مكتملة</p></div>
            <div className="rounded-xl bg-white/15 backdrop-blur p-2 text-center"><TrendingUp className="mx-auto h-4 w-4" /><p className="text-lg font-bold mt-1">{balance.recentEarnings?.length || 0}</p><p className="text-[10px] opacity-80">أرباح اليوم</p></div>
          </div>
          <Button
            onClick={() => canWithdraw ? setShowWithdraw(true) : toast.info(`تحتاج ${10000 / POINTS_TO_DH} درهم على الأقل للسحب`)}
            disabled={!canWithdraw}
            className="mt-4 w-full rounded-xl bg-white text-black font-bold hover:bg-white/90"
          >
            <Wallet className="h-4 w-4 ml-1" /> طلب سحب الأرباح
          </Button>
          {!canWithdraw && <p className="text-center text-[10px] opacity-70 mt-2">تحتاج {(10000 - points) / POINTS_TO_DH} درهم إضافي للسحب</p>}
        </motion.div>
      )}

      {/* إحصائيات */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card/50 p-3 text-center"><Heart className="mx-auto h-5 w-5 text-red-500" /><p className="mt-1 text-lg font-bold">{favCount}</p><p className="text-[10px] text-muted-foreground">مفضلة</p></div>
        <div className="rounded-2xl bg-card/50 p-3 text-center"><ListMusic className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-lg font-bold">{playlistCount}</p><p className="text-[10px] text-muted-foreground">قوائم</p></div>
        <div className="rounded-2xl bg-card/50 p-3 text-center"><Music2 className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-lg font-bold">{songsListened}</p><p className="text-[10px] text-muted-foreground">استماع</p></div>
      </div>

      {/* الأقسام */}
      <div className="space-y-2">
        <Section title="الحساب" items={[
          { icon: Heart, label: 'المفضلة', onClick: () => navigate('favorites') },
          { icon: ListMusic, label: 'مكتبتي', onClick: () => navigate('library') },
          { icon: Settings, label: 'الإعدادات', onClick: () => navigate('settings') },
        ]} />
        <Section title="عن التطبيق" items={[
          { icon: Info, label: 'من نحن', onClick: () => navigate('about') },
          { icon: Phone, label: 'اتصل بنا', onClick: () => navigate('contact') },
          { icon: Newspaper, label: 'أخبار وتحديثات', onClick: () => navigate('news') },
        ]} />
        <Section title="التفضيلات">
          <Row icon={theme === 'dark' ? Moon : User} label="الوضع الداكن"><Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} /></Row>
          <Row icon={Heart} label="تقليل الحركة"><Switch checked={reduceMotion} onCheckedChange={setReduceMotion} /></Row>
        </Section>
        {user && <Row icon={LogOut} label="تسجيل الخروج" onClick={handleLogout}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>}
        <Section title="الإدارة">
          {isAdmin ? (
            <>
              <Row icon={Shield} label="لوحة الإدارة" onClick={() => navigate('admin-dashboard')}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>
              <Row icon={LogOut} label="خروج المسؤول" onClick={handleAdminLogout}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>
            </>
          ) : <Row icon={Shield} label="دخول المسؤول" onClick={() => navigate('admin-login')}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>}
        </Section>

        {/* ====== قسم «تواصل معي» الاحترافي ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur"
        >
          {/* ترويسة القسم */}
          <div className="relative px-4 py-3 text-center">
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, oklch(0.65 0.28 295 / 0.35), transparent 70%)' }} />
            <div className="relative">
              <h3 className="text-base font-bold gradient-purple-text">تواصل معي</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">تابعنا على منصات التواصل الاجتماعي</p>
            </div>
          </div>

          {/* البطاقات الثلاث */}
          <div className="grid grid-cols-3 gap-2 p-3 pt-1">
            {/* فيسبوك */}
            <motion.a
              href={links.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-3 text-center"
              aria-label={`فيسبوك - ${links.facebook.handle}`}
            >
              {/* توهّج خلفي بلون العلامة */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-25" style={{ background: `radial-gradient(circle at 50% 50%, ${BRAND_COLORS.facebook.solid}, transparent 70%)` }} />
              <motion.span
                whileHover={{ rotate: -8 }}
                className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.facebook.from}, ${BRAND_COLORS.facebook.to})` }}
              >
                <Facebook className="h-6 w-6 text-white" />
              </motion.span>
              <div className="relative min-w-0">
                <p className="text-xs font-bold">فيسبوك</p>
                <p className="truncate text-[10px] text-muted-foreground" dir="ltr">{links.facebook.handle}</p>
              </div>
            </motion.a>

            {/* واتساب */}
            <motion.a
              href={links.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-3 text-center"
              aria-label={`واتساب - ${links.whatsapp.handle}`}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-25" style={{ background: `radial-gradient(circle at 50% 50%, ${BRAND_COLORS.whatsapp.solid}, transparent 70%)` }} />
              <motion.span
                whileHover={{ rotate: 8 }}
                className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.whatsapp.from}, ${BRAND_COLORS.whatsapp.to})` }}
              >
                <WhatsAppIcon className="h-6 w-6 text-white" />
              </motion.span>
              <div className="relative min-w-0">
                <p className="text-xs font-bold">واتساب</p>
                <p className="truncate text-[10px] text-muted-foreground" dir="ltr">{links.whatsapp.handle}</p>
              </div>
            </motion.a>

            {/* انستقرام */}
            <motion.a
              href={links.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border/40 bg-card/50 p-3 text-center"
              aria-label={`انستقرام - ${links.instagram.handle}`}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-25" style={{ background: `radial-gradient(circle at 50% 50%, ${BRAND_COLORS.instagram.solid}, transparent 70%)` }} />
              <motion.span
                whileHover={{ rotate: -8 }}
                className="relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.instagram.from}, ${BRAND_COLORS.instagram.via} 50%, ${BRAND_COLORS.instagram.to})` }}
              >
                <Instagram className="h-6 w-6 text-white" />
              </motion.span>
              <div className="relative min-w-0">
                <p className="text-xs font-bold">انستقرام</p>
                <p className="truncate text-[10px] text-muted-foreground" dir="ltr">{links.instagram.handle}</p>
              </div>
            </motion.a>
          </div>

          {/* شريط سفلي بلمسة لونية */}
          <div className="flex h-1 w-full">
            <div className="flex-1" style={{ background: BRAND_COLORS.facebook.solid }} />
            <div className="flex-1" style={{ background: BRAND_COLORS.whatsapp.solid }} />
            <div className="flex-1" style={{ background: BRAND_COLORS.instagram.solid }} />
          </div>
        </motion.div>
      </div>
      <p className="mt-6 text-center text-[10px] text-muted-foreground/60">MusiX — استمع واربح 🎵💰</p>

      {/* نافذة تسجيل الدخول/التسجيل */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowLogin(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-strong rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-center mb-1">{loginMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            <p className="text-xs text-muted-foreground text-center mb-4">استمع للأغاني واربح النقاط!</p>
            <form onSubmit={handleAuth} className="space-y-3">
              {loginMode === 'register' && (
                <div><Label className="mb-1 block text-sm">الاسم الظاهر</Label><Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="h-11" placeholder="اسمك" /></div>
              )}
              <div><Label className="mb-1 block text-sm">البريد الإلكتروني</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" placeholder="email@example.com" dir="ltr" required /></div>
              <div><Label className="mb-1 block text-sm">كلمة المرور</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11" placeholder="••••••••" dir="ltr" required /></div>
              <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl gradient-purple text-white font-bold">{loading ? '...' : loginMode === 'login' ? 'دخول' : 'إنشاء حساب'}</Button>
            </form>
            <button onClick={() => setLoginMode(loginMode === 'login' ? 'register' : 'login')} className="mt-3 w-full text-center text-xs text-primary">
              {loginMode === 'login' ? 'ليس لديك حساب؟ أنشئ واحدًا' : 'لديك حساب؟ ادخل'}
            </button>
          </motion.div>
        </div>
      )}

      {/* نافذة طلب السحب */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowWithdraw(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-strong rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-center mb-1">طلب سحب الأرباح</h2>
            <p className="text-xs text-muted-foreground text-center mb-4">سيتم تحويل {balanceDH} درهم إليك</p>
            <form onSubmit={handleWithdraw} className="space-y-3">
              <div><Label className="mb-1 block text-sm">طريقة الدفع</Label>
                <select value={withdrawForm.paymentMethod} onChange={(e) => setWithdrawForm({ ...withdrawForm, paymentMethod: e.target.value })} className="h-11 w-full rounded-xl border border-border/40 bg-card/60 px-3 text-sm">
                  <option value="">اختر...</option>
                  <option value="bank">تحويل بنكي</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">نقدًا</option>
                  <option value="recharge">شحن رصيد هاتف</option>
                </select>
              </div>
              <div><Label className="mb-1 block text-sm">تفاصيل الدفع</Label><Input value={withdrawForm.paymentDetails} onChange={(e) => setWithdrawForm({ ...withdrawForm, paymentDetails: e.target.value })} className="h-11" placeholder="رقم الحساب / البريد / رقم الهاتف" required /></div>
              <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl gradient-purple text-white font-bold">{loading ? '...' : 'تأكيد طلب السحب'}</Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function Section({ title, items, children }: { title: string; items?: { icon: any; label: string; onClick?: () => void }[]; children?: React.ReactNode }) {
  return <div><h3 className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">{title}</h3><div className="overflow-hidden rounded-2xl border border-border/40 bg-card/40">{items?.map((it, i) => <button key={i} onClick={it.onClick} className="flex w-full items-center gap-3 border-b border-border/30 p-3 text-right last:border-0 tap-scale hover:bg-accent/30"><it.icon className="h-5 w-5 text-primary" /><span className="flex-1 text-sm">{it.label}</span><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>)}{children}</div></div>
}
function Row({ icon: Icon, label, children, onClick }: { icon: any; label: string; children?: React.ReactNode; onClick?: () => void }) {
  return <div className="flex w-full items-center gap-3 border-b border-border/30 p-3 last:border-0"><Icon className="h-5 w-5 text-primary" /><button onClick={onClick} className="flex-1 text-right text-sm" disabled={!onClick}>{label}</button>{children}</div>
}
