'use client'
import { useState, useEffect } from 'react'
import { Shield, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useNavStore } from '@/lib/stores/nav-store'
import { adminLogin, adminCheck } from '@/lib/api-client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AdminLogin() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alreadyAdmin, setAlreadyAdmin] = useState(false)

  useEffect(() => { adminCheck().then((ok) => { if (ok) { setAlreadyAdmin(true); setTimeout(() => navigate('admin-dashboard'), 800) } }) }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { toast.error('أدخل رمز الدخول'); return }
    setLoading(true)
    const res = await adminLogin(password)
    setLoading(false)
    if (res.ok) { toast.success('تم تسجيل الدخول بنجاح'); navigate('admin-dashboard') }
    else { toast.error(res.error || 'فشل الدخول'); setPassword('') }
  }

  if (alreadyAdmin) return <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"><CheckCircle2 className="h-12 w-12 text-primary" /><p className="text-sm font-semibold">أنت مسجّل الدخول بالفعل</p><p className="text-xs text-muted-foreground">جارٍ تحويلك إلى لوحة الإدارة...</p></div>

  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pb-4 overflow-hidden">
        <div className="absolute inset-0 opacity-30"><div className="absolute top-1/4 left-1/4 h-40 w-40 rounded-full bg-primary blur-3xl" /><div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-violet-500 blur-3xl" /></div>
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="relative flex h-20 w-20 items-center justify-center rounded-3xl gradient-purple pulse-glow"><Shield className="h-10 w-10 text-white" /></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative mt-4 text-2xl font-extrabold gradient-purple-text">دخول المسؤول</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative mt-1 text-xs text-muted-foreground">رمز الدخول مطلوب للوصول إلى لوحة الإدارة</motion.p>
      </div>
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onSubmit={handleSubmit} className="glass-strong mx-4 mb-8 rounded-3xl border border-border/40 p-5">
        <div className="space-y-2">
          <Label htmlFor="admin-pwd" className="flex items-center gap-1.5 text-sm"><Lock className="h-4 w-4 text-primary" />رمز الدخول</Label>
          <div className="relative">
            <Input id="admin-pwd" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" className="h-12 rounded-2xl bg-background/60 pr-4 pl-10 text-base" autoFocus dir="ltr" autoComplete="current-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground tap-scale" aria-label={show ? 'إخفاء' : 'إظهار'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <Button type="submit" disabled={loading || !password.trim()} className="mt-4 h-12 w-full rounded-2xl gradient-purple text-white text-sm font-bold tap-scale">{loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Shield className="h-4 w-4 ml-2" />}{loading ? 'جارٍ التحقق...' : 'دخول لوحة الإدارة'}</Button>
        <button type="button" onClick={() => back()} className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground tap-scale"><ArrowRight className="h-3 w-3" />العودة للتطبيق</button>
      </motion.form>
      <p className="px-6 pb-6 text-center text-[10px] text-muted-foreground/60">يتم التحقق من رمز الدخول على الخادم. تُحفظ الجلسة في كوكي httpOnly.</p>
    </div>
  )
}
