import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { message: 'Código do cupom é obrigatório' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

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

    return NextResponse.json({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { message: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}
