import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const BACKUP_FILE = '/home/z/my-project/upload/musix-backup.json'

// GET /api/admin/backup - تنزيل نسخة احتياطية كـ JSON
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  try {
    const data = await collectBackupData()
    return NextResponse.json(data, { headers: { 'Content-Disposition': 'attachment; filename="musix-backup.json"' } })
  } catch (e: any) {
    return NextResponse.json({ error: 'تعذر التصدير' }, { status: 500 })
  }
}

// POST /api/admin/backup - استيراد نسخة احتياطية من JSON
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 }) }
  try {
    const result = await restoreFromData(body)
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    console.error('restore error', e)
    return NextResponse.json({ error: 'تعذر الاستيراد: ' + e.message }, { status: 500 })
  }
}

// جمع كل البيانات للاحتياط
export async function collectBackupData() {
  const [songs, artists, categories, albums, playlists] = await Promise.all([
    db.song.findMany({ include: { artist: true, album: true, category: true } }),
    db.artist.findMany(),
    db.category.findMany(),
    db.album.findMany(),
    db.playlist.findMany({ include: { songs: { orderBy: { order: 'asc' } } } }),
  ])
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories: categories.map(c => ({ name: c.name, slug: c.slug, description: c.description, image: c.image, emoji: c.emoji, order: c.order })),
    artists: artists.map(a => ({ name: a.name, image: a.image, bio: a.bio, country: a.country })),
    albums: albums.map(a => ({ title: a.title, artistName: a.artistId ? artists.find(ar => ar.id === a.artistId)?.name : null, coverUrl: a.coverUrl, year: a.year })),
    songs: songs.map(s => ({
      title: s.title, artistName: s.artist?.name || null, albumTitle: s.album?.title || null,
      audioUrl: s.audioUrl, coverUrl: s.coverUrl, categoryName: s.category?.name || null,
      description: s.description, lyrics: s.lyrics, duration: s.duration, keywords: s.keywords,
      published: s.published, featured: s.featured, rights: s.rights,
    })),
    playlists: playlists.map(p => ({ title: p.title, description: p.description, coverUrl: p.coverUrl, isPublic: p.isPublic, songs: p.songs.map(ps => ({ title: songs.find(s => s.id === ps.songId)?.title, order: ps.order })) })),
  }
}

// حفظ نسخة احتياطية في ملف (يُستدعى تلقائيًا بعد كل عملية إدارة)
export async function saveBackupToFile() {
  try {
    const data = await collectBackupData()
    const dir = path.dirname(BACKUP_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (e: any) {
    console.error('saveBackupToFile error', e)
    return false
  }
}

// استعادة البيانات من نسخة احتياطية
export async function restoreFromData(data: any) {
  let restored = { categories: 0, artists: 0, albums: 0, songs: 0, playlists: 0 }
  for (const c of (data.categories || [])) {
    const existing = await db.category.findUnique({ where: { slug: c.slug } })
    if (!existing) { await db.category.create({ data: { name: c.name, slug: c.slug, description: c.description, image: c.image, emoji: c.emoji, order: c.order ?? 0 } }); restored.categories++ }
  }
  for (const a of (data.artists || [])) {
    const existing = await db.artist.findFirst({ where: { name: a.name } })
    if (!existing) { await db.artist.create({ data: { name: a.name, image: a.image, bio: a.bio, country: a.country } }); restored.artists++ }
  }
  for (const al of (data.albums || [])) {
    if (!al.title) continue
    let artistId: string | null = null
    if (al.artistName) { const artist = await db.artist.findFirst({ where: { name: al.artistName } }); if (artist) artistId = artist.id }
    const existing = await db.album.findFirst({ where: { title: al.title, artistId } })
    if (!existing) { await db.album.create({ data: { title: al.title, artistId, coverUrl: al.coverUrl, year: al.year } }); restored.albums++ }
  }
  for (const s of (data.songs || [])) {
    const existing = await db.song.findFirst({ where: { title: s.title, audioUrl: s.audioUrl } })
    if (existing) continue
    let artistId: string | null = null
    if (s.artistName) { let artist = await db.artist.findFirst({ where: { name: s.artistName } }); if (!artist) artist = await db.artist.create({ data: { name: s.artistName } }); artistId = artist.id }
    let categoryId: string | null = null
    if (s.categoryName) { const cat = await db.category.findFirst({ where: { name: s.categoryName } }); if (cat) categoryId = cat.id }
    let albumId: string | null = null
    if (s.albumTitle) { let album = await db.album.findFirst({ where: { title: s.albumTitle, artistId } }); if (!album) album = await db.album.create({ data: { title: s.albumTitle, artistId } }); albumId = album.id }
    await db.song.create({ data: { title: s.title, artistId, albumId, categoryId, audioUrl: s.audioUrl, coverUrl: s.coverUrl, description: s.description, lyrics: s.lyrics, duration: s.duration, keywords: s.keywords, published: s.published ?? true, featured: s.featured ?? false, rights: s.rights } })
    restored.songs++
  }
  for (const p of (data.playlists || [])) {
    const existing = await db.playlist.findFirst({ where: { title: p.title } })
    if (existing) continue
    const pl = await db.playlist.create({ data: { title: p.title, description: p.description, coverUrl: p.coverUrl, isPublic: p.isPublic ?? true } })
    let order = 0
    for (const ps of (p.songs || [])) { const song = await db.song.findFirst({ where: { title: ps.title } }); if (song) { await db.playlistSong.create({ data: { playlistId: pl.id, songId: song.id, order: order++ } }) } }
    restored.playlists++
  }
  return restored
}

// استعادة تلقائية من ملف النسخة (إن وُجد والقاعدة فارغة)
export async function autoRestoreIfEmpty() {
  try {
    const songCount = await db.song.count()
    if (songCount > 0) return { restored: false, reason: 'database_not_empty' }
    if (!fs.existsSync(BACKUP_FILE)) return { restored: false, reason: 'no_backup_file' }
    const data = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'))
    const result = await restoreFromData(data)
    console.log('✅ Auto-restored from backup:', result)
    return { restored: true, ...result }
  } catch (e: any) {
    console.error('autoRestoreIfEmpty error', e)
    return { restored: false, error: e.message }
  }
}
