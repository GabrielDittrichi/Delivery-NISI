'use server'

import { prisma } from './prisma';

type CartAddon = { id: string; name: string; price: number };
type CartItemInput = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  selectedFlavor?: string;
  selectedAddons?: string[];
  addons?: CartAddon[];
};

type CreateOrderInput = {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  paymentMethod: string;
  deliveryMethod?: 'DELIVERY' | 'PICKUP';
  observations?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  items: CartItemInput[];
};

type AnalyticsEventType = 'visit' | 'product_view' | 'add_to_cart' | 'checkout_started' | 'order_created';

export async function trackEvent(type: AnalyticsEventType, metadata?: Record<string, unknown>) {
  if (!process.env.DATABASE_URL) return;
  try {
    await prisma.analyticsEvent.create({
      data: {
        type,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error(`Failed to track event ${type}:`, error);
  }
}

export async function trackVisit(data: {
  userAgent?: string;
  referer?: string;
  ip?: string;
  platform?: string;
  city?: string;
  country?: string;
}) {
  if (!process.env.DATABASE_URL) return;
  await trackEvent('visit', {
    referer: data.referer || null,
    platform: data.platform || determinePlatform(data.referer),
  });

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
  if (!process.env.DATABASE_URL) return;
  await trackEvent('product_view', { productId });

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

export async function createOrder(orderData: CreateOrderInput) {
  if (!process.env.DATABASE_URL) {
    return { success: true, orderId: `local-${Date.now()}` };
  }

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
        deliveryMethod: orderData.deliveryMethod || 'DELIVERY',
        observations: orderData.observations,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        discount: orderData.discount,
        total: orderData.total,
        items: {
          create: orderData.items.map((item) => {
            const selectedAddonIds = item.selectedAddons ?? [];
            const addonsTotal = selectedAddonIds.reduce((acc, addonId) => {
              const addon = item.addons?.find((a) => a.id === addonId);
              return acc + (addon?.price ?? 0);
            }, 0);

            const unitWithAddons = item.price + addonsTotal;
            const lineTotal = unitWithAddons * item.quantity;

            return {
              productId: item.id,
              productName: item.name,
              quantity: item.quantity,
              price: unitWithAddons, // unit snapshot including addons
              total: lineTotal,
              selectedFlavor: item.selectedFlavor || null,
              selectedAddons: selectedAddonIds.length > 0 ? JSON.stringify(selectedAddonIds) : null,
            };
          }),
        },
      },
    });
    await trackEvent('order_created', {
      orderId: order.id,
      total: order.total,
      deliveryMethod: order.deliveryMethod,
      items: orderData.items.length,
    });
    if (orderData.couponCode) {
      await prisma.coupon.update({
        where: { code: orderData.couponCode },
        data: { usedCount: { increment: 1 } },
      }).catch(() => {});
    }
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, error };
  }
}

export async function getDashboardMetrics() {
    if (!process.env.DATABASE_URL) {
        return {
            revenue: { total: 0, monthly: 0 },
            orders: 0,
            visits: 0,
            funnel: {
                addToCart: 0,
                checkoutStarted: 0,
                orderCreated: 0,
                checkoutConversion: 0,
                cartConversion: 0,
            },
            topProducts: [],
            trafficSources: [],
            dailyRevenue: [],
        };
    }

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
    const addToCartEvents = await prisma.analyticsEvent.count({ where: { type: 'add_to_cart' } });
    const checkoutStartedEvents = await prisma.analyticsEvent.count({ where: { type: 'checkout_started' } });
    const orderCreatedEvents = await prisma.analyticsEvent.count({ where: { type: 'order_created' } });

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
        funnel: {
            addToCart: addToCartEvents,
            checkoutStarted: checkoutStartedEvents,
            orderCreated: orderCreatedEvents,
            checkoutConversion: checkoutStartedEvents > 0 ? orderCreatedEvents / checkoutStartedEvents : 0,
            cartConversion: addToCartEvents > 0 ? orderCreatedEvents / addToCartEvents : 0,
        },
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
