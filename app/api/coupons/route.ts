import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMemoryCoupon, getMemoryCoupons } from '@/lib/coupons';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(getMemoryCoupons());
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar cupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, isActive, expiresAt, usageLimit, minOrder } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { message: 'Dados inválidos' },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      try {
        const coupon = createMemoryCoupon({
          code,
          type,
          value: Number(value),
          isActive,
          expiresAt: expiresAt || null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          minOrder: Number(minOrder || 0),
        });
        return NextResponse.json(coupon);
      } catch (error) {
        if (error instanceof Error && error.message === 'DUPLICATE_COUPON') {
          return NextResponse.json(
            { message: 'Já existe um cupom com este código' },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: 'Já existe um cupom com este código' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        isActive: isActive ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        minOrder: Number(minOrder || 0),
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { message: 'Erro ao criar cupom' },
      { status: 500 }
    );
  }
}
