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
  proteins: number;
  calories: number;
  weight: number;
  volume: number;
  flavors: { id: string; name: string }[];
  addons: { id: string; name: string; price: number }[];
  allowMultipleAddons: boolean;
}

export interface DataStore {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
}

export async function getData(): Promise<DataStore> {
  try {
    const restaurant = await prisma.restaurant.findFirst();
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    const products = await prisma.product.findMany({
      include: { flavors: true, addons: true }
    });

    return {
      restaurant: restaurant || {
        name: "Novo Restaurante",
        description: "",
        rating: 0,
        deliveryTime: "0 min",
        deliveryFee: 0,
        minOrder: 0,
        bannerUrl: "",
        logoUrl: "",
        primaryColor: "#EA1D2C"
      },
      categories,
      products: products.map(product => ({
        ...product,
        imageUrl: product.imageUrl,
        flavors: product.flavors.map(f => ({ id: f.id, name: f.name })),
        addons: product.addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
      }))
    };
  } catch (error) {
    console.error("Error fetching data from database:", error);
    // Fallback or rethrow
    throw error;
  }
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
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
