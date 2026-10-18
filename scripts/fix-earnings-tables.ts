import { Client } from 'pg'
const c = new Client({host:'aws-0-ap-southeast-2.pooler.supabase.com',port:6543,user:'postgres.ncyixxgurfrrjyvfipga',password:'mohamde12345#$',database:'postgres',ssl:{rejectUnauthorized:false}})
async function main() {
  await c.connect()
  console.log('✓ متصل')
  // حذف الجداول القديمة (بدون quotes)
  await c.query('DROP TABLE IF EXISTS "WithdrawalRequest" CASCADE').catch(()=>{})
  await c.query('DROP TABLE IF EXISTS "EarningLog" CASCADE').catch(()=>{})
  await c.query('DROP TABLE IF EXISTS "UserAccount" CASCADE').catch(()=>{})
  console.log('✓ حذف الجداول القديمة')
  // إنشاء بالـ quotes الصحيحة
  await c.query(`
    CREATE TABLE "UserAccount" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "password" TEXT NOT NULL,
      "displayName" TEXT NOT NULL,
      "balance" INTEGER NOT NULL DEFAULT 0,
      "totalSongsListened" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )
  `)
  await c.query(`
    CREATE TABLE "EarningLog" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "songId" TEXT,
      "songTitle" TEXT,
      "points" INTEGER NOT NULL DEFAULT 0,
      "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE
    )
  `)
  await c.query(`
    CREATE TABLE "WithdrawalRequest" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "userEmail" TEXT,
      "userDisplayName" TEXT,
      "amount" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "paymentMethod" TEXT,
      "paymentDetails" TEXT,
      "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "processedAt" TIMESTAMP(3),
      FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE CASCADE
    )
  `)
  await c.query('CREATE INDEX IF NOT EXISTS "EarningLog_userId_idx" ON "EarningLog"("userId")')
  await c.query('CREATE INDEX IF NOT EXISTS "WithdrawalRequest_status_idx" ON "WithdrawalRequest"(status)')
  console.log('✓ تم إنشاء الجداول بأسماء أعمدة صحيحة')
  await c.end()
}
main().catch(e=>{console.error(e);process.exit(1)})
