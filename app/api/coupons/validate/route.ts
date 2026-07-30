import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMemoryCoupon } from '@/lib/coupons';
import { isJsonTooLarge, isRateLimited } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    if (isJsonTooLarge(request, 2 * 1024)) {
      return NextResponse.json({ message: 'Payload muito grande' }, { status: 413 });
    }
    if (isRateLimited(request, 'coupon-validate', 30, 60_000)) {
      return NextResponse.json({ message: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
    }

    const body = await request.json();
    const { code, total = 0 } = body;

    if (typeof code !== 'string' || !/^[a-zA-Z0-9_-]{2,40}$/.test(code.trim())) {
      return NextResponse.json(
        { message: 'Código do cupom inválido' },
        { status: 400 }
      );
    }

    const coupon = process.env.DATABASE_URL
      ? await prisma.coupon.findUnique({
          where: {
            code: code.toUpperCase(),
          },
        })
      : findMemoryCoupon(code);

    if (!coupon) {
      return NextResponse.json(
        { message: 'Cupom inválido' },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
        return NextResponse.json(
            { message: 'Este cupom não está mais ativo' },
            { status: 400 }
        );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { message: 'Este cupom está vencido' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { message: 'Este cupom atingiu o limite de usos' },
        { status: 400 }
      );
    }

    if (coupon.minOrder > 0 && Number(total) < coupon.minOrder) {
      return NextResponse.json(
        { message: `Pedido mínimo de R$ ${coupon.minOrder.toFixed(2).replace('.', ',')} para este cupom` },
        { status: 400 }
      );
    }

    return NextResponse.json({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { message: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}
