import { PrismaClient } from '@prisma/client'

// رابط Supabase المباشر — كلمة المرور mohamde12345#$ (# مشفّرة كـ %23)
const SUPABASE_URL = 'postgresql://postgres.ncyixxgurfrrjyvfipga:mohamde12345%23$@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// استخدم دائمًا رابط Supabase المباشر (تجاوزًا لمشاكل قراءة .env)
const url = SUPABASE_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: { db: { url } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
