import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findMemoryCoupon } from '@/lib/coupons';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, total = 0 } = body;

    if (!code) {
      return NextResponse.json(
        { message: 'Código do cupom é obrigatório' },
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
