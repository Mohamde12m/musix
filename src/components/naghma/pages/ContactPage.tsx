'use client'

import { useState } from 'react'
import { useNavStore } from '@/lib/stores/nav-store'
import { useQuery } from '@tanstack/react-query'
import { fetchSocialLinks } from '@/lib/api-client'
import { ChevronRight, Mail, MessageCircle, Send, Loader2, Facebook, Instagram, MapPin, Phone, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// أيقونة واتساب
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.585 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

export function ContactPage() {
  const back = useNavStore((s) => s.back)
  const { data: socialLinks } = useQuery({ queryKey: ['social-links'], queryFn: fetchSocialLinks, staleTime: 5 * 60_000 })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }
    setSending(true)
    // محاكاة إرسال الرسالة (يمكن استبدالها بـ API حقيقي لاحقاً)
    try {
      // افتح واتساب مع الرسالة
      const text = `مرحباً، أنا ${form.name}%0Aالبريد: ${form.email}%0A%0Aالرسالة:%0A${encodeURIComponent(form.message)}`
      const whatsappUrl = `https://wa.me/212713416046?text=${text}`
      window.open(whatsappUrl, '_blank')
      toast.success('تم تجهيز رسالتك على واتساب!')
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('تعذر إرسال الرسالة')
    } finally { setSending(false) }
  }

  const links = socialLinks || {
    facebook: { url: 'https://www.facebook.com/share/19oiL3PSdL/', name: 'فيسبوك', handle: 'simo.el.awidi' },
    whatsapp: { url: 'https://wa.me/212713416046', name: 'واتساب', handle: '+212713416046' },
    instagram: { url: 'https://www.instagram.com/el__aouidi_mohamed', name: 'انستقرام', handle: 'el__aouidi_mohamed' },
  }

  return (
    <div className="px-3 pb-40 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={back} className="mb-3 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-4 w-4 rotate-180" />رجوع</button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Hero */}
        <div className="rounded-3xl gradient-purple p-6 text-center text-white">
          <h1 className="text-2xl font-extrabold">اتصل بنا</h1>
          <p className="mt-2 text-xs opacity-90">نحن هنا لمساعدتك — تواصل معنا في أي وقت</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 gap-2">
          {/* WhatsApp */}
          <a
            href={links.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 tap-scale"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
              <WhatsAppIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">واتساب</p>
              <p className="text-[11px] text-muted-foreground" dir="ltr">{links.whatsapp.handle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
          </a>

          {/* Facebook */}
          <a
            href={links.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-3 tap-scale"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700">
              <Facebook className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">فيسبوك</p>
              <p className="text-[11px] text-muted-foreground" dir="ltr">{links.facebook.handle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
          </a>

          {/* Instagram */}
          <a
            href={links.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-3 tap-scale"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #F58529, #DD2A7B 50%, #8134AF)' }}>
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">انستقرام</p>
              <p className="text-[11px] text-muted-foreground" dir="ltr">{links.instagram.handle}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground rotate-180" />
          </a>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl border border-border/40 bg-card/40 p-4">
          <h2 className="text-base font-bold">أرسل لنا رسالة</h2>
          <div>
            <Label className="mb-1 block text-sm">الاسم</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11" placeholder="اسمك الكامل" required />
          </div>
          <div>
            <Label className="mb-1 block text-sm">البريد الإلكتروني</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11" placeholder="email@example.com" dir="ltr" required />
          </div>
          <div>
            <Label className="mb-1 block text-sm">الرسالة</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} placeholder="اكتب رسالتك هنا..." required />
          </div>
          <Button type="submit" disabled={sending} className="h-12 w-full rounded-2xl gradient-purple text-white text-sm font-bold">
            {sending ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Send className="h-5 w-5 ml-2" />}
            {sending ? 'جارٍ الإرسال...' : 'إرسال عبر واتساب'}
          </Button>
        </form>

        {/* Response Time */}
        <div className="rounded-2xl bg-card/40 p-3 text-center text-[11px] text-muted-foreground">
          عادةً ما نرد خلال 24 ساعة على رسائلكم
        </div>
      </motion.div>
    </div>
  )
}
