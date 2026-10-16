import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const categories = [
  { name: 'أغاني مغربية', slug: 'moroccan', emoji: '🇲🇦', order: 1, description: 'أجمل الأغاني المغربية' },
  { name: 'راي مغربي وجزائري', slug: 'raii', emoji: '🎸', order: 2, description: 'أغاني الراي' },
  { name: 'أغاني جزائرية', slug: 'algerian', emoji: '🇩🇿', order: 3, description: 'أفضل الأغاني الجزائرية' },
  { name: 'أغاني شعبية', slug: 'shaabi', emoji: '🎭', order: 4, description: 'الموسيقى الشعبية' },
  { name: 'أغاني عربية', slug: 'arabic', emoji: '🌙', order: 5, description: 'أغاني عربية' },
  { name: 'أغاني رومانسية', slug: 'romantic', emoji: '💕', order: 6, description: 'أغانٍ رومانسية' },
  { name: 'أغاني حزينة', slug: 'sad', emoji: '💧', order: 7, description: 'أغانٍ حزينة' },
  { name: 'موسيقى هادئة', slug: 'calm', emoji: '🌙', order: 8, description: 'موسيقى هادئة' },
  { name: 'أغاني قديمة', slug: 'classics', emoji: '📼', order: 9, description: 'أغاني كلاسيكية' },
  { name: 'أغاني كلاسيكية', slug: 'classical', emoji: '🎼', order: 10, description: 'مقطوعات كلاسيكية' },
  { name: 'أغاني جديدة', slug: 'new', emoji: '✨', order: 11, description: 'أحدث الإضافات' },
  { name: 'حسب المزاج', slug: 'mood', emoji: '🎭', order: 12, description: 'حسب مزاجك' },
]

const artists = [
  { name: 'فنان تجريبي', bio: 'فنان تجريبي', country: 'المغرب' },
  { name: 'منيرة تجريبية', bio: 'مغنية تجريبية', country: 'الجزائر' },
]

const songs = [
  { title: 'أغنية تجريبية - MusiX', artistName: 'فنان تجريبي', categoryName: 'أغاني مغربية', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', description: 'أغنية تجريبية', keywords: ['تجريبي', 'مغربية'], duration: 372, published: true, featured: true, rights: 'تجريبي' },
  { title: 'لحن هادئ', artistName: 'منيرة تجريبية', categoryName: 'موسيقى هادئة', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d80?w=600&q=80', description: 'مقطوعة هادئة', keywords: ['هادئ'], duration: 426, published: true, featured: true, rights: 'تجريبي' },
  { title: 'نبض الروح', artistName: 'فنان تجريبي', categoryName: 'أغاني رومانسية', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', description: 'لحن رومانسي', keywords: ['رومانسي'], duration: 348, published: true, featured: false, rights: 'تجريبي' },
  { title: 'أصداء الماضي', artistName: 'منيرة تجريبية', categoryName: 'أغاني قديمة', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverUrl: 'https://images.unsplash.com/photo-1496293455970-f8581b77229d?w=600&q=80', description: 'حنين للماضي', keywords: ['حنين'], duration: 496, published: true, featured: false, rights: 'تجريبي' },
  { title: 'ليالي الشرق', artistName: 'فنان تجريبي', categoryName: 'أغاني عربية', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', coverUrl: 'https://images.unsplash.com/photo-1511670792090-7ece0b935ea7?w=600&q=80', description: 'موسيقى عربية', keywords: ['عربي'], duration: 292, published: true, featured: true, rights: 'تجريبي' },
  { title: 'دمعة حزين', artistName: 'منيرة تجريبية', categoryName: 'أغاني حزينة', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', coverUrl: 'https://images.unsplash.com/photo-1517810564824-e9f1db1d1d1d?w=600&q=80', description: 'لحن حزين', keywords: ['حزين'], duration: 379, published: true, featured: false, rights: 'تجريبي' },
]

async function main() {
  console.log('🌱 بدء التعبئة...')
  for (const c of categories) { await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c }) }
  console.log(`✓ ${categories.length} تصنيف`)
  for (const a of artists) { const e = await db.artist.findFirst({ where: { name: a.name } }); if (!e) await db.artist.create({ data: a }) }
  console.log(`✓ ${artists.length} فنان`)
  let created = 0
  for (const s of songs) {
    const e = await db.song.findFirst({ where: { title: s.title, audioUrl: s.audioUrl } })
    if (e) continue
    let artist = await db.artist.findFirst({ where: { name: s.artistName } })
    if (!artist) artist = await db.artist.create({ data: { name: s.artistName } })
    const cat = await db.category.findFirst({ where: { name: s.categoryName } })
    await db.song.create({ data: { title: s.title, audioUrl: s.audioUrl, coverUrl: s.coverUrl, description: s.description, duration: s.duration, keywords: s.keywords.join(','), published: s.published, featured: s.featured, rights: s.rights, artistId: artist.id, categoryId: cat?.id } })
    created++
  }
  console.log(`✓ ${created} أغنية`)
  console.log('✅ اكتملت')
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => db.$disconnect())
