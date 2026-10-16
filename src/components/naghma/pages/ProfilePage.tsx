'use client'
import { User, Settings, Shield, Heart, ListMusic, Clock, ChevronLeft, LogOut, Moon } from 'lucide-react'
import { useNavStore } from '@/lib/stores/nav-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { useEffect, useState } from 'react'
import { adminCheck, adminLogout } from '@/lib/api-client'
import { toast } from 'sonner'

export function ProfilePage() {
  const navigate = useNavStore((s) => s.navigate)
  const favCount = useLibraryStore((s) => s.favoriteIds.length)
  const playlistCount = useLibraryStore((s) => s.playlists.length)
  const reduceMotion = useLibraryStore((s) => s.reduceMotion)
  const setReduceMotion = useLibraryStore((s) => s.setReduceMotion)
  const { theme, setTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => { adminCheck().then(setIsAdmin) }, [])
  const handleAdminLogout = async () => { await adminLogout(); setIsAdmin(false); toast.success('تم تسجيل الخروج') }

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-6 flex flex-col items-center gap-2 pt-2 text-center">
        <div className="relative h-20 w-20 overflow-hidden rounded-full gradient-purple flex items-center justify-center text-white text-2xl font-bold pulse-glow">زائر</div>
        <div><h1 className="text-xl font-bold">زائر MusiX</h1><p className="text-xs text-muted-foreground">تصفّح دون تسجيل</p></div>
      </header>
      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card/50 p-3 text-center"><Heart className="mx-auto h-5 w-5 text-red-500" /><p className="mt-1 text-lg font-bold">{favCount}</p><p className="text-[10px] text-muted-foreground">مفضلة</p></div>
        <div className="rounded-2xl bg-card/50 p-3 text-center"><ListMusic className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-lg font-bold">{playlistCount}</p><p className="text-[10px] text-muted-foreground">قوائم</p></div>
        <div className="rounded-2xl bg-card/50 p-3 text-center"><Clock className="mx-auto h-5 w-5 text-primary" /><p className="mt-1 text-lg font-bold">—</p><p className="text-[10px] text-muted-foreground">استماع</p></div>
      </div>
      <div className="space-y-2">
        <Section title="الحساب" items={[{ icon: Heart, label: 'المفضلة', onClick: () => navigate('favorites') }, { icon: ListMusic, label: 'مكتبتي', onClick: () => navigate('library') }, { icon: Settings, label: 'الإعدادات', onClick: () => navigate('settings') }]} />
        <Section title="التفضيلات">
          <Row icon={theme === 'dark' ? Moon : User} label="الوضع الداكن"><Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} /></Row>
          <Row icon={Heart} label="تقليل الحركة"><Switch checked={reduceMotion} onCheckedChange={setReduceMotion} /></Row>
        </Section>
        <Section title="الإدارة">
          {isAdmin ? (
            <>
              <Row icon={Shield} label="لوحة الإدارة" onClick={() => navigate('admin-dashboard')}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>
              <Row icon={LogOut} label="تسجيل الخروج من المسؤول" onClick={handleAdminLogout}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>
            </>
          ) : <Row icon={Shield} label="دخول المسؤول" onClick={() => navigate('admin-login')}><ChevronLeft className="h-4 w-4 text-muted-foreground" /></Row>}
        </Section>
      </div>
      <p className="mt-6 text-center text-[10px] text-muted-foreground/60">MusiX — تطبيق موسيقي عربي</p>
    </div>
  )
}

function Section({ title, items, children }: { title: string; items?: { icon: any; label: string; onClick?: () => void }[]; children?: React.ReactNode }) {
  return <div><h3 className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">{title}</h3><div className="overflow-hidden rounded-2xl border border-border/40 bg-card/40">{items?.map((it, i) => <button key={i} onClick={it.onClick} className="flex w-full items-center gap-3 border-b border-border/30 p-3 text-right last:border-0 tap-scale hover:bg-accent/30"><it.icon className="h-5 w-5 text-primary" /><span className="flex-1 text-sm">{it.label}</span><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>)}{children}</div></div>
}
function Row({ icon: Icon, label, children, onClick }: { icon: any; label: string; children?: React.ReactNode; onClick?: () => void }) {
  return <div className="flex w-full items-center gap-3 border-b border-border/30 p-3 last:border-0"><Icon className="h-5 w-5 text-primary" /><button onClick={onClick} className="flex-1 text-right text-sm" disabled={!onClick}>{label}</button>{children}</div>
}
