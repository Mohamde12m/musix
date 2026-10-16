import { Client } from 'pg'
import fs from 'fs'

const URL = process.argv[2] || process.env.DATABASE_URL || ''
if (!URL) { console.error('No URL provided'); process.exit(1) }

async function main() {
  const sql = fs.readFileSync('/tmp/schema.sql', 'utf-8')
  console.log('🔗 Connecting to:', URL.replace(/:[^:@]+@/, ':***@'))
  const client = new Client({ connectionString: URL, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    console.log('✓ Connected')
    console.log('📜 Executing schema SQL...')
    await client.query('CREATE SCHEMA IF NOT EXISTS "public"')
    await client.query(sql)
    console.log('✅ Tables created')
    // Verify
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
    console.log('Tables:', res.rows.map((r: any) => r.table_name))
  } catch (e: any) {
    console.error('✗ Error:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}
main()
