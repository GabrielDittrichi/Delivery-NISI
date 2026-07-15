import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const sampleProducts = [
  // SALGADOS
  {
    id: 'empada-pequena',
    categoryId: 'salgados',
    name: 'Empada Pequena',
    slug: 'empada-pequena',
    description: 'Empada de frango zero % farinha, leve e prática para qualquer hora.',
    price: 4,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'empada-grande',
    categoryId: 'salgados',
    name: 'Empada Grande',
    slug: 'empada-grande',
    description: 'Empada de frango zero % farinha em porção maior, com mais saciedade.',
    price: 6,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'pao-de-queijo',
    categoryId: 'salgados',
    name: 'Pão de Queijo',
    slug: 'pao-de-queijo',
    description: 'Opção salgada rápida para acompanhar shakes, bebidas e lanches leves.',
    price: 4,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'sanduiche-natural',
    categoryId: 'salgados',
    name: 'Sanduíche Natural',
    slug: 'sanduiche-natural',
    description: 'Preparado com ingredientes frescos para uma refeição prática, leve e rica em proteínas.',
    price: 30,
    imageUrl: 'https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/105801dc-3fed-4f85-b0f2-b02bf7e25b2b.jpeg',
    videoUrl: 'https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/c4d9a80b-6ce5-4ac3-a829-6e5d27ddf178.mp4',
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [
      { name: 'Combo de bebidas (Acelera + Energy)', price: 5 }
    ],
    allowMultipleAddons: true,
  },
  {
    id: 'omelete',
    categoryId: 'salgados',
    name: 'Omelete',
    slug: 'omelete',
    description: 'Omelete nutritivo com salada fresca, ideal para uma refeição leve e com mais saciedade.',
    price: 25,
    imageUrl: 'https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/c642d8e5-3307-4d57-b0d7-8e3101f78eb9.jpeg',
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [
      { name: 'Adicional de salada', price: 5 },
      { name: 'Combo de bebidas (Acelera + Energy)', price: 5 }
    ],
    allowMultipleAddons: true,
  },

  // SHAKES
  {
    id: 'shake-proteico',
    categoryId: 'shakes',
    name: 'Shake Proteico',
    slug: 'shake-proteico',
    description: 'Shake proteico cremoso para reforçar a rotina com sabor, praticidade e complementos.',
    price: 24,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 400,
    flavors: [], // can be added via panel later if needed
    addons: [
      { name: 'Combo de bebidas (Acelera + Energy)', price: 4 },
      { name: 'Borda', price: 5 }
    ],
    allowMultipleAddons: true,
  },
  {
    id: 'shake-garrafa',
    categoryId: 'shakes',
    name: 'Shake na Garrafa',
    slug: 'shake-na-garrafa',
    description: 'Shake cremoso em garrafa, pronto para levar e manter a rotina proteica em dia.',
    price: 24,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 400,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },

  // SOBREMESAS
  {
    id: 'pudim-proteico',
    categoryId: 'sobremesas',
    name: 'Pudim Proteico',
    slug: 'pudim-proteico',
    description: 'Sobremesa proteica para matar a vontade de doce sem sair da rotina.',
    price: 24,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'bolo-pote-proteico',
    categoryId: 'sobremesas',
    name: 'Bolo de Pote Proteico',
    slug: 'bolo-de-pote-proteico',
    description: 'Bolo de pote proteico, cremoso e pensado para uma sobremesa mais equilibrada.',
    price: 27,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },

  // BEBIDAS
  {
    id: 'bebidas-funcionais-energy',
    categoryId: 'bebidas',
    name: 'Bebidas Funcionais - Energy',
    slug: 'bebidas-funcionais-energy',
    description: 'Bebida funcional para dar mais energia e leveza ao longo do dia.',
    price: 8,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'bebidas-funcionais-acelera',
    categoryId: 'bebidas',
    name: 'Bebidas Funcionais - Acelera',
    slug: 'bebidas-funcionais-acelera',
    description: 'Bebida funcional para acompanhar uma rotina mais ativa e equilibrada.',
    price: 8,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'combo-energy-acelera',
    categoryId: 'bebidas',
    name: 'Combo Energy + Acelera',
    slug: 'combo-energy-acelera',
    description: 'Combo funcional com Energy e Acelera para reforçar energia e disposição.',
    price: 12,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'fibras',
    categoryId: 'bebidas',
    name: 'Fibras',
    slug: 'fibras',
    description: 'Fibra concentrada em sabores leves para apoiar saciedade e bem-estar.',
    price: 8,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [
      { name: 'Uva' },
      { name: 'Manga' },
      { name: 'Limão' }
    ],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'detox-turbo',
    categoryId: 'bebidas',
    name: 'Detox Turbo',
    slug: 'detox-turbo',
    description: 'Acelera com fibra para uma bebida funcional mais completa.',
    price: 16,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'shot-matinal',
    categoryId: 'bebidas',
    name: 'Shot Matinal',
    slug: 'shot-matinal',
    description: 'Energy, Acelera e Fibra em um shot funcional para começar bem o dia.',
    price: 20,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  },
  {
    id: 'hype-drink',
    categoryId: 'bebidas',
    name: 'Hype Drink',
    slug: 'hype-drink',
    description: 'Bebida refrescante e funcional para variar a rotina com mais sabor.',
    price: 30,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: [],
    allowMultipleAddons: false,
  }
];

async function main() {
  console.log('');
  console.log('⚠️  ATENCAO: Este script vai DELETAR todos os produtos e recria-los.');
  console.log('⚠️  Os pedidos existentes serao preservados (OrderItems),');
  console.log('⚠️  mas os vinculos com os produtos antigos serao perdidos.');
  console.log('');
  console.log('Pressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Deletando produtos antigos...');
  await prisma.product.deleteMany({});
  
  console.log('Inserindo novos produtos...');
  for (const product of sampleProducts) {
    const { flavors, addons, videoUrl, ...data } = product;
    await prisma.product.create({
      data: {
        ...data,
        videoUrl: videoUrl || null,
        flavors: {
          create: flavors
        },
        addons: {
          create: addons
        }
      }
    });
  }

  console.log('Cardápio atualizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
