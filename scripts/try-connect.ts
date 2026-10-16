import { Client } from 'pg'
import fs from 'fs'

const sql = fs.readFileSync('/tmp/schema.sql', 'utf-8')

async function tryConnect(host: string, port: number, user: string, password: string, label: string) {
  const client = new Client({ host, port, user, password, database: 'postgres', ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    console.log(`✓ ${label}: Connected!`)
    console.log('📜 Creating tables...')
    await client.query('CREATE SCHEMA IF NOT EXISTS "public"')
    await client.query(sql)
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
    console.log('✅ Tables:', res.rows.map((r: any) => r.table_name))
    await client.end()
    return true
  } catch (e: any) {
    console.log(`✗ ${label}: ${e.message}`)
    try { await client.end() } catch {}
    return false
  }
}

async function main() {
  const host = 'aws-0-ap-southeast-2.pooler.supabase.com'
  const port = 6543
  const user = 'postgres.ncyixxgurfrrjyvfipga'
  const passwords = [
    { pw: 'mohamde12345#$', label: 'decoded #$' },
    { pw: 'mohamde12345%23%24', label: 'raw %23%24' },
    { pw: 'Mohamde12345@', label: 'original capital M @' },
    { pw: 'mohamde12345', label: 'plain no special' },
  ]
  for (const { pw, label } of passwords) {
    const ok = await tryConnect(host, port, user, pw, label)
    if (ok) { console.log('🎉 SUCCESS with password:', label); return }
  }
  console.log('\n❌ All password attempts failed')
}
main()
