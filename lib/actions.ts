'use server'

import { prisma } from './prisma';
import { getData, Category, Product, Restaurant } from './db';
import { slugify } from './slugify';
import { addProductSchema, updateProductSchema, addCategorySchema, updateRestaurantSchema } from './validations';
import { revalidatePath } from 'next/cache';
import { requireAdminAuth } from './admin-auth';

export async function getStoreData() {
  return await getData();
}

export async function updateRestaurant(restaurantData: Restaurant) {
  await requireAdminAuth();
  const parsed = updateRestaurantSchema.parse(restaurantData);
  const existingRestaurant = await prisma.restaurant.findFirst();

  if (existingRestaurant) {
    await prisma.restaurant.update({
      where: { id: existingRestaurant.id },
      data: {
        name: parsed.name,
        description: parsed.description,
        rating: parsed.rating,
        deliveryTime: parsed.deliveryTime,
        deliveryFee: parsed.deliveryFee,
        minOrder: parsed.minOrder,
        bannerUrl: parsed.bannerUrl,
        logoUrl: parsed.logoUrl,
        primaryColor: parsed.primaryColor,
        whatsapp: parsed.whatsapp,
        address: parsed.address,
        businessHours: parsed.businessHours,
        institutionalText: parsed.institutionalText,
      },
    });
  } else {
    await prisma.restaurant.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        rating: parsed.rating,
        deliveryTime: parsed.deliveryTime,
        deliveryFee: parsed.deliveryFee,
        minOrder: parsed.minOrder,
        bannerUrl: parsed.bannerUrl,
        logoUrl: parsed.logoUrl,
        primaryColor: parsed.primaryColor,
        whatsapp: parsed.whatsapp,
        address: parsed.address,
        businessHours: parsed.businessHours,
        institutionalText: parsed.institutionalText,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function addCategory(name: string) {
  await requireAdminAuth();
  const { name: validatedName } = addCategorySchema.parse({ name });
  const lastCategory = await prisma.category.findFirst({
    orderBy: { order: 'desc' }
  });
  const newOrder = (lastCategory?.order ?? -1) + 1;

  await prisma.category.create({
    data: {
      name: validatedName,
      order: newOrder
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function moveCategory(id: string, direction: 'up' | 'down') {
  await requireAdminAuth();
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;

  const adjacentCategory = await prisma.category.findFirst({
    where: {
      order: direction === 'up' ? { lt: category.order } : { gt: category.order }
    },
    orderBy: {
      order: direction === 'up' ? 'desc' : 'asc'
    }
  });

  if (adjacentCategory) {
    // Swap orders
    await prisma.$transaction([
      prisma.category.update({
        where: { id: category.id },
        data: { order: adjacentCategory.order }
      }),
      prisma.category.update({
        where: { id: adjacentCategory.id },
        data: { order: category.order }
      })
    ]);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateCategory(category: Category) {
  await requireAdminAuth();
  await prisma.category.update({
    where: { id: category.id },
    data: {
      name: category.name,
      order: category.order,
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function getOrders() {
  if (!process.env.DATABASE_URL) return [];
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  });
  return orders;
}

export async function getCustomers() {
  if (!process.env.DATABASE_URL) return [];

  const orders = await prisma.order.findMany({
    where: { status: { not: 'CANCELED' } },
    orderBy: { createdAt: 'asc' },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              addons: true,
              flavors: true,
            },
          },
        },
      },
    },
  });

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  };

  const normalizeText = (value: string) =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const getTopEntry = (map: Map<string, number>) => {
    const [name, count] = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0] || ['', 0];
    return { name, count };
  };

  type CustomerOrder = (typeof orders)[number];
  type CustomerGroup = {
    phone: string;
    orders: CustomerOrder[];
    totalSpent: number;
    products: Map<string, { name: string; quantity: number; total: number }>;
    categories: Map<string, number>;
    flavors: Map<string, number>;
    addons: Map<string, number>;
    deliveryMethods: Map<string, number>;
  };

  const groups = new Map<string, CustomerGroup>();

  orders.forEach((order) => {
    const phone = normalizePhone(order.customerPhone);
    if (!phone) return;

    const group: CustomerGroup = groups.get(phone) || {
      phone,
      orders: [],
      totalSpent: 0,
      products: new Map(),
      categories: new Map(),
      flavors: new Map(),
      addons: new Map(),
      deliveryMethods: new Map(),
    };

    group.orders.push(order);
    group.totalSpent += order.total;
    group.deliveryMethods.set(order.deliveryMethod, (group.deliveryMethods.get(order.deliveryMethod) || 0) + 1);

    order.items.forEach((item) => {
      const product = group.products.get(item.productName) || { name: item.productName, quantity: 0, total: 0 };
      product.quantity += item.quantity;
      product.total += item.total;
      group.products.set(item.productName, product);

      const categoryName = item.product?.category?.name;
      if (categoryName) {
        group.categories.set(categoryName, (group.categories.get(categoryName) || 0) + item.quantity);
      }

      const selectedFlavorName = item.selectedFlavor
        ? item.product?.flavors.find((flavor) => flavor.id === item.selectedFlavor)?.name || item.selectedFlavor
        : '';
      if (selectedFlavorName) {
        group.flavors.set(selectedFlavorName, (group.flavors.get(selectedFlavorName) || 0) + item.quantity);
      }

      if (item.selectedAddons) {
        try {
          const selectedAddonIds = JSON.parse(item.selectedAddons) as string[];
          selectedAddonIds.forEach((addonId) => {
            const addonName = item.product?.addons.find((addon) => addon.id === addonId)?.name || addonId;
            group.addons.set(addonName, (group.addons.get(addonName) || 0) + item.quantity);
          });
        } catch {
          group.addons.set(item.selectedAddons, (group.addons.get(item.selectedAddons) || 0) + item.quantity);
        }
      }
    });

    groups.set(phone, group);
  });

  const totalRevenue = Array.from(groups.values()).reduce((total, group) => total + group.totalSpent, 0);
  const averageCustomerTicket = groups.size > 0 ? totalRevenue / groups.size : 0;
  const today = new Date();

  return Array.from(groups.values())
    .map((group) => {
      const sortedOrders = group.orders.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const firstOrder = sortedOrders[0];
      const latest = sortedOrders[sortedOrders.length - 1];
      const daysSinceLastOrder = Math.floor((today.getTime() - latest.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const averageTicket = group.totalSpent / group.orders.length;
      const topProduct = Array.from(group.products.values()).sort((a, b) => b.quantity - a.quantity || b.total - a.total)[0] || null;
      const topCategory = getTopEntry(group.categories);
      const topFlavor = getTopEntry(group.flavors);
      const topAddon = getTopEntry(group.addons);
      const preferredDeliveryMethod = getTopEntry(group.deliveryMethods).name || latest.deliveryMethod;
      const productNames = Array.from(group.products.keys()).map(normalizeText).join(' ');
      const categoryNames = Array.from(group.categories.keys()).map(normalizeText).join(' ');
      const behaviorText = `${productNames} ${categoryNames}`;
      const tags: string[] = [];

      if (group.orders.length === 1) tags.push('Novo cliente');
      if (group.orders.length > 1) tags.push('Recorrente');
      if (group.totalSpent >= 200 || group.orders.length >= 5) tags.push('VIP');
      if (averageTicket > averageCustomerTicket && group.orders.length > 1) tags.push('Alto ticket');
      if (daysSinceLastOrder >= 30) tags.push('Inativo');
      else if (daysSinceLastOrder >= 15) tags.push('Quase inativo');
      if (/shake/.test(behaviorText)) tags.push('Comprou shake');
      if (/(empada|pao de queijo|sanduiche|omelete|torta|salgado)/.test(behaviorText)) tags.push('Comprou salgado');
      if (/(cha|detox|turbo|bebida|funcional)/.test(behaviorText)) tags.push('Comprou bebida funcional');
      tags.push(preferredDeliveryMethod === 'PICKUP' ? 'Prefere retirada' : 'Prefere entrega');
      if (latest.neighborhood) tags.push(`Bairro: ${latest.neighborhood}`);

      let relationshipStatus = 'Novo';
      if (tags.includes('VIP')) relationshipStatus = 'VIP';
      else if (tags.includes('Inativo')) relationshipStatus = 'Inativo';
      else if (tags.includes('Recorrente')) relationshipStatus = 'Recorrente';

      let repurchaseProbability = 'Baixa';
      if (group.orders.length > 1 && daysSinceLastOrder <= 14) repurchaseProbability = 'Alta';
      else if (group.orders.length > 1 || daysSinceLastOrder <= 21) repurchaseProbability = 'Média';

      const suggestedApproach = tags.includes('Inativo')
        ? 'Enviar cupom de retorno'
        : tags.includes('VIP')
          ? 'Enviar cupom VIP'
          : topProduct
            ? `Oferecer ${topProduct.name}`
            : 'Mandar agradecimento';

      return {
        name: latest.customerName || 'Desconhecido',
        phone: group.phone,
        cep: latest.cep || '',
        street: latest.street || '',
        number: latest.number || '',
        neighborhood: latest.neighborhood || '',
        city: latest.city || '',
        deliveryMethod: preferredDeliveryMethod || 'DELIVERY',
        ordersCount: group.orders.length,
        firstOrderAt: firstOrder.createdAt,
        lastOrderAt: latest.createdAt,
        daysSinceLastOrder,
        totalSpent: group.totalSpent,
        averageTicket,
        relationshipStatus,
        repurchaseProbability,
        suggestedApproach,
        tags,
        favoriteProduct: topProduct,
        favoriteCategory: topCategory.name,
        favoriteFlavor: topFlavor.name,
        favoriteAddon: topAddon.name,
        topProducts: Array.from(group.products.values())
          .sort((a, b) => b.quantity - a.quantity || b.total - a.total)
          .slice(0, 3),
      };
    })
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdminAuth();
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  revalidatePath('/admin');
}
export async function deleteCategory(id: string) {
  await requireAdminAuth();
  try {
    await prisma.$transaction([
      prisma.product.deleteMany({
        where: { categoryId: id },
      }),
      prisma.category.delete({
        where: { id },
      }),
    ]);
  } catch (error) {
    console.error("Failed to delete category:", error);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function addProduct(product: Omit<Product, 'id' | 'slug' | 'flavors' | 'addons'> & { flavors?: string[], addons?: { name: string, price: number }[] }) {
  await requireAdminAuth();
  const parsed = addProductSchema.parse(product);
  await prisma.product.create({
    data: {
      name: parsed.name,
      slug: slugify(parsed.name),
      description: parsed.description || '',
      price: parsed.price,
      imageUrl: parsed.imageUrl || null,
      galleryImage1: parsed.galleryImage1 || null,
      galleryImage2: parsed.galleryImage2 || null,
      galleryImage3: parsed.galleryImage3 || null,
      videoUrl: parsed.videoUrl || null,
      proteins: parsed.proteins || 0,
      calories: parsed.calories || 0,
      weight: parsed.weight || 0,
      volume: parsed.volume || 0,
      categoryId: parsed.categoryId,
      allowMultipleAddons: parsed.allowMultipleAddons ?? true,
      isActive: parsed.isActive ?? true,
      isFeatured: parsed.isFeatured ?? false,
      sortOrder: parsed.sortOrder || 0,
      flavors: {
        create: parsed.flavors?.map(name => ({ name })) || []
      },
      addons: {
        create: parsed.addons?.map((addon) => ({
          name: addon.name,
          price: addon.price || 0
        })) || []
      }
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/product/[slug]');
}

export async function updateProduct(product: Omit<Product, 'slug' | 'flavors' | 'addons'> & { flavors?: string[], addons?: { name: string, price: number }[] }) {
  await requireAdminAuth();
  const parsed = updateProductSchema.parse(product);
  await prisma.flavor.deleteMany({
    where: { productId: parsed.id }
  });
  await prisma.addon.deleteMany({
    where: { productId: parsed.id }
  });

  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      slug: slugify(parsed.name),
      description: parsed.description || '',
      price: parsed.price,
      imageUrl: parsed.imageUrl || null,
      galleryImage1: parsed.galleryImage1 || null,
      galleryImage2: parsed.galleryImage2 || null,
      galleryImage3: parsed.galleryImage3 || null,
      videoUrl: parsed.videoUrl || null,
      proteins: parsed.proteins || 0,
      calories: parsed.calories || 0,
      weight: parsed.weight || 0,
      volume: parsed.volume || 0,
      categoryId: parsed.categoryId,
      allowMultipleAddons: parsed.allowMultipleAddons ?? true,
      isActive: parsed.isActive ?? true,
      isFeatured: parsed.isFeatured ?? false,
      sortOrder: parsed.sortOrder || 0,
      flavors: {
        create: parsed.flavors?.map(name => ({ name })) || []
      },
      addons: {
        create: parsed.addons?.map((addon) => ({
          name: addon.name,
          price: addon.price || 0
        })) || []
      }
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/product/[slug]');
}

export async function deleteProduct(id: string) {
  await requireAdminAuth();
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/product/[slug]');
}

export async function duplicateProduct(id: string) {
  await requireAdminAuth();
  const original = await prisma.product.findUnique({
    where: { id },
    include: { flavors: true, addons: true },
  });
  if (!original) return;

  const newName = `${original.name} (cópia)`;
  const newSlug = slugify(newName);

  await prisma.product.create({
    data: {
      name: newName,
      slug: newSlug,
      description: original.description,
      price: original.price,
      imageUrl: original.imageUrl,
      galleryImage1: original.galleryImage1,
      galleryImage2: original.galleryImage2,
      galleryImage3: original.galleryImage3,
      videoUrl: original.videoUrl,
      proteins: original.proteins,
      calories: original.calories,
      weight: original.weight,
      volume: original.volume,
      categoryId: original.categoryId,
      allowMultipleAddons: original.allowMultipleAddons,
      isActive: false,
      isFeatured: false,
      sortOrder: original.sortOrder,
      flavors: {
        create: original.flavors.map(f => ({ name: f.name })),
      },
      addons: {
        create: original.addons.map(a => ({ name: a.name, price: a.price })),
      },
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');
}
