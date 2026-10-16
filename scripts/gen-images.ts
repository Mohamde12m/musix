import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const catDir = path.join(process.cwd(), 'public', 'categories')
const artDir = path.join(process.cwd(), 'public', 'artists')
if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true })
if (!fs.existsSync(artDir)) fs.mkdirSync(artDir, { recursive: true })

const cats = [
  { slug: 'moroccan', file: 'moroccan.png', prompt: 'Moroccan Gnawa musicians playing traditional instruments, zellige mosaic background, purple and gold, warm lantern light, artistic illustration, high quality' },
  { slug: 'raii', file: 'raii.png', prompt: 'Passionate Rai music singer with microphone, guitar and accordion, North African street concert at dusk, warm orange and purple, artistic illustration' },
  { slug: 'algerian', file: 'algerian.png', prompt: 'Algerian singer in traditional dress, Algiers Casbah architecture background, Sahara sunset, deep purple and amber, cinematic illustration' },
  { slug: 'shaabi', file: 'shaabi.png', prompt: 'Lively Arabic Shaabi folk street party, people celebrating, tabla drum and ney flute, warm festive lights, purple and gold, artistic illustration' },
  { slug: 'arabic', file: 'arabic.png', prompt: 'Oud lute player under crescent moon, desert night with stars and dunes, deep purple sky, elegant Eastern atmosphere, cinematic illustration' },
  { slug: 'romantic', file: 'romantic.png', prompt: 'Romantic candlelit scene with roses, soft bokeh lights, violin, warm purple and pink tones, elegant, high quality illustration' },
  { slug: 'sad', file: 'sad.png', prompt: 'Melancholic rainy window with raindrops, solitary silhouette, moody deep blue and purple tones, emotional, cinematic illustration' },
  { slug: 'calm', file: 'calm.png', prompt: 'Serene zen lake at dawn, soft mist, lily pads, mountains, soft purple and pastel tones, tranquil, high quality illustration' },
  { slug: 'classics', file: 'classics.png', prompt: 'Vintage retro cassette tape and vinyl record, 1970s nostalgic atmosphere, warm purple and amber, retro analog, high quality illustration' },
  { slug: 'classical', file: 'classical.png', prompt: 'Golden grand piano, violin and cello, elegant opera hall, sheet music, deep purple curtains, sophisticated, high quality illustration' },
  { slug: 'new', file: 'new.png', prompt: 'Glowing neon music waveform, vibrant electric purple and cyan, futuristic abstract, fresh energy, sparkles, high quality digital art' },
  { slug: 'mood', file: 'mood.png', prompt: 'Abstract emotional spectrum, colorful swirling gradient of moods, deep purple base with rainbow accents, artistic, high quality digital art' },
]

const artists = [
  { file: 'default.png', name: null, prompt: 'Stylish artistic silhouette of a music artist holding microphone, deep purple gradient background, elegant mysterious, professional portrait, digital art illustration' },
]

async function main() {
  const zai = await ZAI.create()
  console.log('🎨 توليد صور التصنيفات...')
  for (const c of cats) {
    const p = path.join(catDir, c.file)
    if (fs.existsSync(p)) { console.log(`↻ ${c.slug}`); continue }
    try {
      console.log(`▶ ${c.slug}`)
      const res = await zai.images.generations.create({ prompt: c.prompt, size: '1024x1024' })
      fs.writeFileSync(p, Buffer.from(res.data[0].base64, 'base64'))
      const cat = await db.category.findUnique({ where: { slug: c.slug } })
      if (cat) { await db.category.update({ where: { slug: c.slug }, data: { image: `/categories/${c.file}` } }); console.log(`🔗 ${c.slug}`) }
    } catch (e: any) { console.error(`✗ ${c.slug}: ${e.message}`) }
  }
  console.log('🎨 توليد صور الفنانين...')
  for (const a of artists) {
    const p = path.join(artDir, a.file)
    if (fs.existsSync(p)) { console.log(`↻ ${a.file}`); continue }
    try {
      console.log(`▶ ${a.file}`)
      const res = await zai.images.generations.create({ prompt: a.prompt, size: '1024x1024' })
      fs.writeFileSync(p, Buffer.from(res.data[0].base64, 'base64'))
      console.log(`✓ ${a.file}`)
    } catch (e: any) { console.error(`✗ ${a.file}: ${e.message}`) }
  }
  console.log('✅ اكتمل')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
