'use server'

import { prisma } from './prisma';
import { createOrderSchema } from './validations';
import { trackMetaCapiEvent } from './meta-capi';
import type { MetaCapiUserData } from './meta-capi';

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
  eventId?: string;
  metaUserData?: MetaCapiUserData;
};

type AnalyticsEventType =
  | 'visit'
  | 'product_view'
  | 'search'
  | 'add_to_cart'
  | 'checkout_started'
  | 'add_payment_info'
  | 'coupon_applied'
  | 'whatsapp_click'
  | 'linktree_view'
  | 'linktree_click'
  | 'order_created';

export async function trackEvent(
  type: AnalyticsEventType,
  metadata?: Record<string, unknown>,
  eventId?: string,
  metaUserData?: MetaCapiUserData,
) {
  if (!eventId) eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
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

  // Send to Meta CAPI
  const metaEventName = type === 'add_to_cart' ? 'AddToCart'
    : type === 'checkout_started' ? 'InitiateCheckout'
    : type === 'add_payment_info' ? 'AddPaymentInfo'
    : type === 'coupon_applied' ? 'CouponApplied'
    : type === 'whatsapp_click' ? 'WhatsAppClick'
    : type === 'linktree_view' ? 'LinktreeView'
    : type === 'linktree_click' ? 'LinktreeClick'
    : type === 'order_created' ? 'Purchase'
    : type === 'product_view' ? 'ViewContent'
    : type === 'search' ? 'Search'
    : type === 'visit' ? 'PageView'
    : null;

  if (metaEventName && metaUserData) {
    trackMetaCapiEvent({
      eventName: metaEventName,
      eventId,
      userData: metaUserData,
      customData: metadata as Record<string, unknown> | undefined,
    }).catch(() => {});
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

export async function trackProductView(productId: string, eventId?: string, metaUserData?: MetaCapiUserData) {
  if (!eventId) eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  if (!process.env.DATABASE_URL) return;
  await trackEvent('product_view', { productId }, eventId, metaUserData);

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
  const parsed = createOrderSchema.parse(orderData);

  if (!process.env.DATABASE_URL) {
    return { success: true, orderId: `local-${Date.now()}` };
  }

  try {
    const order = await prisma.order.create({
      data: {
        customerName: parsed.name,
        customerPhone: parsed.phone,
        cep: parsed.cep,
        street: parsed.street,
        number: parsed.number,
        complement: parsed.complement,
        neighborhood: parsed.neighborhood,
        city: parsed.city,
        state: parsed.state,
        paymentMethod: parsed.paymentMethod,
        deliveryMethod: parsed.deliveryMethod || 'DELIVERY',
        observations: parsed.observations,
        subtotal: parsed.subtotal,
        deliveryFee: parsed.deliveryFee,
        discount: parsed.discount,
        total: parsed.total,
        items: {
          create: parsed.items.map((item) => {
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
      transaction_id: order.id,
      total: order.total,
      deliveryMethod: order.deliveryMethod,
      payment_method: order.paymentMethod,
      coupon: parsed.couponCode,
      items: parsed.items.length,
      content_ids: parsed.items.map(i => i.id),
      content_type: 'product',
      currency: 'BRL',
      value: order.total,
      num_items: parsed.items.reduce((count, item) => count + item.quantity, 0),
      contents: parsed.items.map((item) => {
        const selectedAddonIds = item.selectedAddons ?? [];
        const addonsTotal = selectedAddonIds.reduce((acc, addonId) => {
          const addon = item.addons?.find((a) => a.id === addonId);
          return acc + (addon?.price ?? 0);
        }, 0);
        return { id: item.id, quantity: item.quantity, item_price: item.price + addonsTotal };
      }),
    }, orderData.eventId, orderData.metaUserData);
    if (parsed.couponCode) {
      await prisma.coupon.update({
        where: { code: parsed.couponCode },
        data: { usedCount: { increment: 1 } },
      }).catch((e) => console.error('Failed to increment coupon usage:', e));
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

    // Buscar nomes dos produtos (single query instead of N+1)
    const topProductIds = topProductsRaw.map(item => item.productId);
    const topProductsMap = new Map<string, string>();
    if (topProductIds.length > 0) {
        const products = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true }
        });
        products.forEach(p => topProductsMap.set(p.id, p.name));
    }
    const topProducts = topProductsRaw.map(item => ({
        name: topProductsMap.get(item.productId) || 'Desconhecido',
        views: item._count.productId
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
    const dailyOrdersRaw = await prisma.order.findMany({
        where: { createdAt: { gte: last7Days }, status: { not: 'CANCELED' } },
        select: { createdAt: true, total: true }
    });

    // Agrupar por dia (YYYY-MM-DD)
    const dailyOrdersMap = new Map<string, number>();
    dailyOrdersRaw.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        const current = dailyOrdersMap.get(date) || 0;
        dailyOrdersMap.set(date, current + item.total);
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
