import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await db.song.update({ where: { id }, data: { playCount: { increment: 1 } } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }, { status: 500 }) }
}
