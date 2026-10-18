'use client'

import { useState, useEffect } from 'react'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { adminCheck, adminLogout } from '@/lib/api-client'
import { toast } from 'sonner'
import { Wallet, Music2, TrendingUp, LogOut, User, Settings, Heart, ListMusic, ChevronLeft, Moon, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'

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
