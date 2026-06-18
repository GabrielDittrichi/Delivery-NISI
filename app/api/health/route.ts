import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const startedAt = Date.now();
  let database: 'ok' | 'not_configured' | 'error' = 'not_configured';

  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = 'ok';
    } catch {
      database = 'error';
    }
  }

  return NextResponse.json({
    ok: database !== 'error',
    database,
    service: 'espaco-vida-saudavel-nisi',
    latencyMs: Date.now() - startedAt,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

