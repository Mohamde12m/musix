import { Client } from 'pg'
const c = new Client({host:'aws-0-ap-southeast-2.pooler.supabase.com',port:6543,user:'postgres.ncyixxgurfrrjyvfipga',password:'mohamde12345#$',database:'postgres',ssl:{rejectUnauthorized:false}})
async function main() {
  await c.connect()
  await c.query(`CREATE TABLE IF NOT EXISTS "Ad" ("id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "imageUrl" TEXT, "linkUrl" TEXT NOT NULL, "position" TEXT NOT NULL DEFAULT 'home', "active" BOOLEAN NOT NULL DEFAULT true, "clicks" INTEGER NOT NULL DEFAULT 0, "impressions" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await c.query(`CREATE INDEX IF NOT EXISTS "Ad_active_idx" ON "Ad"("active")`)
  console.log('✓ Ad table created')
  await c.end()
}
main().catch(e=>{console.error(e);process.exit(1)})
