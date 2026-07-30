import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMemoryCoupon, getMemoryCoupons } from '@/lib/coupons';
import { createCouponSchema } from '@/lib/validations';
import { isJsonTooLarge } from '@/lib/rate-limit';

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
    if (isJsonTooLarge(request, 4 * 1024)) {
      return NextResponse.json({ message: 'Payload muito grande' }, { status: 413 });
    }

    const body = await request.json();
    const parsed = createCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { code, type, value, isActive, expiresAt, usageLimit, minOrder } = parsed.data;
    const normalizedCode = code.toUpperCase();

    if (!process.env.DATABASE_URL) {
      try {
        const coupon = createMemoryCoupon({
          code: normalizedCode,
          type,
          value,
          isActive,
          expiresAt: expiresAt || null,
          usageLimit: usageLimit || null,
          minOrder: minOrder || 0,
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
      where: { code: normalizedCode },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { message: 'Já existe um cupom com este código' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        type,
        value,
        isActive: isActive ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit || null,
        minOrder: minOrder || 0,
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
