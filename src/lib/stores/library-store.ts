'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LocalPlaylist {
  id: string
  title: string
  description?: string
  coverUrl?: string
  songIds: string[]
  createdAt: number
}

interface LibraryState {
  favoriteIds: string[]
  playlists: LocalPlaylist[]
  recentSearches: string[]
  reduceMotion: boolean
  toggleFavorite: (songId: string) => void
  clearFavorites: () => void
  createPlaylist: (title: string, description?: string) => string
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, title: string) => void
  addToPlaylist: (playlistId: string, songId: string) => void
  removeFromPlaylist: (playlistId: string, songId: string) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  setReduceMotion: (b: boolean) => void
}

const uid = () => Math.random().toString(36).slice(2, 11)

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      playlists: [],
      recentSearches: [],
      reduceMotion: false,
      toggleFavorite: (songId) => {
        const cur = get().favoriteIds
        if (cur.includes(songId)) set({ favoriteIds: cur.filter((id) => id !== songId) })
        else set({ favoriteIds: [songId, ...cur] })
      },
      clearFavorites: () => set({ favoriteIds: [] }),
      createPlaylist: (title, description) => {
        const id = uid()
        set({ playlists: [{ id, title, description, songIds: [], createdAt: Date.now() }, ...get().playlists] })
        return id
      },
      deletePlaylist: (id) => set({ playlists: get().playlists.filter((p) => p.id !== id) }),
      renamePlaylist: (id, title) => set({ playlists: get().playlists.map((p) => p.id === id ? { ...p, title } : p) }),
      addToPlaylist: (playlistId, songId) => set({
        playlists: get().playlists.map((p) => p.id === playlistId && !p.songIds.includes(songId) ? { ...p, songIds: [...p.songIds, songId] } : p),
      }),
      removeFromPlaylist: (playlistId, songId) => set({
        playlists: get().playlists.map((p) => p.id === playlistId ? { ...p, songIds: p.songIds.filter((s) => s !== songId) } : p),
      }),
      addRecentSearch: (query) => {
        const q = query.trim(); if (!q) return
        const cur = get().recentSearches.filter((s) => s !== q)
        set({ recentSearches: [q, ...cur].slice(0, 12) })
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      setReduceMotion: (b) => set({ reduceMotion: b }),
    }),
    {
      name: 'musix-library',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        return window.localStorage
      }),
    }
  )
)
