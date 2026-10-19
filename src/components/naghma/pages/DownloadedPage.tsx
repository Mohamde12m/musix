'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Download, Trash2, Play, Shuffle, Music2, HardDrive, ChevronRight } from 'lucide-react'
import { getDownloadedSongs, clearAllDownloads, estimateStorage, deleteDownloadedSong } from '@/lib/downloads'
import { SongCard } from '@/components/naghma/cards/SongCard'
import { EmptyState, LoadingSpinner } from '@/components/naghma/common/EmptyState'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useNavStore } from '@/lib/stores/nav-store'
import { songToTrack } from '@/lib/track-utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ApiSong } from '@/lib/types'

export function DownloadedPage() {
  const [songs, setSongs] = useState<ApiSong[]>([])
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(true)
  const [storage, setStorage] = useState({ usage: 0, quota: 0 })
  const playQueue = usePlayerStore((s) => s.playQueue)
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle)
  const back = useNavStore((s) => s.back)

  const loadSongs = async () => {
    const downloaded = await getDownloadedSongs()
    const sorted = downloaded.sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0))
    const est = await estimateStorage()
    setSongs(sorted)
    setStorage(est)
    setLoading(false)
  }

  useEffect(() => {
    loadSongs()
    setOnline(navigator.onLine)
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const playAll = (shuffle: boolean) => {
    if (songs.length === 0) return
    const tracks = songs.map(songToTrack)
    if (shuffle) { toggleShuffle(); playQueue(tracks, Math.floor(Math.random() * tracks.length)) }
    else playQueue(tracks, 0)
  }

  const handleClearAll = async () => {
    if (!confirm('حذف كل الأغاني المنزّلة؟')) return
    await clearAllDownloads()
    setSongs([])
    toast.success('تم حذف كل التنزيلات')
  }

  const handleDelete = async (songId: string) => {
    await deleteDownloadedSong(songId)
    setSongs(songs.filter(s => s.id !== songId))
    toast.success('تم الحذف')
  }

  const usageMB = (storage.usage / 1024 / 1024).toFixed(1)
  const quotaMB = (storage.quota / 1024 / 1024).toFixed(0)
  const usagePercent = storage.quota > 0 ? Math.min(100, (storage.usage / storage.quota) * 100) : 0

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <ChevronRight className="h-4 w-4 rotate-180" /> رجوع
      </button>

      <header className="mb-4">
        <h1 className="text-2xl font-extrabold gradient-purple-text flex items-center gap-2">
          <WifiOff className="h-6 w-6 text-primary" />
          الأغاني المنزّلة
        </h1>
        <p className="text-xs text-muted-foreground">استمع بدون إنترنت</p>
      </header>

      {/* مؤشر الاتصال */}
      <div className={`mb-4 flex items-center gap-2 rounded-2xl p-3 ${online ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
        <div className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
        <p className="text-xs">
          {online ? 'متصل بالإنترنت — يمكنك تنزيل المزيد' : 'بدون إنترنت — تستمع للأغاني المنزّلة فقط'}
        </p>
      </div>

      {/* مساحة التخزين */}
      {songs.length > 0 && (
        <div className="mb-4 rounded-2xl border border-border/40 bg-card/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <HardDrive className="h-4 w-4 text-primary" />
              المساحة المستخدمة
            </span>
            <span className="text-xs text-muted-foreground">{usageMB} / {quotaMB} ميجابايت</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-purple transition-all" style={{ width: `${usagePercent}%` }} />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">{songs.length} أغنية منزّلة</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="جارٍ تحميل الأغاني المنزّلة" />
      ) : songs.length === 0 ? (
        <EmptyState
          title="لا توجد أغانٍ منزّلة"
          description="تنزّل الأغاني لتستمع إليها بدون إنترنت. اضغط زر 📥 بجانب أي أغنية."
          icon={<Download className="h-8 w-8" />}
        />
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <Button onClick={() => playAll(false)} className="flex-1 rounded-full gradient-purple text-white">
              <Play className="h-4 w-4 ml-1" fill="currentColor" /> تشغيل الكل
            </Button>
            <Button onClick={() => playAll(true)} variant="outline" className="rounded-full">
              <Shuffle className="h-4 w-4 ml-1" /> عشوائي
            </Button>
            <Button onClick={handleClearAll} variant="outline" className="rounded-full text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
            {songs.map((s) => (
              <div key={s.id} className="group relative">
                <SongCard song={s} queue={songs} variant="list" showFavorite={false} />
                <button
                  onClick={() => handleDelete(s.id)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-destructive/20 p-1.5 text-destructive opacity-0 group-hover:opacity-100"
                  aria-label="حذف من التنزيلات"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
