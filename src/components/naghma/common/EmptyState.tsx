'use client'
import type { ReactNode } from 'react'
export function HScroll({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`no-scrollbar -mx-2 flex gap-2 overflow-x-auto px-2 pb-2 ${className || ''}`}>{children}</div>
}
export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-700/20 text-primary">{icon || <span className="text-3xl">🎵</span>}</div>
      <div><p className="text-sm font-semibold">{title}</p>{description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}</div>
      {action}
    </div>
  )
}
export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="relative h-10 w-10"><div className="absolute inset-0 rounded-full border-2 border-muted" /><div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
    </div>
  )
}
export function SkeletonCard() {
  return <div className="w-40 shrink-0 animate-pulse p-2"><div className="aspect-square w-full rounded-xl bg-muted" /><div className="mt-2 h-3 w-3/4 rounded bg-muted" /><div className="mt-1 h-2 w-1/2 rounded bg-muted" /></div>
}
