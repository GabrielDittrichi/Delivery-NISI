'use server'

import { prisma } from './prisma';

export async function trackVisit(data: {
  userAgent?: string;
  referer?: string;
  ip?: string;
  platform?: string;
  city?: string;
  country?: string;
}) {
  try {
    await prisma.visit.create({
      data: {
        userAgent: data.userAgent || null,
        referer: data.referer || null,
        ip: data.ip || null,
        platform: data.platform || determinePlatform(data.referer),
        city: data.city || null,
        country: data.country || null,
      },
    });
  } catch (error) {
    console.error('Failed to track visit:', error);
  }
}

export async function trackProductView(productId: string) {
  try {
    await prisma.productView.create({
      data: {
        productId,
      },
    });
  } catch (error) {
    console.error('Failed to track product view:', error);
  }
}

export async function createOrder(orderData: any) {
  try {
    const order = await prisma.order.create({
      data: {
        customerName: orderData.name,
        customerPhone: orderData.phone,
        cep: orderData.cep,
        street: orderData.street,
        number: orderData.number,
        complement: orderData.complement,
        neighborhood: orderData.neighborhood,
        city: orderData.city,
        state: orderData.state,
        paymentMethod: orderData.paymentMethod,
        observations: orderData.observations,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        discount: orderData.discount,
        total: orderData.total,
        items: {
            create: orderData.items.map((item: any) => ({
                productId: item.id,
                productName: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity, // Simplificação, idealmente calcula com addons
                selectedFlavor: item.selectedFlavor || null,
                selectedAddons: item.selectedAddons ? JSON.stringify(item.selectedAddons) : null
            }))
        }
      },
    });
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, error };
  }
}

export async function getDashboardMetrics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Faturamento Total
    const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELED' } }
    });

    // Faturamento Mensal
    const monthlyRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: { 
            status: { not: 'CANCELED' },
            createdAt: { gte: startOfMonth }
        }
    });

    // Total Pedidos
    const totalOrders = await prisma.order.count({
        where: { status: { not: 'CANCELED' } }
    });

    // Visitantes Únicos (simplificado por IP ou sessão seria ideal, aqui contagem bruta)
    const totalVisits = await prisma.visit.count();

    // Produtos mais acessados (Top 5)
    const topProductsRaw = await prisma.productView.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5
    });

    // Buscar nomes dos produtos
    const topProducts = await Promise.all(topProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true }
        });
        return { name: product?.name || 'Desconhecido', views: item._count.productId };
    }));

    // Origem do Tráfego
    const trafficSources = await prisma.visit.groupBy({
        by: ['platform'],
        _count: { platform: true },
        orderBy: { _count: { platform: 'desc' } },
        take: 5
    });

    // Pedidos por dia (últimos 7 dias)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const dailyOrdersRaw = await prisma.order.groupBy({
        by: ['createdAt'],
        _sum: { total: true },
        where: { createdAt: { gte: last7Days } }
    });
    
    // Processar para agrupar por dia (YY-MM-DD)
    const dailyOrdersMap = new Map();
    dailyOrdersRaw.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        const current = dailyOrdersMap.get(date) || 0;
        dailyOrdersMap.set(date, current + (item._sum.total || 0));
    });

    const dailyRevenue = Array.from(dailyOrdersMap.entries()).map(([date, total]) => ({ date, total }));

    return {
        revenue: {
            total: totalRevenue._sum.total || 0,
            monthly: monthlyRevenue._sum.total || 0
        },
        orders: totalOrders,
        visits: totalVisits,
        topProducts,
        trafficSources: trafficSources.map(t => ({ name: t.platform || 'Direto', value: t._count.platform })),
        dailyRevenue
    };
}

function determinePlatform(referer?: string): string {
    if (!referer) return 'Direto';
    if (referer.includes('instagram')) return 'Instagram';
    if (referer.includes('facebook')) return 'Facebook';
    if (referer.includes('google')) return 'Google';
    if (referer.includes('tiktok')) return 'TikTok';
    return 'Outros';
}
