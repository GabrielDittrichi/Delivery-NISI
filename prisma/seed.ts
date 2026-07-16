import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { defaultRestaurant, sampleCategories, sampleProducts } from '../lib/db';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Espaço Vida Saudável NISI...');

  const existingRestaurant = await prisma.restaurant.findFirst();
  if (existingRestaurant) {
    await prisma.restaurant.update({
      where: { id: existingRestaurant.id },
      data: defaultRestaurant,
    });
  } else {
    await prisma.restaurant.create({ data: defaultRestaurant });
  }

  for (const category of sampleCategories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        order: category.order,
      },
      create: category,
    });
  }

  const obsoleteProductIds = ['shake-sem-borda', 'shake-com-borda', 'empada-grande', 'empada-pequena'];
  for (const id of obsoleteProductIds) {
    try {
      await prisma.product.delete({ where: { id } });
    } catch {
      await prisma.product.updateMany({
        where: { id },
        data: { isActive: false },
      });
    }
  }

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        proteins: product.proteins,
        calories: product.calories,
        weight: product.weight,
        volume: product.volume,
        categoryId: product.categoryId,
        allowMultipleAddons: product.allowMultipleAddons,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        sortOrder: product.sortOrder || 0,
        flavors: {
          deleteMany: {},
          create: product.flavors.map((flavor) => ({ name: flavor.name })),
        },
        addons: {
          deleteMany: {},
          create: product.addons.map((addon) => ({ name: addon.name, price: addon.price })),
        },
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        galleryImage1: product.galleryImage1 || null,
        galleryImage2: product.galleryImage2 || null,
        galleryImage3: product.galleryImage3 || null,
        videoUrl: product.videoUrl || null,
        proteins: product.proteins,
        calories: product.calories,
        weight: product.weight,
        volume: product.volume,
        categoryId: product.categoryId,
        allowMultipleAddons: product.allowMultipleAddons,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        sortOrder: product.sortOrder || 0,
        flavors: {
          create: product.flavors.map((flavor) => ({ name: flavor.name })),
        },
        addons: {
          create: product.addons.map((addon) => ({ name: addon.name, price: addon.price })),
        },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'NISI10' },
    update: { type: 'PERCENTAGE', value: 10, isActive: true, minOrder: 0, usageLimit: null, expiresAt: null },
    create: { code: 'NISI10', type: 'PERCENTAGE', value: 10, isActive: true, minOrder: 0 },
  });

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
