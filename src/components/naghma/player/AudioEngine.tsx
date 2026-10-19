'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore, getAudioEl, setAudioEl } from '@/lib/stores/player-store'
import { useEarningsStore } from '@/lib/stores/earnings-store'
import { isDownloaded } from '@/lib/downloads'
import { recordPlay } from '@/lib/api-client'

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const next = usePlayerStore((s) => s.next)
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
  const setDuration = usePlayerStore((s) => s.setDuration)
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying)
  const setLoading = usePlayerStore((s) => s.setLoading)
  const setError = usePlayerStore((s) => s.setError)
  const queue = usePlayerStore((s) => s.queue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const lastRecordedId = useRef<string | null>(null)

  useEffect(() => {
    const el = new Audio()
    el.preload = 'metadata'
    audioRef.current = el
    setAudioEl(el)
    return () => { el.pause(); el.src = ''; setAudioEl(null) }
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrentTime(el.currentTime)
    const onMeta = () => { if (isFinite(el.duration)) setDuration(el.duration) }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)
    const onError = () => { setError('تعذر تشغيل الأغنية. قد يكون الرابط غير صالح.'); setLoading(false); setIsPlaying(false) }
    const onEnded = () => {
      // منح نقاط للمستخدم المسجل عند إكمال الأغنية
      const track = queue[currentIndex]
      if (track) {
        fetch('/api/earnings/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: track.id, songTitle: track.title })
        }).then(res => res.json()).then(data => {
          if (data.ok && data.points > 0) {
            useEarningsStore.getState().triggerAnimation(data.points)
            useEarningsStore.getState().setPoints(data.balance, data.balance, data.totalSongsListened)
          }
        }).catch(() => {})
      }
      next(true)
    }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    el.addEventListener('play', onPlay)
    el.addEventListener('playing', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('waiting', onWaiting)
    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('error', onError)
    el.addEventListener('ended', onEnded)
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => { el.play().catch(() => {}) })
        navigator.mediaSession.setActionHandler('pause', () => el.pause())
        navigator.mediaSession.setActionHandler('previoustrack', () => next(false))
        navigator.mediaSession.setActionHandler('nexttrack', () => next(true))
      } catch {}
    }
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('playing', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('waiting', onWaiting)
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('error', onError)
      el.removeEventListener('ended', onEnded)
    }
  }, [next, setCurrentTime, setDuration, setIsPlaying, setLoading, setError])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = volume
    el.muted = muted
  }, [volume, muted])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const track = queue[currentIndex]
    if (track && track.audioUrl && !el.src) { el.src = track.audioUrl; el.load() }
  }, [queue, currentIndex])

  useEffect(() => {
    const track = queue[currentIndex]
    if (!track || lastRecordedId.current === track.id) return
    lastRecordedId.current = track.id
    recordPlay(track.id).catch(() => {})
  }, [queue, currentIndex])

  return null
}
