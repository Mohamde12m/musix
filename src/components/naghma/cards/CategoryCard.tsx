'use client'

import Image from 'next/image'
import { useNavStore } from '@/lib/stores/nav-store'
import type { ApiCategory } from '@/lib/types'

export function CategoryCard({ category }: { category: ApiCategory }) {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <button onClick={() => navigate('category', { categoryId: category.id })} className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-2xl text-right tap-scale ring-1 ring-border/30">
      {category.image ? (
        <Image src={category.image} alt={category.name} fill sizes="160px" className="object-cover scale-110 transition-transform duration-500 group-hover:scale-125" unoptimized />
      ) : <div className="absolute inset-0 gradient-purple" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="relative flex h-full w-full flex-col justify-end p-3">
        <p className="text-sm font-bold text-white drop-shadow-md line-clamp-1">{category.name}</p>
        {category.songCount > 0 && <p className="text-[10px] text-white/85 drop-shadow">{category.songCount} أغنية</p>}
      </div>
    </button>
  )
}
