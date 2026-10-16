import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songToApi } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  const message = body?.message?.toString?.()?.trim()
  if (!message) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })
  const history: { role: string; content: string }[] = Array.isArray(body?.history) ? body.history.slice(-10) : []

  try {
    const songs = await db.song.findMany({ where: { published: true }, include: { artist: true, category: true }, orderBy: { playCount: 'desc' }, take: 200 })
    if (songs.length === 0) {
      return NextResponse.json({
        reply: 'مرحبًا! أنا مساعد MusiX. لا توجد أغانٍ في قاعدة البيانات بعد. ستصلك الأغاني بمجرد أن يضيفها المسؤول من لوحة الإدارة.',
        suggestions: ['تصفح الصفحة الرئيسية', 'اكتشف الفنانين'],
        songIds: [],
      })
    }
    const songList = songs.map((s, i) => `${i + 1}. [ID:${s.id}] "${s.title}" - ${s.artist?.name || 'غير معروف'} | تصنيف: ${s.category?.name || 'عام'}${s.keywords ? ` | كلمات مفتاحية: ${s.keywords}` : ''}`).join('\n')
    const categories = await db.category.findMany()
    const categoryList = categories.map((c) => c.name).join('، ')

    const fallback = async () => {
      const lower = message.toLowerCase()
      const matched = songs.filter((s) => {
        const hay = [s.title, s.artist?.name || '', s.category?.name || '', s.keywords || '', s.lyrics || ''].join(' ').toLowerCase()
        return lower.split(/\s+/).filter((w) => w.length > 2).some((w) => hay.includes(w))
      })
      const picked = matched.slice(0, 6)
      return {
        reply: picked.length > 0 ? `وجدت لك ${picked.length} أغنية تطابق طلبك. يمكنك تشغيلها بالأسفل:` : 'لم أجد نتائج مطابقة في قاعدة البيانات. جرّب صياغة أخرى أو تصفّح التصنيفات.',
        suggestions: ['أغاني مغربية', 'أغاني حزينة', 'موسيقى هادئة', 'اقترح علي فنانين'],
        songIds: picked.map((s) => s.id),
      }
    }

    let reply = ''
    let songIds: string[] = []
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const systemPrompt = `أنت "مساعد MusiX"، مساعد موسيقي عربي ذكي لمنصة "MusiX".
مهمتك مساعدة المستخدم في اكتشاف الأغاني المتوفرة في قاعدة بيانات المنصة فقط.
قواعد صارمة:
- لا تذكر أغنية أو فنانًا أو رابطًا صوتيًا غير موجود في القائمة بالأسفل.
- اقترح من 1 إلى 6 أغانٍ فقط في كل رد.
- ردّ باللغة العربية الفصحى أو الدارجة بحسب لغة المستخدم.
- كن ودودًا ومختصرًا.
التصنيفات المتوفرة: ${categoryList}
الأغاني المتوفرة (معرّفات بين قوسين [ID:...]):
${songList}
عندما تقترح أغانيًا، أرفق في نهاية ردك سطرًا واحدًا يبدأ بـ "RECOMMEND:" متبوعًا بمعرّفات الأغاني مفصولة بفواصل. مثال:
RECOMMEND:abc123,def456
إذا لم تجد أغانٍ مناسبة، لا تُرفق سطر RECOMMEND.`
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          ...history.slice(-6).map((h) => ({ role: h.role === 'assistant' ? ('assistant' as const) : ('user' as const), content: h.content })),
          { role: 'user', content: message },
        ],
        thinking: { type: 'disabled' },
      })
      reply = completion.choices?.[0]?.message?.content || ''
      const m = reply.match(/RECOMMEND:\s*([A-Za-z0-9_,\s]+)/)
      if (m) {
        songIds = m[1].split(',').map((x) => x.trim()).filter(Boolean).slice(0, 6)
        reply = reply.replace(/RECOMMEND:.*$/m, '').trim()
      }
    } catch (e: any) {
      console.error('LLM failed, using fallback:', e?.message)
      const fb = await fallback()
      reply = fb.reply; songIds = fb.songIds
    }
    if (songIds.length === 0) {
      const fb = await fallback()
      if (fb.songIds.length > 0) { songIds = fb.songIds; if (!reply) reply = fb.reply }
    }
    return NextResponse.json({
      reply: reply || 'أهلًا بك في MusiX. كيف يمكنني مساعدتك لاكتشاف الموسيقى اليوم؟',
      suggestions: ['أغاني مغربية', 'موسيقى هادئة', 'اقترح علي فنانين', 'أغاني حزينة'],
      songIds,
    })
  } catch (e: any) {
    console.error('assistant error', e)
    return NextResponse.json({ reply: 'حدث خطأ. حاول مرة أخرى.', songIds: [] }, { status: 500 })
  }
}
