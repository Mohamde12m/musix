import { PrismaClient } from '@prisma/client'

// رابط Supabase — يستخدم كاحتياطي إذا لم يكن DATABASE_URL مضبوطًا
const SUPABASE_URL = 'postgresql://postgres.ncyixxgurfrrjyvfipga:mohamde12345%23$@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// أولوية: 1) env var من Vercel، 2) Supabase المضمّن، 3) .env
const envUrl = process.env.DATABASE_URL
const url = (envUrl && !envUrl.startsWith('file:')) ? envUrl : SUPABASE_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: { db: { url } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
