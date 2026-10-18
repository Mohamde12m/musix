'use client'

import { create } from 'zustand'

interface EarningsState {
  points: number
  balance: number
  recentEarned: number  // آخر نقاط كُسبت (للحركة)
  showAnimation: boolean
  totalSongs: number
  setPoints: (p: number, balance: number, songs: number) => void
  triggerAnimation: (points: number) => void
  clearAnimation: () => void
  reset: () => void
}

export const useEarningsStore = create<EarningsState>((set) => ({
  points: 0,
  balance: 0,
  recentEarned: 0,
  showAnimation: false,
  totalSongs: 0,
  setPoints: (p, balance, songs) => set({ points: p, balance, totalSongs: songs }),
  triggerAnimation: (points) => set({ recentEarned: points, showAnimation: true }),
  clearAnimation: () => set({ showAnimation: false, recentEarned: 0 }),
  reset: () => set({ points: 0, balance: 0, recentEarned: 0, showAnimation: false, totalSongs: 0 }),
}))
