'use client'

import { useEffect, useState, useLayoutEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { AudioEngine } from '@/components/naghma/player/AudioEngine'
import { BottomNav } from '@/components/naghma/layout/BottomNav'
import { MiniPlayer } from '@/components/naghma/layout/MiniPlayer'
import { FullPlayer } from '@/components/naghma/player/FullPlayer'
import { PageRouter } from '@/components/naghma/layout/PageRouter'
import { SplashScreen } from '@/components/naghma/layout/SplashScreen'
import { ServiceWorkerRegister } from '@/components/naghma/layout/ServiceWorkerRegister'
import { useNavStore } from '@/lib/stores/nav-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { AssistantFloatingButton } from '@/components/naghma/assistant/AssistantFloatingButton'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
})

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function AppContent() {
  const page = useNavStore((s) => s.page)
  const isAdminPage = page.startsWith('admin-')
  const queue = usePlayerStore((s) => s.queue)
  const currentIndex = usePlayerStore((s) => s.currentIndex)
  const hasTrack = queue.length > 0 && currentIndex >= 0
  const reduceMotion = useLibraryStore((s) => s.reduceMotion)

  useEffect(() => {
    const url = new URL(window.location.href)
    const songId = url.searchParams.get('song')
    if (songId) useNavStore.getState().navigate('song', { songId })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  return (
    <>
      <AudioEngine />
      <PageRouter />
      {!isAdminPage && hasTrack && <MiniPlayer />}
      {!isAdminPage && <BottomNav />}
      <FullPlayer />
      {!isAdminPage && <AssistantFloatingButton />}
      {!isAdminPage && hasTrack && <div className="h-32" />}
      {!isAdminPage && !hasTrack && <div className="h-20" />}
    </>
  )
}

function AppInner() {
  const [appReady, setAppReady] = useState(false)
  useIsoLayoutEffect(() => {
    if (typeof document !== 'undefined' && document.getElementById('musix-splash-hide')) setAppReady(true)
  }, [])
  return (
    <div className="relative min-h-screen">
      <ServiceWorkerRegister />
      <SplashScreen onDone={() => setAppReady(true)} />
      {appReady && <AppContent />}
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
