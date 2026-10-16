'use client'
import { Settings, Moon, Sun, Bell, Trash2, Database, Info, Clock } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useLibraryStore } from '@/lib/stores/library-store'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { adminCheck } from '@/lib/api-client'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const reduceMotion = useLibraryStore((s) => s.reduceMotion)
  const setReduceMotion = useLibraryStore((s) => s.setReduceMotion)
  const clearFavorites = useLibraryStore((s) => s.clearFavorites)
  const clearRecentSearches = useLibraryStore((s) => s.clearRecentSearches)
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => { adminCheck().then(setIsAdmin) }, [])
  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-4"><h1 className="text-2xl font-extrabold gradient-purple-text flex items-center gap-2"><Settings className="h-6 w-6 text-primary" />الإعدادات</h1></header>
      <div className="space-y-4">
        <Section title="المظهر">
          <Row icon={theme === 'dark' ? Moon : Sun} label="الوضع الداكن"><Switch checked={theme === 'dark'} onCheckedChange={(c) => setTheme(c ? 'dark' : 'light')} /></Row>
          <Row icon={Bell} label="تقليل الحركة"><Switch checked={reduceMotion} onCheckedChange={setReduceMotion} /></Row>
        </Section>
        <Section title="البيانات">
          <Row icon={Clock} label="مسح عمليات البحث الأخيرة"><Button variant="outline" size="sm" onClick={() => { clearRecentSearches(); toast.success('تم المسح') }}>مسح</Button></Row>
          <Row icon={Trash2} label="مسح المفضلة"><Button variant="outline" size="sm" className="text-destructive" onClick={() => { if (confirm('مسح كل المفضلة؟')) { clearFavorites(); toast.success('تم المسح') } }}>مسح</Button></Row>
        </Section>
        <Section title="حول">
          <Row icon={Info} label="نسخة التطبيق" subtitle="MusiX 1.0.0" />
          <Row icon={Database} label="قاعدة البيانات" subtitle="SQLite محفوظة على الخادم" />
        </Section>
        {isAdmin && <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">أنت مسجّل الدخول بصفة مسؤول.</div>}
      </div>
    </div>
  )
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div><h3 className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">{title}</h3><div className="overflow-hidden rounded-2xl border border-border/40 bg-card/40">{children}</div></div> }
function Row({ icon: Icon, label, subtitle, children }: { icon: any; label: string; subtitle?: string; children?: React.ReactNode }) { return <div className="flex items-center gap-3 border-b border-border/30 p-3 last:border-0"><Icon className="h-5 w-5 text-primary" /><div className="flex-1"><p className="text-sm">{label}</p>{subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}</div>{children}</div> }
