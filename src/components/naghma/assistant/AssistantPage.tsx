'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Send, ChevronRight, Loader2, Play, Heart, Music2 } from 'lucide-react'
import Image from 'next/image'
import { askAssistant, fetchSongsByIds } from '@/lib/api-client'
import { useNavStore } from '@/lib/stores/nav-store'
import { usePlayerStore } from '@/lib/stores/player-store'
import { useLibraryStore } from '@/lib/stores/library-store'
import { motion } from 'framer-motion'
import type { ApiSong } from '@/lib/types'

interface Msg { role: 'user' | 'assistant'; content: string; songIds?: string[]; ts: number }

const SUGGESTIONS = ['أريد أغاني مغربية جميلة', 'اقترح علي موسيقى هادئة', 'أريد أغاني حزينة', 'اقترح فنانين', 'أغاني رومانسية', 'موسيقى لرحلة طويلة']

export function AssistantPage() {
  const back = useNavStore((s) => s.back)
  const navigate = useNavStore((s) => s.navigate)
  const playTrack = usePlayerStore((s) => s.playTrack)
  const toggleFav = useLibraryStore((s) => s.toggleFavorite)
  const favIds = useLibraryStore((s) => s.favoriteIds)
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: 'أهلًا بك! أنا مساعد MusiX الذكي. اسألني عن أي نوع من الموسيقى وسأقترح لك أغانٍ من قاعدة بيانات MusiX. كيف أساعدك اليوم؟', ts: Date.now() }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentSongIds, setCurrentSongIds] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: suggestedSongs } = useQuery({ queryKey: ['assistant-songs', currentSongIds.join(',')], queryFn: () => fetchSongsByIds(currentSongIds), enabled: currentSongIds.length > 0 })

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, suggestedSongs])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: trimmed, ts: Date.now() }])
    setLoading(true); setCurrentSongIds([])
    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      const res = await askAssistant(trimmed, history)
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, songIds: res.songIds || [], ts: Date.now() }])
      if (res.songIds?.length) setCurrentSongIds(res.songIds)
    } catch { setMessages((m) => [...m, { role: 'assistant', content: 'عذرًا، حدث خطأ. حاول مرة أخرى.', ts: Date.now() }]) }
    finally { setLoading(false) }
  }

  const playSong = (song: ApiSong) => {
    const queue = suggestedSongs || []
    playTrack({ id: song.id, title: song.title, artistName: song.artistName || undefined, artistId: song.artistId || undefined, audioUrl: song.audioUrl, coverUrl: song.coverUrl || undefined, duration: song.duration || undefined, lyrics: song.lyrics || undefined }, queue.map((s) => ({ id: s.id, title: s.title, artistName: s.artistName || undefined, artistId: s.artistId || undefined, audioUrl: s.audioUrl, coverUrl: s.coverUrl || undefined, duration: s.duration || undefined, lyrics: s.lyrics || undefined })))
  }

  return (
    <div className="flex h-[calc(100dvh-64px)] flex-col pt-[calc(env(safe-area-inset-top)+8px)]">
      <header className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-3">
        <button onClick={back} className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>
        <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full gradient-purple pulse-glow"><Sparkles className="h-4 w-4 text-white" /></div><div><h1 className="text-sm font-bold">مساعد MusiX الذكي</h1><p className="text-[10px] text-muted-foreground">يعتمد على الأغاني الموجودة في قاعدة البيانات</p></div></div>
        <div className="w-12" />
      </header>
      <div ref={scrollRef} className="custom-scroll flex-1 overflow-y-auto px-3 py-3">
        <div className="mx-auto max-w-md space-y-3">
          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} suggestedSongs={suggestedSongs?.filter(s => m.songIds?.includes(s.id)) || []} onPlay={playSong} onToggleFav={toggleFav} isFav={(id: string) => favIds.includes(id)} onOpenArtist={(id) => navigate('artist', { artistId: id })} />
          ))}
          {loading && <div className="flex items-center gap-2 self-start rounded-2xl bg-card/60 p-3"><Sparkles className="h-4 w-4 text-primary animate-pulse" /><div className="flex items-end gap-1 h-4">{[0,200,400].map((d) => <span key={d} className="w-1.5 h-full gradient-purple wave-bar rounded-full" style={{ animationDelay: `${d}ms` }} />)}</div><span className="text-xs text-muted-foreground">يفكّر...</span></div>}
          {messages.length <= 1 && !loading && (
            <div className="space-y-2 pt-2"><p className="text-center text-xs text-muted-foreground">جرّب أحد هذه الطلبات</p><div className="flex flex-wrap justify-center gap-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs tap-scale hover:border-primary">{s}</button>)}</div></div>
          )}
        </div>
      </div>
      <div className="border-t border-border/40 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(input) }} placeholder="اكتب طلبك بالعربية..." className="flex-1 rounded-full border border-border/40 bg-card/60 px-4 py-2.5 text-sm outline-none focus:border-primary" disabled={loading} />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-full gradient-purple text-white shadow-lg tap-scale disabled:opacity-40" aria-label="إرسال">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -scale-x-100" />}</button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg, suggestedSongs, onPlay, onToggleFav, isFav, onOpenArtist }: { msg: Msg; suggestedSongs: ApiSong[]; onPlay: (s: ApiSong) => void; onToggleFav: (id: string) => void; isFav: (id: string) => boolean; onOpenArtist: (id: string) => void }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'rounded-2xl rounded-tr-sm gradient-purple text-white' : 'rounded-2xl rounded-tl-sm bg-card/60'}`}>
        {!isUser && <div className="flex items-center gap-1.5 px-3 pt-2 text-[10px] text-muted-foreground"><Sparkles className="h-3 w-3 text-primary" />مساعد MusiX</div>}
        <div className={`whitespace-pre-line p-3 text-sm leading-relaxed ${isUser ? 'px-3 py-2' : ''}`}>{msg.content}</div>
        {!isUser && suggestedSongs.length > 0 && (
          <div className="space-y-1.5 px-2 pb-2">{suggestedSongs.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl bg-background/40 p-1.5">
              <button onClick={() => onPlay(s)} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">{s.coverUrl ? <Image src={s.coverUrl} alt={s.title} fill sizes="40px" className="object-cover" unoptimized /> : <div className="flex h-full w-full items-center justify-center gradient-purple"><Music2 className="h-4 w-4 text-white" /></div>}<div className="absolute inset-0 flex items-center justify-center bg-black/40"><Play className="h-4 w-4 text-white" fill="currentColor" /></div></button>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{s.title}</p><button onClick={() => s.artistId && onOpenArtist(s.artistId)} className="truncate text-[10px] text-muted-foreground hover:text-primary" disabled={!s.artistId}>{s.artistName || 'فنان غير معروف'}</button></div>
              <button onClick={() => onToggleFav(s.id)} className="rounded-full p-1.5 tap-scale" aria-label="مفضلة"><Heart className={`h-3.5 w-3.5 ${isFav(s.id) ? 'text-red-500' : 'text-muted-foreground'}`} fill={isFav(s.id) ? 'currentColor' : 'none'} /></button>
            </div>
          ))}</div>
        )}
      </div>
    </motion.div>
  )
}
