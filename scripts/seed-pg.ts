import { Client } from 'pg'

const HOST = 'aws-0-ap-southeast-2.pooler.supabase.com'
const PORT = 6543
const USER = 'postgres.ncyixxgurfrrjyvfipga'
const PASS = 'mohamde12345#$'

const categories = [
  ['أغاني مغربية', 'moroccan', '🇲🇦', 1, 'أجمل الأغاني المغربية'],
  ['راي مغربي وجزائري', 'raii', '🎸', 2, 'أغاني الراي'],
  ['أغاني جزائرية', 'algerian', '🇩🇿', 3, 'أفضل الأغاني الجزائرية'],
  ['أغاني شعبية', 'shaabi', '🎭', 4, 'الموسيقى الشعبية'],
  ['أغاني عربية', 'arabic', '🌙', 5, 'أغاني عربية'],
  ['أغاني رومانسية', 'romantic', '💕', 6, 'أغانٍ رومانسية'],
  ['أغاني حزينة', 'sad', '💧', 7, 'أغانٍ حزينة'],
  ['موسيقى هادئة', 'calm', '🌙', 8, 'موسيقى هادئة'],
  ['أغاني قديمة', 'classics', '📼', 9, 'أغاني كلاسيكية'],
  ['أغاني كلاسيكية', 'classical', '🎼', 10, 'مقطوعات كلاسيكية'],
  ['أغاني جديدة', 'new', '✨', 11, 'أحدث الإضافات'],
  ['حسب المزاج', 'mood', '🎭', 12, 'حسب مزاجك'],
] as const

const artists = [
  ['فنان تجريبي', 'فنان تجريبي', 'المغرب'],
  ['منيرة تجريبية', 'مغنية تجريبية', 'الجزائر'],
] as const

const songs = [
  ['أغنية تجريبية - MusiX', 'فنان تجريبي', 'أغاني مغربية', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', 'أغنية تجريبية', 'تجريبي,مغربية', 372, true, true],
  ['لحن هادئ', 'منيرة تجريبية', 'موسيقى هادئة', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1518609878373-06d740f60d80?w=600&q=80', 'مقطوعة هادئة', 'هادئ', 426, true, true],
  ['نبض الروح', 'فنان تجريبي', 'أغاني رومانسية', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', 'لحن رومانسي', 'رومانسي', 348, true, false],
  ['أصداء الماضي', 'منيرة تجريبية', 'أغاني قديمة', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.unsplash.com/photo-1496293455970-f8581b77229d?w=600&q=80', 'حنين للماضي', 'حنين', 496, true, false],
  ['ليالي الشرق', 'فنان تجريبي', 'أغاني عربية', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://images.unsplash.com/photo-1511670792090-7ece0b935ea7?w=600&q=80', 'موسيقى عربية', 'عربي', 292, true, true],
  ['دمعة حزين', 'منيرة تجريبية', 'أغاني حزينة', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://images.unsplash.com/photo-1517810564824-e9f1db1d1d1d?w=600&q=80', 'لحن حزين', 'حزين', 379, true, false],
] as const

function rid() { return 'c' + Math.random().toString(36).slice(2, 12).padEnd(10, '0') + Math.random().toString(36).slice(2, 6) }

async function main() {
  const c = new Client({ host: HOST, port: PORT, user: USER, password: PASS, database: 'postgres', ssl: { rejectUnauthorized: false } })
  await c.connect()
  console.log('✓ Connected to Supabase')

  // Categories
  for (const [name, slug, emoji, order, desc] of categories) {
    const exists = await c.query('SELECT id FROM "Category" WHERE slug=$1', [slug])
    if (exists.rows.length === 0) {
      await c.query('INSERT INTO "Category" (id, name, slug, description, emoji, "order", "createdAt") VALUES ($1,$2,$3,$4,$5,$6,NOW())', [rid(), name, slug, desc, emoji, order])
    }
  }
  console.log(`✓ ${categories.length} categories`)

  // Artists
  for (const [name, bio, country] of artists) {
    const exists = await c.query('SELECT id FROM "Artist" WHERE name=$1', [name])
    if (exists.rows.length === 0) {
      await c.query('INSERT INTO "Artist" (id, name, bio, country, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())', [rid(), name, bio, country])
    }
  }
  console.log(`✓ ${artists.length} artists`)

  // Songs
  let sc = 0
  for (const [title, aname, cname, audio, cover, desc, kw, dur, pub, feat] of songs) {
    const exists = await c.query('SELECT id FROM "Song" WHERE title=$1 AND "audioUrl"=$2', [title, audio])
    if (exists.rows.length > 0) continue
    const ar = await c.query('SELECT id FROM "Artist" WHERE name=$1', [aname as string])
    const cat = await c.query('SELECT id FROM "Category" WHERE name=$1', [cname as string])
    await c.query('INSERT INTO "Song" (id, title, "artistId", "categoryId", "audioUrl", "coverUrl", description, keywords, duration, published, featured, "playCount", rights, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0,$12,NOW(),NOW())', [rid(), title, ar.rows[0]?.id, cat.rows[0]?.id, audio, cover, desc, kw, dur, pub, feat, 'تجريبي'])
    sc++
  }
  console.log(`✓ ${sc} songs`)

  await c.end()
  console.log('✅ Seed complete - data is now PERMANENT on Supabase!')
}
main().catch(e => { console.error(e); process.exit(1) })
