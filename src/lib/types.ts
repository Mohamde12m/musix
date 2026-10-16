// MusiX - shared types
export interface ApiSong {
  id: string
  title: string
  artistId: string | null
  artistName: string | null
  artistImage: string | null
  albumId: string | null
  albumTitle: string | null
  audioUrl: string
  coverUrl: string | null
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  description: string | null
  lyrics: string | null
  duration: number | null
  keywords: string[]
  published: boolean
  featured: boolean
  playCount: number
  rights: string | null
  createdAt: string
}

export interface ApiArtist {
  id: string
  name: string
  image: string | null
  bio: string | null
  country: string | null
  songCount: number
  createdAt: string
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  emoji: string | null
  order: number
  songCount: number
}

export interface ApiAlbum {
  id: string
  title: string
  artistId: string | null
  artistName: string | null
  coverUrl: string | null
  year: number | null
  songCount: number
}

export interface ApiPlaylist {
  id: string
  title: string
  description: string | null
  coverUrl: string | null
  isPublic: boolean
  createdAt: string
  songCount?: number
}

export interface PlayerTrack {
  id: string
  title: string
  artistName?: string
  artistId?: string
  albumTitle?: string
  albumId?: string
  audioUrl: string
  coverUrl?: string
  duration?: number
  categoryId?: string
  categoryName?: string
  lyrics?: string
  description?: string
}
