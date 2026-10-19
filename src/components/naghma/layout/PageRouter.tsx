'use client'
import { useNavStore, type PageId } from '@/lib/stores/nav-store'
import { HomePage } from '@/components/naghma/home/HomePage'
import { DiscoverPage } from '@/components/naghma/pages/DiscoverPage'
import { SearchPage } from '@/components/naghma/pages/SearchPage'
import { FavoritesPage } from '@/components/naghma/pages/FavoritesPage'
import { LibraryPage } from '@/components/naghma/pages/LibraryPage'
import { ProfilePage } from '@/components/naghma/pages/ProfilePage'
import { SettingsPage } from '@/components/naghma/pages/SettingsPage'
import { SongDetailPage } from '@/components/naghma/pages/SongDetailPage'
import { ArtistDetailPage } from '@/components/naghma/pages/ArtistDetailPage'
import { CategoryDetailPage } from '@/components/naghma/pages/CategoryDetailPage'
import { PlaylistDetailPage } from '@/components/naghma/pages/PlaylistDetailPage'
import { DownloadedPage } from '@/components/naghma/pages/DownloadedPage'
import { AssistantPage } from '@/components/naghma/assistant/AssistantPage'
import { AdminLogin } from '@/components/naghma/admin/AdminLogin'
import { AdminApp } from '@/components/naghma/admin/AdminApp'
import { motion, AnimatePresence } from 'framer-motion'

export function PageRouter() {
  const page = useNavStore((s) => s.page)
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <AnimatePresence mode="wait">
        <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {renderPage(page)}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

function renderPage(page: PageId) {
  switch (page) {
    case 'home': return <HomePage />
    case 'discover': return <DiscoverPage />
    case 'search': return <SearchPage />
    case 'favorites': return <FavoritesPage />
    case 'library': return <LibraryPage />
    case 'profile': return <ProfilePage />
    case 'settings': return <SettingsPage />
    case 'song': return <SongDetailPage />
    case 'artist': return <ArtistDetailPage />
    case 'category': return <CategoryDetailPage />
    case 'playlist': return <PlaylistDetailPage />
    case 'downloaded': return <DownloadedPage />
    case 'assistant': return <AssistantPage />
    case 'admin-login': return <AdminLogin />
    case 'admin-dashboard': case 'admin-songs': case 'admin-add-song': case 'admin-edit-song': case 'admin-artists': case 'admin-categories': return <AdminApp />
    default: return <HomePage />
  }
}
