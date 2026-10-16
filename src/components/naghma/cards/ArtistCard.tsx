'use client'

import Image from 'next/image'
import { useNavStore } from '@/lib/stores/nav-store'
import type { ApiArtist } from '@/lib/types'

const DEFAULT_ARTIST_IMAGE = '/artists/default.png'

export function ArtistCard({ artist, variant = 'default' }: { artist: ApiArtist; variant?: 'default' | 'compact' }) {
  const navigate = useNavStore((s) => s.navigate)
  const w = variant === 'compact' ? 'w-28' : 'w-32'
  return (
    <button onClick={() => navigate('artist', { artistId: artist.id })} className={`group ${w} shrink-0 cursor-pointer rounded-2xl p-2 text-right transition-all tap-scale hover:bg-accent/40`}>
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted ring-2 ring-primary/20">
        <Image src={artist.image || DEFAULT_ARTIST_IMAGE} alt={artist.name} fill sizes="128px" className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
      </div>
      <p className="mt-2 truncate text-center text-sm font-semibold">{artist.name}</p>
      {artist.songCount > 0 && <p className="truncate text-center text-xs text-muted-foreground">{artist.songCount} أغنية</p>}
    </button>
  )
}
