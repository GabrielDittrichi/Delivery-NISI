import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteMemoryCoupon, updateMemoryCoupon } from '@/lib/coupons';
import { updateCouponSchema } from '@/lib/validations';
import { isJsonTooLarge } from '@/lib/rate-limit';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!process.env.DATABASE_URL) {
      deleteMemoryCoupon(id);
      return NextResponse.json({ message: 'Cupom removido com sucesso' });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cupom removido com sucesso' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { message: 'Erro ao remover cupom' },
      { status: 500 }
    );
  }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      if (isJsonTooLarge(request, 4 * 1024)) {
        return NextResponse.json({ message: 'Payload muito grande' }, { status: 413 });
      }

      const body = await request.json();
      const parsed = updateCouponSchema.safeParse({ ...body, id });

      if (!parsed.success) {
        return NextResponse.json({ message: 'Dados inválidos' }, { status: 400 });
      }

      const { isActive, expiresAt, usageLimit, minOrder, type, value } = parsed.data;

      if (!process.env.DATABASE_URL) {
        const coupon = updateMemoryCoupon(id, {
          ...(typeof isActive === 'boolean' ? { isActive } : {}),
          ...(type ? { type } : {}),
          ...(value !== undefined ? { value } : {}),
          ...(expiresAt !== undefined ? { expiresAt: expiresAt || null } : {}),
          ...(usageLimit !== undefined ? { usageLimit: usageLimit || null } : {}),
          ...(minOrder !== undefined ? { minOrder: minOrder || 0 } : {}),
        });
        return coupon
          ? NextResponse.json(coupon)
          : NextResponse.json({ message: 'Cupom não encontrado' }, { status: 404 });
      }
  
      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          ...(typeof isActive === 'boolean' ? { isActive } : {}),
          ...(type ? { type } : {}),
          ...(value !== undefined ? { value } : {}),
          ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
          ...(usageLimit !== undefined ? { usageLimit: usageLimit || null } : {}),
          ...(minOrder !== undefined ? { minOrder: minOrder || 0 } : {}),
        },
      });
  
      return NextResponse.json(coupon);
    } catch (error) {
      console.error('Error updating coupon:', error);
      return NextResponse.json(
        { message: 'Erro ao atualizar cupom' },
        { status: 500 }
      );
    }
  }
