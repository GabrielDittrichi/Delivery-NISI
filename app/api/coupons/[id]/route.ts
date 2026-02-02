import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      const body = await request.json();
      const { isActive } = body;
  
      const coupon = await prisma.coupon.update({
        where: { id },
        data: { isActive },
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
