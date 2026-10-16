'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Track {
  id: string
  title: string
  artistName?: string
  artistId?: string
  albumTitle?: string
  audioUrl: string
  coverUrl?: string
  duration?: number
  categoryId?: string
  categoryName?: string
  lyrics?: string
  description?: string
}

export type RepeatMode = 'off' | 'one' | 'all'

interface PlayerState {
  queue: Track[]
  originalQueue: Track[]
  currentIndex: number
  isPlaying: boolean
  isLoading: boolean
  error: string | null
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  shuffle: boolean
  repeat: RepeatMode
  playTrack: (track: Track, queue?: Track[]) => void
  playQueue: (tracks: Track[], startIndex?: number) => void
  togglePlay: () => void
  play: () => void
  pause: () => void
  next: (auto?: boolean) => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setError: (e: string | null) => void
  setLoading: (b: boolean) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setIsPlaying: (b: boolean) => void
}

let audioEl: HTMLAudioElement | null = null
export function getAudioEl() { return audioEl }
export function setAudioEl(el: HTMLAudioElement | null) { audioEl = el }

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function updateMediaSession(track: Track | undefined) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !track) return
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artistName || '',
      album: track.albumTitle || 'MusiX',
      artwork: track.coverUrl ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/png' }] : undefined,
    })
  } catch {}
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [], originalQueue: [], currentIndex: -1,
      isPlaying: false, isLoading: false, error: null,
      currentTime: 0, duration: 0, volume: 0.9, muted: false,
      shuffle: false, repeat: 'off',
      playTrack: (track, queue) => {
        const q = queue && queue.length > 0 ? queue : [track]
        const idx = q.findIndex((t) => t.id === track.id)
        const realIdx = idx === -1 ? 0 : idx
        set({ queue: q, originalQueue: q, currentIndex: realIdx, error: null, isLoading: true })
        updateMediaSession(track)
        const el = getAudioEl()
        if (el) {
          el.src = track.audioUrl
          el.currentTime = 0
          el.play().then(() => {
            set({ isPlaying: true, isLoading: false })
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
          }).catch(() => {
            set({ isPlaying: false, isLoading: false, error: 'تعذر التشغيل تلقائيًا. اضغط زر التشغيل.' })
          })
        }
      },
      playQueue: (tracks, startIndex = 0) => {
        if (tracks.length === 0) return
        const idx = Math.max(0, Math.min(startIndex, tracks.length - 1))
        get().playTrack(tracks[idx], tracks)
      },
      togglePlay: () => {
        const s = get()
        const el = getAudioEl()
        if (!el || s.currentIndex < 0) return
        if (s.isPlaying) {
          el.pause(); set({ isPlaying: false })
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
        } else {
          el.play().then(() => {
            set({ isPlaying: true })
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
          }).catch(() => set({ error: 'تعذر التشغيل' }))
        }
      },
      play: () => {
        const el = getAudioEl()
        if (!el) return
        el.play().then(() => {
          set({ isPlaying: true })
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
        }).catch(() => set({ error: 'تعذر التشغيل' }))
      },
      pause: () => {
        const el = getAudioEl()
        if (!el) return
        el.pause(); set({ isPlaying: false })
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused'
      },
      next: (auto = false) => {
        const s = get()
        if (s.queue.length === 0) return
        if (auto && s.repeat === 'one') {
          const el = getAudioEl()
          if (el) { el.currentTime = 0; el.play().catch(() => {}) }
          return
        }
        let nextIdx: number
        if (s.shuffle) {
          if (s.queue.length === 1) { const el = getAudioEl(); if (el) { el.currentTime = 0; el.play().catch(() => {}) } return }
          do { nextIdx = Math.floor(Math.random() * s.queue.length) } while (nextIdx === s.currentIndex)
        } else {
          nextIdx = s.currentIndex + 1
          if (nextIdx >= s.queue.length) {
            if (s.repeat === 'all' || !auto) nextIdx = 0
            else { get().pause(); return }
          }
        }
        const track = s.queue[nextIdx]
        set({ currentIndex: nextIdx, error: null, isLoading: true, currentTime: 0 })
        updateMediaSession(track)
        const el = getAudioEl()
        if (el) {
          el.src = track.audioUrl; el.currentTime = 0
          el.play().then(() => {
            set({ isPlaying: true, isLoading: false })
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
          }).catch(() => set({ isLoading: false, isPlaying: false }))
        }
      },
      prev: () => {
        const s = get()
        if (s.queue.length === 0) return
        const el = getAudioEl()
        if (el && el.currentTime > 3) { el.currentTime = 0; return }
        let prevIdx = s.currentIndex - 1
        if (prevIdx < 0) prevIdx = s.queue.length - 1
        const track = s.queue[prevIdx]
        set({ currentIndex: prevIdx, error: null, isLoading: true, currentTime: 0 })
        updateMediaSession(track)
        if (el) {
          el.src = track.audioUrl; el.currentTime = 0
          el.play().then(() => {
            set({ isPlaying: true, isLoading: false })
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing'
          }).catch(() => set({ isLoading: false, isPlaying: false }))
        }
      },
      seek: (time) => { const el = getAudioEl(); if (!el) return; el.currentTime = time; set({ currentTime: time }) },
      setVolume: (v) => { const el = getAudioEl(); if (el) { el.volume = v; el.muted = v === 0 } set({ volume: v, muted: v === 0 }) },
      toggleMute: () => { const el = getAudioEl(); if (!el) return; const newMuted = !get().muted; el.muted = newMuted; set({ muted: newMuted }) },
      toggleShuffle: () => {
        const s = get()
        if (!s.shuffle) {
          if (s.queue.length > 1) {
            const current = s.queue[s.currentIndex]
            const rest = s.queue.filter((_, i) => i !== s.currentIndex)
            const shuffled = [current, ...shuffleArray(rest)]
            set({ queue: shuffled, currentIndex: 0, shuffle: true })
          } else set({ shuffle: true })
        } else {
          const current = s.queue[s.currentIndex]
          const originalIdx = s.originalQueue.findIndex((t) => t.id === current.id)
          set({ queue: s.originalQueue, currentIndex: originalIdx === -1 ? 0 : originalIdx, shuffle: false })
        }
      },
      cycleRepeat: () => {
        const order: RepeatMode[] = ['off', 'all', 'one']
        const cur = get().repeat
        set({ repeat: order[(order.indexOf(cur) + 1) % order.length] })
      },
      removeFromQueue: (index) => {
        const s = get()
        if (index < 0 || index >= s.queue.length) return
        const newQueue = s.queue.filter((_, i) => i !== index)
        let newIdx = s.currentIndex
        if (index < s.currentIndex) newIdx -= 1
        if (newQueue.length === 0) { get().pause(); set({ queue: [], originalQueue: [], currentIndex: -1 }); return }
        if (newIdx >= newQueue.length) newIdx = newQueue.length - 1
        if (newIdx < 0) newIdx = 0
        set({ queue: newQueue, currentIndex: newIdx })
      },
      clearQueue: () => { get().pause(); set({ queue: [], originalQueue: [], currentIndex: -1 }) },
      setError: (e) => set({ error: e }),
      setLoading: (b) => set({ isLoading: b }),
      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),
      setIsPlaying: (b) => set({ isPlaying: b }),
    }),
    {
      name: 'musix-player',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        return window.localStorage
      }),
      partialize: (s) => ({
        volume: s.volume, muted: s.muted, shuffle: s.shuffle, repeat: s.repeat,
        queue: s.queue, originalQueue: s.originalQueue, currentIndex: s.currentIndex,
      }),
    }
  )
)

export function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
