'use client'
import { useState } from 'react'
import { Library, Plus, ListMusic, Clock, Heart, Music2, Trash2, Play, WifiOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLibraryStore } from '@/lib/stores/library-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { fetchPlaylists } from '@/lib/api-client'
import { EmptyState, LoadingSpinner } from '@/components/naghma/common/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LibraryPage() {
  const playlists = useLibraryStore((s) => s.playlists)
  const createPlaylist = useLibraryStore((s) => s.createPlaylist)
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist)
  const navigate = useNavStore((s) => s.navigate)
  const favCount = useLibraryStore((s) => s.favoriteIds.length)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const { data: publicPlaylists, isLoading } = useQuery({ queryKey: ['playlists'], queryFn: fetchPlaylists, staleTime: 60000 })

  const handleCreate = () => {
    if (!title.trim()) { toast.error('أدخل اسم القائمة'); return }
    const id = createPlaylist(title.trim()); setTitle(''); setShowCreate(false); toast.success('تم إنشاء القائمة'); navigate('playlist', { playlistId: id })
  }

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <header className="mb-4 flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold gradient-purple-text flex items-center gap-2"><Library className="h-6 w-6 text-primary" />مكتبتي</h1><p className="text-xs text-muted-foreground">قوائمی ومفضلاتي</p></div>
        <Button onClick={() => setShowCreate(true)} size="sm" className="rounded-full gradient-purple text-white"><Plus className="h-4 w-4 ml-1" />قائمة</Button>
      </header>
      <div className="mb-6 grid grid-cols-2 gap-2">
        <button onClick={() => navigate('favorites')} className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-3 text-right tap-scale"><Heart className="h-8 w-8 text-red-500" fill="currentColor" /><div className="text-right"><p className="text-sm font-semibold">المفضلة</p><p className="text-xs text-muted-foreground">{favCount} أغنية</p></div></button>
        <button onClick={() => navigate('assistant')} className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3 text-right tap-scale"><Music2 className="h-8 w-8 text-primary" /><div className="text-right"><p className="text-sm font-semibold">مساعد MusiX</p><p className="text-xs text-muted-foreground">اكتشف أغانٍ</p></div></button>
        <button onClick={() => navigate('downloaded')} className="flex items-center gap-3 rounded-2xl bg-green-500/10 p-3 text-right tap-scale"><WifiOff className="h-8 w-8 text-green-500" /><div className="text-right"><p className="text-sm font-semibold">الأغاني المنزّلة</p><p className="text-xs text-muted-foreground">استمع بدون إنترنت</p></div></button>
      </div>
      <section className="mb-6">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><ListMusic className="h-4 w-4 text-primary" />قوائمي ({playlists.length})</h3>
        {playlists.length === 0 ? <EmptyState title="لا توجد قوائم بعد" action={<Button onClick={() => setShowCreate(true)} className="gradient-purple text-white rounded-full"><Plus className="h-4 w-4 ml-1" />إنشاء قائمة</Button>} /> : (
          <div className="space-y-1">{playlists.map((p) => (
            <div key={p.id} className="group flex items-center gap-3 rounded-2xl bg-card/40 p-2.5 tap-scale">
              <button onClick={() => navigate('playlist', { playlistId: p.id })} className="flex flex-1 items-center gap-3 text-right">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl gradient-purple flex items-center justify-center"><ListMusic className="h-6 w-6 text-white" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">{p.songIds.length} أغنية</p></div>
              </button>
              <button onClick={() => { if (confirm('حذف القائمة؟')) { deletePlaylist(p.id); toast.success('تم الحذف') } }} className="rounded-full p-2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}</div>
        )}
      </section>
      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" />قوائم اختارها المسؤول</h3>
        {isLoading ? <LoadingSpinner /> : publicPlaylists?.length ? <div className="space-y-1">{publicPlaylists.map((p) => <button key={p.id} onClick={() => navigate('playlist', { playlistId: p.id })} className="flex w-full items-center gap-3 rounded-2xl bg-card/40 p-2.5 text-right tap-scale"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl gradient-purple flex items-center justify-center"><Play className="h-6 w-6 text-white" fill="currentColor" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p.title}</p><p className="text-xs text-muted-foreground">{p.songCount || 0} أغنية</p></div></button>)}</div> : <p className="rounded-2xl border border-dashed border-border/40 p-4 text-center text-xs text-muted-foreground">لا توجد قوائم عامة بعد</p>}
      </section>
      <Dialog open={showCreate} onOpenChange={setShowCreate}><DialogContent>
        <DialogHeader><DialogTitle>إنشاء قائمة تشغيل جديدة</DialogTitle><DialogDescription>أدخل اسمًا لقائمتك. ستُحفظ محليًا.</DialogDescription></DialogHeader>
        <div className="py-2"><Label htmlFor="pl-title" className="mb-1.5 block text-sm">اسم القائمة</Label><Input id="pl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: أغاني السفر" className="h-11" autoFocus /></div>
        <DialogFooter><Button variant="outline" onClick={() => setShowCreate(false)}>إلغاء</Button><Button onClick={handleCreate} className="gradient-purple text-white">إنشاء</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  )
}
