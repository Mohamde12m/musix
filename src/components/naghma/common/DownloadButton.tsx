'use client'

import { useState, useEffect } from 'react'
import { Download, Check, Loader2, Trash2, WifiOff, HardDrive } from 'lucide-react'
import { downloadSong, deleteDownloadedSong, isDownloaded } from '@/lib/downloads'
import type { ApiSong } from '@/lib/types'
import { toast } from 'sonner'

interface Props {
  song: ApiSong
  variant?: 'icon' | 'full'
}

export function DownloadButton({ song, variant = 'icon' }: Props) {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'downloaded'>('idle')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    isDownloaded(song.id).then((d) => setStatus(d ? 'downloaded' : 'idle'))
  }, [song.id])

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (status === 'downloading' || loading) return
    setLoading(true)
    setStatus('downloading')
    const res = await downloadSong(song)
    setLoading(false)
    if (res.ok) {
      setStatus('downloaded')
      toast.success(`تم تنزيل "${song.title}" — متاح بدون إنترنت`)
    } else {
      setStatus('idle')
      toast.error(res.error || 'تعذر التنزيل')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    await deleteDownloadedSong(song.id)
    setStatus('idle')
    toast.success('تم حذف الأغنية من التخزين')
  }

  if (variant === 'full') {
    return (
      <button
        onClick={status === 'downloaded' ? handleDelete : handleDownload}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tap-scale ${
          status === 'downloaded'
            ? 'bg-green-500/15 text-green-500'
            : status === 'downloading'
            ? 'bg-muted text-muted-foreground'
            : 'gradient-purple text-white'
        }`}
      >
        {status === 'downloading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === 'downloaded' ? (
          <Check className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {status === 'downloading' ? 'جارٍ التنزيل...' : status === 'downloaded' ? 'متنزّل' : 'تنزيل'}
      </button>
    )
  }

  return (
    <button
      onClick={status === 'downloaded' ? handleDelete : handleDownload}
      className={`rounded-full p-1.5 tap-scale ${
        status === 'downloaded' ? 'text-green-500' : status === 'downloading' ? 'text-muted-foreground' : 'text-primary'
      }`}
      aria-label={status === 'downloaded' ? 'متنزّل - اضغط للحذف' : 'تنزيل'}
      title={status === 'downloaded' ? 'متنزّل - اضغط للحذف' : 'تنزيل للأوفلاين'}
    >
      {status === 'downloading' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === 'downloaded' ? (
        <Check className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </button>
  )
}
