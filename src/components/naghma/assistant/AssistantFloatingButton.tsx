'use client'
import { useNavStore } from '@/lib/stores/nav-store'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export function AssistantFloatingButton() {
  const navigate = useNavStore((s) => s.navigate)
  const page = useNavStore((s) => s.page)
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 1500); return () => clearTimeout(t) }, [])
  if (['search', 'assistant', 'admin-login', 'settings'].includes(page)) return null
  return (
    <AnimatePresence>
      {show && (
        <motion.button initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} onClick={() => navigate('assistant')} className="fixed bottom-[150px] left-3 z-30 flex h-12 w-12 items-center justify-center rounded-full gradient-purple text-white shadow-2xl pulse-glow tap-scale" aria-label="مساعد MusiX">
          <Sparkles className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
