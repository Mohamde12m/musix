'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ad {
  id: string
  title: string
  imageUrl: string | null
  linkUrl: string
}

// AdSense Publisher ID — استبدله بمعرّفك من Google AdSense
// مثال: ca-pub-1234567890123456
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || ''

// مكوّن إعلان AdSense (بانر)
export function AdSenseBanner({ slot = 'auto', format = 'auto' }: { slot?: string; format?: string }) {
  if (!ADSENSE_ID) return null
  return (
    <div className="my-3 overflow-hidden rounded-2xl">
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={ADSENSE_ID} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  )
}

// مكوّن إعلان ذاتي (من المسؤول)
export function SelfAd({ position = 'home' }: { position?: string }) {
  const [ads, setAds] = useState<Ad[]>([])
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    fetch(`/api/ads?position=${position}`)
      .then(r => r.json())
      .then(setAds)
      .catch(() => {})
  }, [position])

  if (closed || ads.length === 0) return null
  const ad = ads[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="relative my-3 overflow-hidden rounded-2xl border border-border/40"
      >
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
          {ad.imageUrl ? (
            <div className="relative h-20 w-full overflow-hidden">
              <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white">
                <span className="text-xs font-bold">{ad.title}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary/20 to-violet-700/20 p-3">
              <div className="flex-1">
                <p className="text-sm font-bold">{ad.title}</p>
                <p className="text-[10px] text-muted-foreground">إعلان — MusiX</p>
              </div>
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
          )}
        </a>
        <button
          onClick={() => setClosed(true)}
          className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white"
          aria-label="إغلاق الإعلان"
        >
          <X className="h-3 w-3" />
        </button>
        <span className="absolute right-1 top-1 rounded bg-black/40 px-1.5 py-0.5 text-[8px] text-white/80">إعلان</span>
      </motion.div>
    </AnimatePresence>
  )
}

// مكوّن شامل: يعرض AdSense إذا توفر، وإلا يعرض إعلانًا ذاتيًا
export function AdBanner({ position = 'home' }: { position?: string }) {
  if (ADSENSE_ID) {
    return <AdSenseBanner slot={position} />
  }
  return <SelfAd position={position} />
}
