'use client'

import { ChevronLeft } from 'lucide-react'
export function SectionHeader({ title, subtitle, onSeeAll, icon }: { title: string; subtitle?: string; onSeeAll?: () => void; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2 px-1">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">{icon}<h2 className="truncate text-base font-bold sm:text-lg">{title}</h2></div>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {onSeeAll && <button onClick={onSeeAll} className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-primary tap-scale hover:bg-primary/10">عرض الكل<ChevronLeft className="h-3.5 w-3.5" /></button>}
    </div>
  )
}
