'use client'

import { Home, Compass, Heart, Library, User } from 'lucide-react'
import { useNavStore, type PageId } from '@/lib/stores/nav-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const items: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'discover', label: 'اكتشف', icon: Compass },
  { id: 'favorites', label: 'المفضلة', icon: Heart },
  { id: 'library', label: 'مكتبتي', icon: Library },
  { id: 'profile', label: 'حسابي', icon: User },
]

export function BottomNav() {
  const page = useNavStore((s) => s.page)
  const navigate = useNavStore((s) => s.navigate)
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 safe-bottom" aria-label="التنقل الرئيسي">
      <div className="bw-glass-strong border-t border-neutral-700/60 px-1.5 py-1.5">
        <div className="mx-auto flex max-w-md items-stretch justify-between">
          {items.map((item) => {
            const active = page === item.id
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => navigate(item.id)} className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 tap-scale" aria-label={item.label} aria-current={active ? 'page' : undefined}>
                <span className={cn('flex h-8 w-12 items-center justify-center rounded-full transition-all', active ? 'text-white' : 'bw-muted')}>
                  <Icon className="h-[1.15rem] w-[1.15rem]" />
                  {active && <motion.span layoutId="nav-active-dot" className="absolute -bottom-0.5 h-1 w-6 rounded-full bw-accent-dot" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                </span>
                <span className={cn('text-[10px] font-medium leading-none', active ? 'text-white' : 'bw-muted')}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
