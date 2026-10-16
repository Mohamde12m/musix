'use client'

import { create } from 'zustand'

export type PageId =
  | 'home' | 'discover' | 'favorites' | 'library' | 'profile'
  | 'search' | 'song' | 'artist' | 'category' | 'playlist'
  | 'assistant' | 'settings'
  | 'admin-login' | 'admin-dashboard' | 'admin-songs' | 'admin-add-song'
  | 'admin-edit-song' | 'admin-artists' | 'admin-categories'

export interface NavParams {
  songId?: string
  artistId?: string
  categoryId?: string
  playlistId?: string
}

interface NavState {
  page: PageId
  params: NavParams
  history: { page: PageId; params: NavParams }[]
  fullPlayerOpen: boolean
  navigate: (page: PageId, params?: NavParams) => void
  back: () => void
  setFullPlayer: (open: boolean) => void
}

export const useNavStore = create<NavState>((set, get) => ({
  page: 'home',
  params: {},
  history: [],
  fullPlayerOpen: false,
  navigate: (page, params = {}) => {
    const s = get()
    if (s.page === page && JSON.stringify(s.params) === JSON.stringify(params)) return
    set({
      page, params,
      history: [...s.history, { page: s.page, params: s.params }].slice(-30),
      fullPlayerOpen: false,
    })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
  },
  back: () => {
    const s = get()
    if (s.history.length === 0) { set({ page: 'home', params: {}, fullPlayerOpen: false }); return }
    const last = s.history[s.history.length - 1]
    set({ page: last.page, params: last.params, history: s.history.slice(0, -1), fullPlayerOpen: false })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
  },
  setFullPlayer: (open) => set({ fullPlayerOpen: open }),
}))
