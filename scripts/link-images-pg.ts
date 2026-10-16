import { Client } from 'pg'

const c = new Client({ host: 'aws-0-ap-southeast-2.pooler.supabase.com', port: 6543, user: 'postgres.ncyixxgurfrrjyvfipga', password: 'mohamde12345#$', database: 'postgres', ssl: { rejectUnauthorized: false } })

const mapping: Record<string, string> = {
  moroccan: '/categories/moroccan.png', raii: '/categories/raii.png', algerian: '/categories/algerian.png',
  shaabi: '/categories/shaabi.png', arabic: '/categories/arabic.png', romantic: '/categories/romantic.png',
  sad: '/categories/sad.png', calm: '/categories/calm.png', classics: '/categories/classics.png',
  classical: '/categories/classical.png', new: '/categories/new.png', mood: '/categories/mood.png',
}

async function main() {
  await c.connect()
  for (const [slug, img] of Object.entries(mapping)) {
    await c.query('UPDATE "Category" SET image=$1 WHERE slug=$2', [img, slug])
    console.log(`✓ ${slug} → ${img}`)
  }
  await c.end()
  console.log('✅ Category images linked')
}
main().catch(e => { console.error(e); process.exit(1) })
