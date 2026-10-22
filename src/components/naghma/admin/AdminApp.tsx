'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Shield, LogOut, ChevronRight, LayoutDashboard, Music2, Plus, Users, Tags, Loader2, AlertCircle, Home, Star, Eye, EyeOff, Trash2, Pencil, Check, Download, Upload, Settings as SettingsIcon, Save, Gamepad2, Megaphone } from 'lucide-react'
import { useNavStore, type PageId } from '@/lib/stores/nav-store'
import { adminCheck, adminLogout, adminFetchSongs, adminCreateSong, adminUpdateSong, adminDeleteSong, adminFetchArtists, adminUpdateArtist, adminFetchCategories, adminCreateCategory, adminDeleteCategory, adminUpdateCategory, adminExportBackup, adminImportBackup, adminFetchSettings, adminUpdateSettings } from '@/lib/api-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import type { ApiSong } from '@/lib/types'

const SUB_PAGES: PageId[] = ['admin-dashboard', 'admin-songs', 'admin-add-song', 'admin-artists', 'admin-categories', 'admin-settings']

export function AdminApp() {
  const page = useNavStore((s) => s.page)
  const navigate = useNavStore((s) => s.navigate)
  const [authed, setAuthed] = useState<boolean | null>(null)
  useEffect(() => { adminCheck().then(setAuthed) }, [])
  useEffect(() => { if (authed === false) navigate('admin-login') }, [authed, navigate])
  if (authed === null) return <div className="flex min-h-screen flex-col items-center justify-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs text-muted-foreground">جارٍ التحقق...</p></div>
  if (!authed) return null
  const handleLogout = async () => { await adminLogout(); toast.success('تم تسجيل الخروج'); navigate('home') }
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-strong sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border/40 px-3 py-3 safe-top">
        <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-purple"><Shield className="h-4 w-4 text-white" /></div><div><p className="text-xs font-bold leading-tight">لوحة الإدارة</p><p className="text-[10px] text-muted-foreground">مساعد MusiX</p></div></div>
        <div className="flex items-center gap-1"><Button onClick={() => navigate('home')} size="sm" variant="ghost" className="rounded-full text-xs"><Home className="h-4 w-4 ml-1" />التطبيق</Button><Button onClick={handleLogout} size="sm" variant="ghost" className="rounded-full text-destructive text-xs"><LogOut className="h-4 w-4 ml-1" />خروج</Button></div>
      </header>
      <nav className="no-scrollbar sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border/40 bg-card/30 px-2 py-2">
        {SUB_PAGES.map((p) => { const active = page === p || (page === 'admin-edit-song' && p === 'admin-songs'); return <button key={p} onClick={() => navigate(p)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs tap-scale ${active ? 'gradient-purple text-white' : 'bg-card/50 text-muted-foreground'}`}>{iconFor(p)}{labelFor(p)}</button> })}
      </nav>
      <main className="flex-1 px-3 pb-10 pt-3">
        {page === 'admin-dashboard' && <DashboardView />}
        {(page === 'admin-songs' || page === 'admin-edit-song') && <SongsView />}
        {page === 'admin-add-song' && <AddSongView />}
        {page === 'admin-artists' && <ArtistsView />}
        {page === 'admin-categories' && <CategoriesView />}
        {page === 'admin-settings' && <SettingsView />}
      </main>
    </div>
  )
}

function iconFor(p: PageId) { return p === 'admin-dashboard' ? <LayoutDashboard className="h-3.5 w-3.5" /> : p === 'admin-songs' ? <Music2 className="h-3.5 w-3.5" /> : p === 'admin-add-song' ? <Plus className="h-3.5 w-3.5" /> : p === 'admin-artists' ? <Users className="h-3.5 w-3.5" /> : p === 'admin-categories' ? <Tags className="h-3.5 w-3.5" /> : <SettingsIcon className="h-3.5 w-3.5" /> }
function labelFor(p: PageId) { return p === 'admin-dashboard' ? 'الرئيسية' : p === 'admin-songs' ? 'الأغاني' : p === 'admin-add-song' ? 'إضافة أغنية' : p === 'admin-artists' ? 'الفنانون' : p === 'admin-categories' ? 'التصنيفات' : 'الإعدادات' }

function DashboardView() {
  const navigate = useNavStore((s) => s.navigate)
  const { data: songs } = useQuery({ queryKey: ['admin-songs'], queryFn: adminFetchSongs })
  const { data: artists } = useQuery({ queryKey: ['admin-artists'], queryFn: adminFetchArtists })
  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: adminFetchCategories })
  const published = songs?.filter((s) => s.published).length || 0
  const unpublished = songs?.filter((s) => !s.published).length || 0
  const featured = songs?.filter((s) => s.featured).length || 0
  const totalPlays = songs?.reduce((sum, s) => sum + s.playCount, 0) || 0
  const latest = songs?.slice(0, 5) || []
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">مرحبًا بك في لوحة الإدارة</h1>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="إجمالي الأغاني" value={songs?.length ?? '...'} icon={<Music2 className="h-5 w-5" />} />
        <StatCard label="الأغاني المنشورة" value={published} icon={<Eye className="h-5 w-5" />} />
        <StatCard label="غير المنشورة" value={unpublished} icon={<EyeOff className="h-5 w-5" />} />
        <StatCard label="الأغاني المميزة" value={featured} icon={<Star className="h-5 w-5" />} />
        <StatCard label="إجمالي الفنانين" value={artists?.length ?? '...'} icon={<Users className="h-5 w-5" />} />
        <StatCard label="إجمالي التصنيفات" value={categories?.length ?? '...'} icon={<Tags className="h-5 w-5" />} />
      </div>
      <div className="rounded-2xl gradient-purple p-4 text-white"><p className="text-xs opacity-90">إجمالي الاستماعات</p><p className="text-3xl font-extrabold">{totalPlays.toLocaleString('ar-EG')}</p></div>
      <div><h2 className="mb-2 text-sm font-semibold">إجراءات سريعة</h2><div className="grid grid-cols-2 gap-2"><ActionCard icon={<Plus className="h-5 w-5" />} label="إضافة أغنية جديدة" onClick={() => navigate('admin-add-song')} /><ActionCard icon={<Music2 className="h-5 w-5" />} label="إدارة الأغاني" onClick={() => navigate('admin-songs')} /><ActionCard icon={<Users className="h-5 w-5" />} label="إدارة الفنانين" onClick={() => navigate('admin-artists')} /><ActionCard icon={<Tags className="h-5 w-5" />} label="إدارة التصنيفات" onClick={() => navigate('admin-categories')} /></div></div>
      {latest.length > 0 && <div><h2 className="mb-2 text-sm font-semibold">أحدث الأغاني المضافة</h2><div className="space-y-1">{latest.map((s) => <div key={s.id} className="flex items-center gap-2 rounded-xl bg-card/40 p-2"><span className={`h-2 w-2 rounded-full ${s.published ? 'bg-green-500' : 'bg-yellow-500'}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{s.title}</p><p className="truncate text-[10px] text-muted-foreground">{s.artistName || 'غير معروف'}</p></div><span className="text-[10px] text-muted-foreground">{s.playCount} استماع</span></div>)}</div></div>}
      <div className="rounded-2xl border border-border/40 bg-card/30 p-3 text-xs text-muted-foreground"><AlertCircle className="mb-1 h-4 w-4 text-primary" /><p>عند إضافة أغنية جديدة ونشرها، تظهر فورًا للمستخدمين دون إعادة بناء التطبيق.</p></div>
      <BackupSection />
    </div>
  )
}

// قسم النسخ الاحتياطي والاستعادة
function BackupSection() {
  const queryClient = useQueryClient()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await adminExportBackup()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `musix-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('تم تنزيل النسخة الاحتياطية')
    } catch (e: any) { toast.error(e.message) }
    finally { setExporting(false) }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const res = await adminImportBackup(data)
      if (res.ok) {
        toast.success(`تمت الاستعادة: ${res.songs || 0} أغنية، ${res.categories || 0} تصنيف، ${res.artists || 0} فنان`)
        queryClient.invalidateQueries({ queryKey: ['admin-songs'] })
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
        queryClient.invalidateQueries({ queryKey: ['admin-artists'] })
        queryClient.invalidateQueries({ queryKey: ['home'] })
        queryClient.invalidateQueries({ queryKey: ['songs'] })
        queryClient.invalidateQueries({ queryKey: ['categories'] })
      } else { toast.error(res.error || 'فشل الاستيراد') }
    } catch (e: any) { toast.error('ملف غير صالح') }
    finally { setImporting(false); if (e.target) e.target.value = '' }
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold">النسخ الاحتياطي والاستعادة</h2>
      <div className="flex flex-col gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-3">
        <p className="text-[10px] text-muted-foreground">
          تُحفظ أغانيك تلقائيًا في نسخة احتياطية بعد كل عملية. إن ضاعت، ستُستعاد تلقائيًا عند فتح التطبيق.
          يمكنك أيضًا تنزيل نسخة يدويًا أو استعادتها من ملف.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Download className="h-4 w-4 ml-1" />}
            تنزيل نسخة
          </Button>
          <Button onClick={() => fileRef.current?.click()} disabled={importing} variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
            {importing ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Upload className="h-4 w-4 ml-1" />}
            استعادة من ملف
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImportFile} className="hidden" />
        </div>
      </div>
    </div>
  )
}
function StatCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) { return <div className="rounded-2xl border border-border/40 bg-card/40 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">{icon}</div><p className="mt-2 text-2xl font-extrabold">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div> }
function ActionCard({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) { return <button onClick={onClick} className="flex flex-col items-start gap-2 rounded-2xl border border-border/40 bg-card/40 p-3 text-right tap-scale hover:border-primary"><div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-purple text-white">{icon}</div><p className="text-xs font-semibold">{label}</p></button> }

function SongsView() {
  const navigate = useNavStore((s) => s.navigate)
  const params = useNavStore((s) => s.params)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished' | 'featured'>('all')
  const queryClient = useQueryClient()
  const { data: songs, isLoading } = useQuery({ queryKey: ['admin-songs'], queryFn: adminFetchSongs })
  const filtered = (songs || []).filter((s) => { if (search) { const q = search.toLowerCase(); const hay = (s.title + ' ' + (s.artistName || '') + ' ' + (s.categoryName || '')).toLowerCase(); if (!hay.includes(q)) return false } if (statusFilter === 'published' && !s.published) return false; if (statusFilter === 'unpublished' && s.published) return false; if (statusFilter === 'featured' && !s.featured) return false; return true })
  const handleTogglePublish = async (song: ApiSong) => { try { await adminUpdateSong(song.id, { published: !song.published }); toast.success(song.published ? 'أُلغي النشر' : 'تم النشر'); queryClient.invalidateQueries({ queryKey: ['admin-songs'] }); queryClient.invalidateQueries({ queryKey: ['home'] }); queryClient.invalidateQueries({ queryKey: ['songs'] }) } catch (e: any) { toast.error(e.message) } }
  const handleDelete = async (song: ApiSong) => { if (!confirm(`حذف "${song.title}" نهائيًا؟`)) return; try { await adminDeleteSong(song.id); toast.success('تم حذف الأغنية'); queryClient.invalidateQueries({ queryKey: ['admin-songs'] }); queryClient.invalidateQueries({ queryKey: ['home'] }); queryClient.invalidateQueries({ queryKey: ['songs'] }) } catch (e: any) { toast.error(e.message) } }
  if (params.songId) { const song = songs?.find((s) => s.id === params.songId); if (song) return <EditSongView song={song} /> }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">إدارة الأغاني</h1><Button onClick={() => navigate('admin-add-song')} size="sm" className="rounded-full gradient-purple text-white"><Plus className="h-4 w-4 ml-1" />إضافة</Button></div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الفنان..." className="h-10 rounded-2xl" />
      <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}><SelectTrigger className="h-10 rounded-2xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="published">منشورة</SelectItem><SelectItem value="unpublished">غير منشورة</SelectItem><SelectItem value="featured">مميزة</SelectItem></SelectContent></Select>
      <div className="text-xs text-muted-foreground">{filtered.length} أغنية</div>
      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : filtered.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">لا توجد أغانٍ مطابقة</p> : (
        <div className="space-y-1">{filtered.map((s) => <div key={s.id} className="group flex items-center gap-2 rounded-xl bg-card/40 p-2"><span className={`h-2 w-2 shrink-0 rounded-full ${s.published ? 'bg-green-500' : 'bg-yellow-500'}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{s.title}</p><p className="truncate text-[10px] text-muted-foreground">{s.artistName || 'غير معروف'} {s.featured ? ' · مميزة' : ''} · {s.playCount} استماع</p></div><button onClick={() => handleTogglePublish(s)} className="rounded-full p-1.5 text-muted-foreground tap-scale hover:bg-accent" aria-label="تبديل النشر">{s.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button><button onClick={() => navigate('admin-edit-song', { songId: s.id })} className="rounded-full p-1.5 text-muted-foreground tap-scale hover:bg-accent" aria-label="تعديل"><Pencil className="h-4 w-4" /></button><button onClick={() => handleDelete(s)} className="rounded-full p-1.5 text-destructive tap-scale hover:bg-destructive/10" aria-label="حذف"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      )}
    </div>
  )
}

function AddSongView() {
  const navigate = useNavStore((s) => s.navigate)
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: adminFetchCategories })
  const { data: artists } = useQuery({ queryKey: ['admin-artists'], queryFn: adminFetchArtists })
  const [form, setForm] = useState({ title: '', artistName: '', artistImage: '', albumTitle: '', audioUrl: '', coverUrl: '', categoryName: '', description: '', lyrics: '', duration: '', keywords: '', published: true, featured: false, rights: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }))
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('اسم الأغنية مطلوب'); return }
    if (!form.audioUrl.trim()) { toast.error('رابط MP3 مطلوب'); return }
    try { new URL(form.audioUrl) } catch { toast.error('رابط صوت غير صالح'); return }
    setSaving(true)
    try {
      await adminCreateSong({ title: form.title.trim(), artistName: form.artistName.trim() || undefined, albumTitle: form.albumTitle.trim() || undefined, audioUrl: form.audioUrl.trim(), coverUrl: form.coverUrl.trim() || undefined, categoryName: form.categoryName.trim() || undefined, description: form.description.trim() || undefined, lyrics: form.lyrics.trim() || undefined, duration: form.duration ? parseInt(form.duration) : undefined, keywords: form.keywords.split(/[،,]/).map((k) => k.trim()).filter(Boolean), published: form.published, featured: form.featured, rights: form.rights.trim() || undefined })
      toast.success('تمت إضافة الأغنية بنجاح')
      queryClient.invalidateQueries({ queryKey: ['admin-songs'] }); queryClient.invalidateQueries({ queryKey: ['home'] }); queryClient.invalidateQueries({ queryKey: ['songs'] })
      navigate('admin-songs')
    } catch (e: any) { toast.error(e.message || 'فشل حفظ الأغنية') }
    finally { setSaving(false) }
  }
  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center gap-2"><button onClick={() => navigate('admin-songs')} className="text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 inline" />الأغاني</button><h1 className="text-lg font-bold">إضافة أغنية جديدة</h1></div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="اسم الأغنية *" required><Input value={form.title} onChange={(e) => set('title', e.target.value)} className="h-11" required /></Field>
        <Field label="اسم الفنان"><Input value={form.artistName} onChange={(e) => set('artistName', e.target.value)} list="artists-list" className="h-11" /><datalist id="artists-list">{artists?.map((a) => <option key={a.id} value={a.name} />)}</datalist></Field>
        <Field label="صورة الفنان (رابط)" help="الصق رابط صورة الفنان الشخصية"><Input value={form.artistImage} onChange={(e) => set('artistImage', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://..." /></Field>
        <Field label="رابط MP3 المباشر *" required><Input value={form.audioUrl} onChange={(e) => set('audioUrl', e.target.value)} dir="ltr" className="h-11 text-left" required /></Field>
        <Field label="رابط صورة الغلاف"><Input value={form.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} dir="ltr" className="h-11 text-left" /></Field>
        <Field label="القسم الموسيقي"><Select value={form.categoryName} onValueChange={(v) => set('categoryName', v === '__none' ? '' : v)}><SelectTrigger className="h-11"><SelectValue placeholder="اختر" /></SelectTrigger><SelectContent><SelectItem value="__none">بدون تصنيف</SelectItem>{categories?.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="اسم الألبوم (اختياري)"><Input value={form.albumTitle} onChange={(e) => set('albumTitle', e.target.value)} className="h-11" /></Field>
        <Field label="المدة (بالثواني - اختياري)"><Input value={form.duration} onChange={(e) => set('duration', e.target.value)} type="number" className="h-11" /></Field>
        <Field label="الوصف (اختياري)"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} /></Field>
        <Field label="كلمات الأغنية (اختياري)"><Textarea value={form.lyrics} onChange={(e) => set('lyrics', e.target.value)} rows={4} /></Field>
        <Field label="الكلمات المفتاحية (افصل بفواصل)"><Input value={form.keywords} onChange={(e) => set('keywords', e.target.value)} className="h-11" /></Field>
        <Field label="حالة النشر"><Switch checked={form.published} onCheckedChange={(c) => set('published', c)} /></Field>
        <Field label="جعل الأغنية مميزة"><Switch checked={form.featured} onCheckedChange={(c) => set('featured', c)} /></Field>
        <Field label="معلومات الحقوق / المصدر"><Input value={form.rights} onChange={(e) => set('rights', e.target.value)} className="h-11" /></Field>
        <Button type="submit" disabled={saving} className="h-12 w-full rounded-2xl gradient-purple text-white text-sm font-bold tap-scale">{saving ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Check className="h-5 w-5 ml-2" />}{saving ? 'جارٍ الحفظ...' : 'إضافة الأغنية إلى التطبيق'}</Button>
      </form>
    </div>
  )
}

function EditSongView({ song }: { song: ApiSong }) {
  const navigate = useNavStore((s) => s.navigate)
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: adminFetchCategories })
  const [form, setForm] = useState({ title: song.title, artistName: song.artistName || '', artistImage: song.artistImage || '', albumTitle: song.albumTitle || '', audioUrl: song.audioUrl, coverUrl: song.coverUrl || '', categoryName: song.categoryName || '', description: song.description || '', lyrics: song.lyrics || '', duration: song.duration ? String(song.duration) : '', keywords: song.keywords.join('، '), published: song.published, featured: song.featured, rights: song.rights || '' })
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }))
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await adminUpdateSong(song.id, { title: form.title.trim(), artistName: form.artistName.trim(), albumTitle: form.albumTitle.trim(), audioUrl: form.audioUrl.trim(), coverUrl: form.coverUrl.trim(), categoryName: form.categoryName, description: form.description.trim(), lyrics: form.lyrics.trim(), duration: form.duration ? parseInt(form.duration) : undefined, keywords: form.keywords.split(/[،,]/).map((k) => k.trim()).filter(Boolean), published: form.published, featured: form.featured, rights: form.rights.trim() })
      toast.success('تم تحديث الأغنية')
      queryClient.invalidateQueries({ queryKey: ['admin-songs'] }); queryClient.invalidateQueries({ queryKey: ['home'] }); queryClient.invalidateQueries({ queryKey: ['songs'] })
      navigate('admin-songs')
    } catch (e: any) { toast.error(e.message) } finally { setSaving(false) }
  }
  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center gap-2"><button onClick={() => navigate('admin-songs')} className="text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 inline" />الأغاني</button><h1 className="text-lg font-bold">تعديل الأغنية</h1></div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="اسم الأغنية *" required><Input value={form.title} onChange={(e) => set('title', e.target.value)} className="h-11" required /></Field>
        <Field label="اسم الفنان"><Input value={form.artistName} onChange={(e) => set('artistName', e.target.value)} className="h-11" /></Field>
        <Field label="صورة الفنان (رابط)" help="الصق رابط صورة الفنان"><Input value={form.artistImage} onChange={(e) => set('artistImage', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://..." /></Field>
        <Field label="رابط MP3 *" required><Input value={form.audioUrl} onChange={(e) => set('audioUrl', e.target.value)} dir="ltr" className="h-11 text-left" required /></Field>
        <Field label="رابط صورة الغلاف"><Input value={form.coverUrl} onChange={(e) => set('coverUrl', e.target.value)} dir="ltr" className="h-11 text-left" /></Field>
        <Field label="القسم الموسيقي"><Select value={form.categoryName || '__none'} onValueChange={(v) => set('categoryName', v === '__none' ? '' : v)}><SelectTrigger className="h-11"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="__none">بدون تصنيف</SelectItem>{categories?.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="اسم الألبوم"><Input value={form.albumTitle} onChange={(e) => set('albumTitle', e.target.value)} className="h-11" /></Field>
        <Field label="المدة (ثوانٍ)"><Input value={form.duration} onChange={(e) => set('duration', e.target.value)} type="number" className="h-11" /></Field>
        <Field label="الوصف"><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} /></Field>
        <Field label="الكلمات"><Textarea value={form.lyrics} onChange={(e) => set('lyrics', e.target.value)} rows={4} /></Field>
        <Field label="الكلمات المفتاحية"><Input value={form.keywords} onChange={(e) => set('keywords', e.target.value)} className="h-11" /></Field>
        <Field label="حالة النشر"><Switch checked={form.published} onCheckedChange={(c) => set('published', c)} /></Field>
        <Field label="مميزة"><Switch checked={form.featured} onCheckedChange={(c) => set('featured', c)} /></Field>
        <Field label="الحقوق/المصدر"><Input value={form.rights} onChange={(e) => set('rights', e.target.value)} className="h-11" /></Field>
        <div className="flex gap-2"><Button type="submit" disabled={saving} className="flex-1 h-12 rounded-2xl gradient-purple text-white">{saving ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Check className="h-5 w-5 ml-2" />}حفظ التعديلات</Button><Button type="button" onClick={() => navigate('admin-songs')} variant="outline" className="rounded-2xl">إلغاء</Button></div>
      </form>
    </div>
  )
}

function Field({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) { return <div><Label className="mb-1.5 block text-sm flex items-center gap-1">{label}{required && <span className="text-destructive">*</span>}</Label>{children}{help && <p className="mt-1 text-[10px] text-muted-foreground">{help}</p>}</div> }

function ArtistsView() {
  const queryClient = useQueryClient()
  const { data: artists, isLoading } = useQuery({ queryKey: ['admin-artists'], queryFn: adminFetchArtists })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editImage, setEditImage] = useState('')
  const [saving, setSaving] = useState(false)

  const openEdit = (a: any) => { setEditingId(a.id); setEditImage(a.image || '') }
  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)
    try {
      await adminUpdateArtist(editingId, { image: editImage.trim() || null })
      toast.success('تم تحديث صورة الفنان')
      queryClient.invalidateQueries({ queryKey: ['admin-artists'] })
      queryClient.invalidateQueries({ queryKey: ['home'] })
      setEditingId(null)
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return <div className="space-y-3">
    <h1 className="text-lg font-bold">إدارة الفنانين</h1>
    <p className="text-xs text-muted-foreground">اضغط على زر القلم لإضافة/تغيير صورة الفنان.</p>
    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : artists?.length ? (
      <div className="space-y-1">
        {artists.map((a) => (
          <div key={a.id} className="group flex items-center gap-3 rounded-xl bg-card/40 p-2.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/30">
              {a.image ? <Image src={a.image} alt={a.name} fill sizes="48px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple text-white text-sm font-bold">{a.name.charAt(0)}</div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{a.name}</p>
              <p className="text-[10px] text-muted-foreground">{a.songCount} أغنية</p>
            </div>
            <button onClick={() => openEdit(a)} className="rounded-full p-1.5 text-primary tap-scale hover:bg-primary/10" aria-label="تعديل الصورة"><Pencil className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    ) : <p className="py-8 text-center text-sm text-muted-foreground">لا يوجد فنانون بعد</p>}

    {/* نافذة تعديل صورة الفنان */}
    <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) setEditingId(null) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل صورة الفنان</DialogTitle>
          <DialogDescription>الصق رابط صورة الفنان الشخصية. ستظهر في قسم الفنانين.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {editImage.trim() && (
            <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-2.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/30">
                <Image src={editImage.trim()} alt="معاينة" fill sizes="64px" className="object-cover" unoptimized />
              </div>
              <p className="text-xs font-semibold">معاينة الصورة</p>
            </div>
          )}
          <Field label="رابط صورة الفنان">
            <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://..." />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingId(null)}>إلغاء</Button>
          <Button onClick={handleSave} disabled={saving} className="gradient-purple text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Check className="h-4 w-4 ml-1" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}

function CategoriesView() {
  const queryClient = useQueryClient()
  const { data: categories } = useQuery({ queryKey: ['admin-categories'], queryFn: adminFetchCategories })
  const [showAdd, setShowAdd] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', description: '', emoji: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCat, setEditCat] = useState({ name: '', description: '', emoji: '', image: '' })
  const [editSaving, setEditSaving] = useState(false)

  const validateImage = (url: string) => { if (!url.trim()) return true; try { const u = new URL(url.trim()); if (!['http:', 'https:'].includes(u.protocol)) { toast.error('يجب أن يبدأ رابط الصورة بـ http أو https'); return false } return true } catch { toast.error('رابط الصورة غير صالح'); return false } }
  const invalidateAll = () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); queryClient.invalidateQueries({ queryKey: ['home'] }); queryClient.invalidateQueries({ queryKey: ['category'] }) }
  const handleAdd = async () => { if (!newCat.name.trim()) { toast.error('الاسم مطلوب'); return } if (!validateImage(newCat.image)) return; setSaving(true); try { await adminCreateCategory({ name: newCat.name.trim(), description: newCat.description.trim() || undefined, emoji: newCat.emoji.trim() || undefined, image: newCat.image.trim() || undefined }); toast.success('تمت إضافة التصنيف'); invalidateAll(); setNewCat({ name: '', description: '', emoji: '', image: '' }); setShowAdd(false) } catch (e: any) { toast.error(e.message) } finally { setSaving(false) } }
  const handleEdit = async () => { if (!editingId) return; if (!editCat.name.trim()) { toast.error('الاسم مطلوب'); return } if (!validateImage(editCat.image)) return; setEditSaving(true); try { await adminUpdateCategory(editingId, { name: editCat.name.trim(), description: editCat.description.trim() || null, emoji: editCat.emoji.trim() || null, image: editCat.image.trim() || null }); toast.success('تم تعديل التصنيف بنجاح'); invalidateAll(); setEditingId(null) } catch (e: any) { toast.error(e.message) } finally { setEditSaving(false) } }
  const openEdit = (c: any) => { setEditingId(c.id); setEditCat({ name: c.name, description: c.description || '', emoji: c.emoji || '', image: c.image || '' }) }
  const handleDelete = async (id: string, name: string) => { if (!confirm(`حذف التصنيف "${name}"؟`)) return; try { await adminDeleteCategory(id); toast.success('تم الحذف'); invalidateAll() } catch (e: any) { toast.error(e.message) } }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">إدارة التصنيفات</h1><Button onClick={() => setShowAdd(true)} size="sm" className="rounded-full gradient-purple text-white"><Plus className="h-4 w-4 ml-1" />إضافة</Button></div>
      <p className="text-xs text-muted-foreground">اضغط على زر القلم لتعديل الاسم أو الصورة لأي تصنيف. تنعكس التغييرات فورًا.</p>
      <div className="space-y-1">{categories?.map((c) => <div key={c.id} className="group flex items-center gap-3 rounded-xl bg-card/40 p-2.5"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/30">{c.image ? <Image src={c.image} alt={c.name} fill sizes="48px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple text-white text-sm font-bold">{c.name.charAt(0)}</div>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.songCount} أغنية</p></div><button onClick={() => openEdit(c)} className="rounded-full p-1.5 text-primary tap-scale hover:bg-primary/10" aria-label="تعديل"><Pencil className="h-4 w-4" /></button><button onClick={() => handleDelete(c.id, c.name)} className="rounded-full p-1.5 text-destructive tap-scale hover:bg-destructive/10" aria-label="حذف"><Trash2 className="h-4 w-4" /></button></div>)}</div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}><DialogContent><DialogHeader><DialogTitle>إضافة تصنيف جديد</DialogTitle><DialogDescription>سيظهر التصنيف في الصفحة الرئيسية مباشرة.</DialogDescription></DialogHeader><CategoryFormFields data={newCat} onChange={setNewCat} /><DialogFooter><Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button><Button onClick={handleAdd} disabled={saving} className="gradient-purple text-white">{saving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : null}إضافة</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={!!editingId} onOpenChange={(o) => { if (!o) setEditingId(null) }}><DialogContent><DialogHeader><DialogTitle>تعديل التصنيف</DialogTitle><DialogDescription>عدّل الاسم أو الصورة أو الرمز. تظهر التغييرات فورًا.</DialogDescription></DialogHeader><CategoryFormFields data={editCat} onChange={setEditCat} /><DialogFooter><Button variant="outline" onClick={() => setEditingId(null)}>إلغاء</Button><Button onClick={handleEdit} disabled={editSaving} className="gradient-purple text-white">{editSaving ? <Loader2 className="h-4 w-4 animate-spin ml-1" /> : <Check className="h-4 w-4 ml-1" />}حفظ التعديلات</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function CategoryFormFields({ data, onChange }: { data: { name: string; description: string; emoji: string; image: string }; onChange: (v: { name: string; description: string; emoji: string; image: string }) => void }) {
  return (
    <div className="space-y-2 py-2">
      <Field label="اسم التصنيف *" required><Input value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} className="h-11" placeholder="مثال: أغاني خليجية" /></Field>
      <Field label="رابط صورة التصنيف" help="الصق رابط صورة يعبر عن التصنيف."><Input value={data.image} onChange={(e) => onChange({ ...data, image: e.target.value })} dir="ltr" className="h-11 text-left" placeholder="https://example.com/image.jpg" /></Field>
      {data.image.trim() && <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-2.5"><div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/30"><Image src={data.image.trim()} alt="معاينة" fill sizes="96px" className="object-cover" unoptimized /></div><div className="min-w-0 flex-1"><p className="text-xs font-semibold">معاينة الصورة</p><p className="truncate text-[10px] text-muted-foreground">{data.name || 'اسم التصنيف'}</p></div></div>}
      <Field label="رمز تعبيري (احتياطي)" help="يُستخدم إن لم تتوفر صورة"><Input value={data.emoji} onChange={(e) => onChange({ ...data, emoji: e.target.value })} className="h-11" placeholder="🎵" /></Field>
      <Field label="الوصف (اختياري)"><Textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value })} rows={2} /></Field>
    </div>
  )
}

// ====== صفحة الإعدادات — تعديل روابط التواصل الاجتماعي ======
function SettingsView() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: adminFetchSettings })
  const [form, setForm] = useState<{
    facebook: { url: string; handle: string }
    whatsapp: { url: string; handle: string }
    instagram: { url: string; handle: string }
    adsense: { publisherId: string; enabled: boolean; scriptUrl: string }
  } | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data && !form) {
      setForm({
        facebook: { url: data.facebook.url, handle: data.facebook.handle },
        whatsapp: { url: data.whatsapp.url, handle: data.whatsapp.handle },
        instagram: { url: data.instagram.url, handle: data.instagram.handle },
        adsense: {
          publisherId: data.adsense?.publisherId || '',
          enabled: data.adsense?.enabled || false,
          scriptUrl: data.adsense?.scriptUrl || 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        },
      })
    }
  }, [data, form])

  const set = (platform: 'facebook' | 'whatsapp' | 'instagram', field: 'url' | 'handle', v: string) => {
    if (!form) return
    setForm({ ...form, [platform]: { ...form[platform], [field]: v } })
  }

  const setAdsense = (field: keyof NonNullable<typeof form>['adsense'], v: string | boolean) => {
    if (!form) return
    setForm({ ...form, adsense: { ...form.adsense, [field]: v } })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    try {
      const res = await adminUpdateSettings(form)
      if (res.ok) {
        toast.success('تم حفظ الإعدادات بنجاح')
        queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
        queryClient.invalidateQueries({ queryKey: ['social-links'] })
      } else {
        toast.error(res.error || 'فشل الحفظ')
      }
    } catch (e: any) {
      toast.error(e?.message || 'خطأ')
    } finally { setSaving(false) }
  }

  if (isLoading || !form) return <div className="flex min-h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>

  return (
    <div className="space-y-4 pb-10">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold">الإعدادات</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* فيسبوك */}
        <div className="rounded-2xl border border-border/40 bg-card/40 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #1877F2, #0a4da8)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5c0-1 .604-1 1-1h3V2.5h-3c-2.757 0-5 2-5 5v2.5H6.5v3.98h2.698v8.02Z"/></svg>
            </div>
            <h2 className="text-sm font-bold">فيسبوك</h2>
          </div>
          <Field label="رابط صفحة فيسبوك">
            <Input value={form.facebook.url} onChange={(e) => set('facebook', 'url', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://facebook.com/..." required />
          </Field>
          <Field label="اسم العرض (Handle)">
            <Input value={form.facebook.handle} onChange={(e) => set('facebook', 'handle', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="MusiX" />
          </Field>
        </div>

        {/* واتساب */}
        <div className="rounded-2xl border border-border/40 bg-card/40 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #25D366, #128C3F)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.585 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <h2 className="text-sm font-bold">واتساب</h2>
          </div>
          <Field label="رابط المحادثة المباشرة" help="الصيغة: https://wa.me/212XXXXXXXXX (بدون + وبدون أصفار محلية)">
            <Input value={form.whatsapp.url} onChange={(e) => set('whatsapp', 'url', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://wa.me/212713416046" required />
          </Field>
          <Field label="رقم الهاتف (للعرض)">
            <Input value={form.whatsapp.handle} onChange={(e) => set('whatsapp', 'handle', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="+212713416046" />
          </Field>
        </div>

        {/* انستقرام */}
        <div className="rounded-2xl border border-border/40 bg-card/40 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B 50%, #8134AF)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </div>
            <h2 className="text-sm font-bold">انستقرام</h2>
          </div>
          <Field label="رابط حساب انستقرام">
            <Input value={form.instagram.url} onChange={(e) => set('instagram', 'url', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://instagram.com/..." required />
          </Field>
          <Field label="اسم المستخدم (Handle)">
            <Input value={form.instagram.handle} onChange={(e) => set('instagram', 'handle', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="el__aouidi_mohamed" />
          </Field>
        </div>

        {/* ====== Google AdSense ====== */}
        <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-indigo-950/20 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700">
                <Megaphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Google AdSense</h2>
                <p className="text-[10px] text-muted-foreground">إعلانات Google على الويب</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="adsense-enabled" className="text-[10px] text-muted-foreground">تفعيل</Label>
              <Switch id="adsense-enabled" checked={form.adsense.enabled} onCheckedChange={(c) => setAdsense('enabled', c)} />
            </div>
          </div>
          <Field label="Publisher ID" help="احصل عليه من https://www.google.com/adsense">
            <Input value={form.adsense.publisherId} onChange={(e) => setAdsense('publisherId', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="ca-pub-1234567890123456" />
          </Field>
          <Field label="Script URL" help="رابط تحميل سكربت AdSense">
            <Input value={form.adsense.scriptUrl} onChange={(e) => setAdsense('scriptUrl', e.target.value)} dir="ltr" className="h-11 text-left" placeholder="https://pagead2.googlesyndication.com/..." />
          </Field>
        </div>

        <Button type="submit" disabled={saving} className="h-12 w-full rounded-2xl gradient-purple text-white text-sm font-bold tap-scale">
          {saving ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Save className="h-5 w-5 ml-2" />}
          {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </form>

      <div className="rounded-2xl border border-border/40 bg-card/30 p-3 text-xs text-muted-foreground">
        <AlertCircle className="mb-1 h-4 w-4 text-primary" />
        <p>تظهر هذه الروابط في قسم «تواصل معي» بصفحة الحساب. التعديلات تُحفظ في قاعدة البيانات وتظهر فورًا لكل المستخدمين.</p>
      </div>
    </div>
  )
}
