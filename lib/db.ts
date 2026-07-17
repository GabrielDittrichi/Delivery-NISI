import { prisma } from './prisma';

// Re-export types if needed, or map Prisma types to these interfaces
export interface Restaurant {
  name: string;
  description: string;
  rating: number;
  deliveryTime: string | null;
  deliveryFee: number;
  minOrder: number;
  bannerUrl: string | null;
  logoUrl: string | null;
  primaryColor: string;
  whatsapp?: string | null;
  address?: string | null;
  businessHours?: string | null;
  institutionalText?: string | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
  galleryImage1?: string | null;
  galleryImage2?: string | null;
  galleryImage3?: string | null;
  videoUrl?: string | null;
  proteins: number;
  calories: number;
  weight: number;
  volume: number;
  flavors: { id: string; name: string }[];
  addons: { id: string; name: string; price: number }[];
  allowMultipleAddons: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface DataStore {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
}

export const defaultRestaurant: Restaurant = {
  name: "Espaço Vida Saudável NISI",
  description: "Shakes, bebidas funcionais e opções proteicas para uma rotina mais leve.",
  rating: 4.9,
  deliveryTime: "15-25 min",
  deliveryFee: 0,
  minOrder: 0,
  bannerUrl: "/brand/nisi-banner.png",
  logoUrl: "/brand/nisi-logo.jpeg",
  primaryColor: "#16803C",
  whatsapp: "",
  address: "Av. Abílio Machado, 1.928 - sala 01 - Alípio de Melo",
  businessHours: "",
  institutionalText: "Cardápio saudável com shakes, bebidas funcionais, salgados e sobremesas proteicas."
};

export const sampleCategories: Category[] = [
  { id: "salgados", name: "Salgados", order: 0 },
  { id: "bebidas", name: "Bebidas Funcionais", order: 1 },
  { id: "sobremesas", name: "Sobremesas", order: 2 },
  { id: "shakes", name: "Shakes", order: 3 },
];

export const commonAddons = [
  { id: "addon-porcao-frango", name: "Porcao de frango", price: 5 },
  { id: "addon-salada-parte", name: "Salada a parte", price: 8 },
  { id: "addon-proteina-5g", name: "Colher de proteína 5g", price: 8 },
];

export const sampleProducts: Product[] = [
  {
    id: "torta-frango",
    categoryId: "salgados",
    name: "Torta de Frango",
    slug: "torta-de-frango",
    description: "Torta de frango proteica para uma refeição prática, saborosa e com mais saciedade.",
    price: 30,
    imageUrl: null,
    videoUrl: "https://pub-b0c6576fd7ce4550917b484175556894.r2.dev/a2f89c85-3b6a-490a-bbdd-1ee66fed92af.mp4",
    proteins: 45,
    calories: 250,
    weight: 300,
    volume: 0,
    flavors: [],
    addons: [{ id: "addon-salada-torta", name: "Salada", price: 5 }],
    allowMultipleAddons: true,
  },
  {
    id: "empada",
    categoryId: "salgados",
    name: "Empada",
    slug: "empada",
    description: "Empada de frango zero % farinha, leve e prática para qualquer hora.",
    price: 4,
    imageUrl: null,
    proteins: 7,
    calories: 108,
    weight: 30,
    volume: 0,
    flavors: [],
    addons: [{ id: "addon-empada-grande", name: "Trocar para empada grande", price: 2 }],
    allowMultipleAddons: false,
  },
  {
    id: "omelete",
    categoryId: "salgados",
    name: "Omelete",
    slug: "omelete",
    description: "Omelete nutritivo com salada fresca, ideal para uma refeição leve e com mais saciedade.",
    price: 25,
    imageUrl: null,
    proteins: 30,
    calories: 220,
    weight: 350,
    volume: 0,
    flavors: [],
    addons: [
      { id: "addon-salada-omelete", name: "Salada", price: 5 },
      ...commonAddons,
    ],
    allowMultipleAddons: true,
  },
  {
    id: "pao-de-queijo",
    categoryId: "salgados",
    name: "Pão de Queijo",
    slug: "pao-de-queijo",
    description: "Opção salgada rápida para acompanhar shakes, bebidas e lanches leves.",
    price: 4,
    imageUrl: null,
    proteins: 4,
    calories: 76,
    weight: 30,
    volume: 0,
    flavors: [],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "sanduiche-frango",
    categoryId: "salgados",
    name: "Sanduíche de Frango",
    slug: "sanduiche-de-frango",
    description: "Sanduíche de frango prático, nutritivo e rico em proteínas para sustentar a rotina.",
    price: 25,
    imageUrl: null,
    proteins: 45,
    calories: 250,
    weight: 300,
    volume: 0,
    flavors: [],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "nutrisoup",
    categoryId: "salgados",
    name: "NutriSoup",
    slug: "nutrisoup",
    description: "Sopa proteica quente para uma refeição prática, leve e equilibrada.",
    price: 25,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 0,
    flavors: [],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "sanduiche-atum",
    categoryId: "salgados",
    name: "Sanduíche de Atum",
    slug: "sanduiche-de-atum",
    description: "Sanduíche de atum prático, nutritivo e rico em proteínas.",
    price: 25,
    imageUrl: null,
    proteins: 45,
    calories: 250,
    weight: 300,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: true,
  },
  {
    id: "fibra-prebiotica",
    categoryId: "bebidas",
    name: "Fibra Prebiótica",
    slug: "fibra-prebiotica",
    description: "Fibra concentrada em sabores leves para apoiar saciedade e bem-estar.",
    price: 28.9,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [
      { id: "manga", name: "Manga" },
      { id: "uva", name: "Uva" },
      { id: "limao-fibra", name: "Limão" },
    ],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "shot-matinal",
    categoryId: "bebidas",
    name: "Shot Matinal",
    slug: "shot-matinal",
    description: "Energy, Acelera e Fibra em um shot funcional para comecar bem o dia.",
    price: 28.9,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "energy",
    categoryId: "bebidas",
    name: "Energy",
    slug: "energy",
    description: "Bebida funcional para dar mais energia e leveza ao longo do dia.",
    price: 28.9,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "acelera",
    categoryId: "bebidas",
    name: "Acelera",
    slug: "acelera",
    description: "Bebida funcional para acompanhar uma rotina mais ativa e equilibrada.",
    price: 28.9,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 500,
    flavors: [],
    addons: commonAddons,
    allowMultipleAddons: true,
  },
  {
    id: "pudim",
    categoryId: "sobremesas",
    name: "Pudim",
    slug: "pudim",
    description: "Sobremesa proteica para matar a vontade de doce sem sair da rotina.",
    price: 25,
    imageUrl: null,
    proteins: 19,
    calories: 210,
    weight: 200,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: true,
  },
  {
    id: "shake-garrafa",
    categoryId: "sobremesas",
    name: "Shake de Garrafa",
    slug: "shake-de-garrafa",
    description: "Shake cremoso em garrafa, pronto para levar e manter a rotina proteica em dia.",
    price: 25,
    imageUrl: null,
    proteins: 19,
    calories: 210,
    weight: 200,
    volume: 0,
    flavors: [],
    addons: [],
    allowMultipleAddons: true,
  },
  {
    id: "bolo-pote",
    categoryId: "sobremesas",
    name: "Bolo de Pote",
    slug: "bolo-de-pote",
    description: "Bolo de pote proteico, cremoso e pensado para uma sobremesa mais equilibrada.",
    price: 25,
    imageUrl: null,
    proteins: 23,
    calories: 240,
    weight: 250,
    volume: 0,
    flavors: [
      { id: "chokito", name: "Chokito" },
      { id: "torta-limao", name: "Torta de Limão" },
      { id: "pina-colada", name: "Piña Colada" },
      { id: "prestigio", name: "Prestígio" },
    ],
    addons: [],
    allowMultipleAddons: true,
  },
  {
    id: "shake-proteico",
    categoryId: "shakes",
    name: "Shake Proteico",
    slug: "shake-proteico",
    description: "Shake proteico cremoso para reforçar a rotina com sabor, praticidade e complementos.",
    price: 28,
    imageUrl: null,
    proteins: 0,
    calories: 0,
    weight: 0,
    volume: 400,
    flavors: [
      { id: "pina-colada-shake", name: "Piña Colada" },
      { id: "chicabon", name: "Chicabon" },
      { id: "prestigio-shake", name: "Prestígio" },
      { id: "cappuccino", name: "Cappuccino" },
      { id: "flocos", name: "Flocos" },
      { id: "quick", name: "Quick" },
      { id: "napolitano", name: "Napolitano" },
      { id: "chokito-shake", name: "Chokito" },
      { id: "frappe-abacaxi", name: "Frappe de Abacaxi" },
      { id: "frappe-banana", name: "Frappe de Banana" },
      { id: "mocatino", name: "Mocatino" },
      { id: "oreo", name: "Oreo" },
      { id: "frappe-coco", name: "Frappe de Coco" },
    ],
    addons: [
      { id: "addon-borda-doce-leite", name: "Borda doce de leite", price: 5 },
      { id: "addon-borda-cookies", name: "Borda cookies", price: 5 },
      { id: "addon-borda-coco", name: "Borda coco", price: 5 },
      { id: "addon-borda-chocolate", name: "Borda chocolate", price: 5 },
      { id: "addon-borda-cafe", name: "Borda cafe", price: 5 },
      { id: "addon-borda-morango", name: "Borda morango", price: 5 },
      { id: "addon-borda-irmao", name: "Borda Irmao", price: 5 },
      { id: "addon-borda-pistache", name: "Borda pistache", price: 5 },
      { id: "addon-borda-banana", name: "Borda banana", price: 5 },
      { id: "addon-borda-abacaxi", name: "Borda abacaxi", price: 5 },
      { id: "addon-borda-baunilha", name: "Borda baunilha", price: 5 },
    ],
    allowMultipleAddons: false,
  },
];

export async function getData(): Promise<DataStore> {
  // Allow builds/previews to run without a database configured.
  if (!process.env.DATABASE_URL) {
    return getFallbackData();
  }
  try {
    const restaurant = await prisma.restaurant.findFirst();
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    const products = await prisma.product.findMany({
      include: { flavors: true, addons: true }
    });

    return {
      restaurant: restaurant || defaultRestaurant,
      categories,
      products: products.map(product => ({
        ...product,
        imageUrl: product.imageUrl,
        flavors: product.flavors.map(f => ({ id: f.id, name: f.name })),
        addons: product.addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
      }))
    };
  } catch {
    console.info("Using fallback data after database error.");
    return getFallbackData();
  }
}

export function getFallbackData(): DataStore {
  return {
    restaurant: defaultRestaurant,
    categories: sampleCategories,
    products: sampleProducts
  };
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    return categoryId ? sampleProducts.filter((p) => p.categoryId === categoryId) : sampleProducts;
  }
  const where = categoryId ? { categoryId } : {};
  const products = await prisma.product.findMany({
    where,
    include: { flavors: true, addons: true }
  });
  return products.map(product => ({
    ...product,
    imageUrl: product.imageUrl,
    flavors: product.flavors.map(f => ({ id: f.id, name: f.name })),
    addons: product.addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!process.env.DATABASE_URL) return sampleProducts.find((p) => p.id === id) ?? null;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { flavors: true, addons: true }
  });
  if (!product) return null;
  return {
    ...product,
    imageUrl: product.imageUrl,
    flavors: product.flavors.map(f => ({ id: f.id, name: f.name })),
    addons: product.addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
  };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!process.env.DATABASE_URL) return sampleProducts.find((p) => p.slug === slug);
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { flavors: true, addons: true }
  });
  return product ? {
    ...product,
    imageUrl: product.imageUrl,
    flavors: product.flavors.map(f => ({ id: f.id, name: f.name })),
    addons: product.addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
  } : undefined;
}
