import type { ApiSong } from '@/lib/types'
import type { Track } from '@/lib/stores/player-store'

// حوّل ApiSong إلى Track قابل للتشغيل
// استخدم /api/songs/[id]/stream بدلاً من audioUrl المباشر
// Service Worker يخدّم النسخة المخزّنة عند انقطاع الإنترنت
export function songToTrack(s: ApiSong): Track {
  return {
    id: s.id,
    title: s.title,
    artistName: s.artistName || undefined,
    artistId: s.artistId || undefined,
    albumTitle: s.albumTitle || undefined,
    audioUrl: `/api/songs/${s.id}/stream`, // رابط البث (يعمل أوفلاين عبر Service Worker)
    coverUrl: s.coverUrl || undefined,
    duration: s.duration || undefined,
    categoryId: s.categoryId || undefined,
    categoryName: s.categoryName || undefined,
    lyrics: s.lyrics || undefined,
    description: s.description || undefined,
  }
}

// حوّل قائمة ApiSong إلى قائمة Track
export function songsToTracks(songs: ApiSong[]): Track[] {
  return songs.map(songToTrack)
}
