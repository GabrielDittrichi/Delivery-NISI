import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();

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

async function main() {
  const storeData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'store.json'), 'utf-8')
  );

  console.log('Seeding database...');

  // 1. Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: storeData.restaurant.name,
      description: storeData.restaurant.description,
      rating: storeData.restaurant.rating,
      deliveryTime: storeData.restaurant.deliveryTime,
      deliveryFee: storeData.restaurant.deliveryFee,
      minOrder: storeData.restaurant.minOrder,
      bannerUrl: storeData.restaurant.bannerUrl,
      logoUrl: storeData.restaurant.logoUrl,
      primaryColor: storeData.restaurant.primaryColor,
    },
  });
  console.log(`Created restaurant: ${restaurant.name}`);

  // 2. Create Categories and Products
  for (const catData of storeData.categories) {
    const category = await prisma.category.create({
      data: {
        id: catData.id, // Manter o ID original se possível para consistência, ou deixar gerar novo e mapear.
        // O ID no JSON é "1", "2". CUID é string.
        // Vou deixar o ID original do JSON se for string, mas o schema define @default(cuid()).
        // Se eu passar o ID, o Prisma aceita.
        name: catData.name,
      },
    });
    console.log(`Created category: ${category.name}`);

    // Find products for this category
    const products = storeData.products.filter((p: any) => p.categoryId === catData.id);
    
    for (const prodData of products) {
      await prisma.product.create({
        data: {
            // id: prodData.id, // IDs no JSON são "101". Vou deixar gerar novos CUIDs para evitar conflitos futuros ou problemas de tipo se eu mudar.
            // Mas espera, se eu mudar os IDs, as imagens e referências podem quebrar se houver hardcode.
            // O carrinho usa IDs. Se eu mudar os IDs, o carrinho atual no localStorage vai quebrar.
            // O usuário não pediu para manter compatibilidade com localStorage antigo, então tudo bem limpar.
            // Mas para garantir, vou passar os IDs originais como string.
            id: prodData.id,
            name: prodData.name,
            slug: slugify(prodData.name),
            description: prodData.description,
            price: prodData.price,
            imageUrl: prodData.imageUrl,
            categoryId: category.id,
            flavors: {
              create: prodData.flavors?.map((name: string) => ({ name })) || []
            }
        }
      });
    }
    console.log(`Created ${products.length} products for category ${category.name}`);
  }

  // 3. Create Sample Coupons
  await prisma.coupon.create({
    data: {
      code: 'BEMVINDO',
      type: 'PERCENTAGE',
      value: 10,
    }
  });
  console.log('Created sample coupon: BEMVINDO');

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
