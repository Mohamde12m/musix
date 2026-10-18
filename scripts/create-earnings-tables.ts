// SQL لإضافة جداول نظام الأرباح على Supabase
import { Client } from 'pg'

const c = new Client({
  host: 'aws-0-ap-southeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.ncyixxgurfrrjyvfipga',
  password: 'mohamde12345#$',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
})

async function main() {
  await c.connect()
  console.log('✓ متصل بـ Supabase')

  // جدول حسابات المستخدمين
  await c.query(`
    CREATE TABLE IF NOT EXISTS "UserAccount" (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0,
      totalSongsListened INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )
  `)
  console.log('✓ جدول UserAccount')

  // جدول سجل الأرباح
  await c.query(`
    CREATE TABLE IF NOT EXISTS "EarningLog" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "songId" TEXT,
      "songTitle" TEXT,
      points INTEGER NOT NULL DEFAULT 0,
      "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "UserAccount"(id) ON DELETE CASCADE
    )
  `)
  console.log('✓ جدول EarningLog')

  // جدول طلبات السحب
  await c.query(`
    CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "userEmail" TEXT,
      "userDisplayName" TEXT,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      "paymentMethod" TEXT,
      "paymentDetails" TEXT,
      "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "processedAt" TIMESTAMP(3),
      FOREIGN KEY ("userId") REFERENCES "UserAccount"(id) ON DELETE CASCADE
    )
  `)
  console.log('✓ جدول WithdrawalRequest')

  // فهارس
  await c.query(`CREATE INDEX IF NOT EXISTS "UserAccount_email_idx" ON "UserAccount"(email)`)
  await c.query(`CREATE INDEX IF NOT EXISTS "EarningLog_userId_idx" ON "EarningLog"("userId")`)
  await c.query(`CREATE INDEX IF NOT EXISTS "WithdrawalRequest_userId_idx" ON "WithdrawalRequest"("userId")`)
  await c.query(`CREATE INDEX IF NOT EXISTS "WithdrawalRequest_status_idx" ON "WithdrawalRequest"(status)`)
  console.log('✓ الفهارس')

  await c.end()
  console.log('✅ تم إنشاء جداول نظام الأرباح على Supabase')
}
main().catch(e => { console.error(e); process.exit(1) })
