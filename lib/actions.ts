'use server'

import { prisma } from './prisma';
import { getData, Category, Product, Restaurant } from './db';
import { revalidatePath } from 'next/cache';

export async function getStoreData() {
  return await getData();
}

export async function updateRestaurant(restaurantData: Restaurant) {
  // Assuming there is only one restaurant, or we update the first one found
  const existingRestaurant = await prisma.restaurant.findFirst();

  if (existingRestaurant) {
    await prisma.restaurant.update({
      where: { id: existingRestaurant.id },
      data: {
        name: restaurantData.name,
        description: restaurantData.description,
        rating: restaurantData.rating,
        deliveryTime: restaurantData.deliveryTime,
        deliveryFee: restaurantData.deliveryFee,
        minOrder: restaurantData.minOrder,
        bannerUrl: restaurantData.bannerUrl,
        logoUrl: restaurantData.logoUrl,
        primaryColor: restaurantData.primaryColor,
        whatsapp: restaurantData.whatsapp,
        address: restaurantData.address,
        businessHours: restaurantData.businessHours,
        institutionalText: restaurantData.institutionalText,
      },
    });
  } else {
    // If no restaurant exists, create one
    await prisma.restaurant.create({
      data: {
        name: restaurantData.name,
        description: restaurantData.description,
        rating: restaurantData.rating,
        deliveryTime: restaurantData.deliveryTime,
        deliveryFee: restaurantData.deliveryFee,
        minOrder: restaurantData.minOrder,
        bannerUrl: restaurantData.bannerUrl,
        logoUrl: restaurantData.logoUrl,
        primaryColor: restaurantData.primaryColor,
        whatsapp: restaurantData.whatsapp,
        address: restaurantData.address,
        businessHours: restaurantData.businessHours,
        institutionalText: restaurantData.institutionalText,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function addCategory(name: string) {
  const lastCategory = await prisma.category.findFirst({
    orderBy: { order: 'desc' }
  });
  const newOrder = (lastCategory?.order ?? -1) + 1;

  await prisma.category.create({
    data: {
      name,
      order: newOrder
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function moveCategory(id: string, direction: 'up' | 'down') {
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
  const orders = await getOrders();
  const customers = new Map<string, {
    name: string;
    phone: string;
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    deliveryMethod: string;
    ordersCount: number;
    lastOrderAt: Date | string;
    totalSpent: number;
  }>();

  for (const order of orders) {
    const phone = order.customerPhone.replace(/\D/g, '') || order.customerPhone;
    const existing = customers.get(phone);
    const orderDate = order.createdAt;

    if (!existing) {
      customers.set(phone, {
        name: order.customerName,
        phone: order.customerPhone,
        cep: order.cep,
        street: order.street,
        number: order.number,
        neighborhood: order.neighborhood,
        city: order.city,
        deliveryMethod: order.deliveryMethod,
        ordersCount: 1,
        lastOrderAt: orderDate,
        totalSpent: order.total,
      });
      continue;
    }

    existing.ordersCount += 1;
    existing.totalSpent += order.total;
    if (new Date(orderDate) > new Date(existing.lastOrderAt)) {
      existing.name = order.customerName;
      existing.cep = order.cep;
      existing.street = order.street;
      existing.number = order.number;
      existing.neighborhood = order.neighborhood;
      existing.city = order.city;
      existing.deliveryMethod = order.deliveryMethod;
      existing.lastOrderAt = orderDate;
    }
  }

  return Array.from(customers.values()).sort(
    (a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime()
  );
}

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  revalidatePath('/admin');
}
export async function deleteCategory(id: string) {
  try {
    // Delete all products in this category first to avoid FK constraint errors
    await prisma.product.deleteMany({
      where: { categoryId: id },
    });

    await prisma.category.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete category:", error);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function addProduct(product: Omit<Product, 'id' | 'slug' | 'flavors' | 'addons'> & { flavors?: string[], addons?: { name: string, price: number }[] }) {
  await prisma.product.create({
    data: {
      name: product.name,
      slug: slugify(product.name),
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      proteins: product.proteins || 0,
      calories: product.calories || 0,
      weight: product.weight || 0,
      volume: product.volume || 0,
      categoryId: product.categoryId,
      allowMultipleAddons: product.allowMultipleAddons,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      sortOrder: product.sortOrder || 0,
      flavors: {
        create: product.flavors?.map(name => ({ name })) || []
      },
      addons: {
        create: product.addons?.map((addon) => ({
          name: addon.name,
          price: addon.price || 0
        })) || []
      }
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function updateProduct(product: Omit<Product, 'slug' | 'flavors' | 'addons'> & { flavors?: string[], addons?: { name: string, price: number }[] }) {
  // First delete existing flavors and addons
  await prisma.flavor.deleteMany({
    where: { productId: product.id }
  });
  await prisma.addon.deleteMany({
    where: { productId: product.id }
  });

  await prisma.product.update({
    where: { id: product.id },
    data: {
      name: product.name,
      slug: slugify(product.name),
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      proteins: product.proteins || 0,
      calories: product.calories || 0,
      weight: product.weight || 0,
      volume: product.volume || 0,
      categoryId: product.categoryId,
      allowMultipleAddons: product.allowMultipleAddons,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      sortOrder: product.sortOrder || 0,
      flavors: {
        create: product.flavors?.map(name => ({ name })) || []
      },
      addons: {
        create: product.addons?.map((addon) => ({
          name: addon.name,
          price: addon.price || 0
        })) || []
      }
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}
