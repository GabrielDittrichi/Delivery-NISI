'use server'

import { prisma } from './prisma';
import { getData, Category, Product, Restaurant } from './db';
import { slugify } from './slugify';
import { addProductSchema, updateProductSchema, addCategorySchema, updateRestaurantSchema } from './validations';
import { revalidatePath } from 'next/cache';

export async function getStoreData() {
  return await getData();
}

export async function updateRestaurant(restaurantData: Restaurant) {
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
  if (!process.env.DATABASE_URL) return [];

  // Aggregate orders by phone using groupBy
  const grouped = await prisma.order.groupBy({
    by: ['customerPhone'],
    _count: { customerPhone: true },
    _sum: { total: true },
    _max: { createdAt: true },
    where: { status: { not: 'CANCELED' } },
  });

  // Get the latest order details for each customer
  const phones = grouped.map(g => g.customerPhone);
  const latestOrders = new Map<string, {
    customerName: string; cep: string; street: string; number: string;
    neighborhood: string; city: string; deliveryMethod: string;
  }>();

  // Fetch latest order per phone in batches
  const batchSize = 50;
  for (let i = 0; i < phones.length; i += batchSize) {
    const batch = phones.slice(i, i + batchSize);
    const latestPerBatch = await Promise.all(
      batch.map(phone =>
        prisma.order.findFirst({
          where: { customerPhone: phone, status: { not: 'CANCELED' } },
          orderBy: { createdAt: 'desc' },
        })
      )
    );
      latestPerBatch.forEach((order, idx) => {
        if (order) latestOrders.set(batch[idx], {
          customerName: order.customerName,
          cep: order.cep,
          street: order.street,
          number: order.number,
          neighborhood: order.neighborhood,
          city: order.city,
          deliveryMethod: order.deliveryMethod,
        });
      });
  }

  return grouped
    .map(g => {
      const latest = latestOrders.get(g.customerPhone);
      return {
        name: latest?.customerName || 'Desconhecido',
        phone: g.customerPhone,
        cep: latest?.cep || '',
        street: latest?.street || '',
        number: latest?.number || '',
        neighborhood: latest?.neighborhood || '',
        city: latest?.city || '',
        deliveryMethod: latest?.deliveryMethod || 'DELIVERY',
        ordersCount: g._count.customerPhone,
        lastOrderAt: g._max.createdAt || new Date(),
        totalSpent: g._sum.total || 0,
      };
    })
    .sort((a, b) => new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime());
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
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/product/[slug]');
}

export async function duplicateProduct(id: string) {
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
