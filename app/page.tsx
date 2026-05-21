import { getData } from '@/lib/db';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ProductList from '@/components/ProductList';
import FeaturedProducts from '@/components/FeaturedProducts';

export const revalidate = 60; // cache for 60s; admin actions revalidatePath('/') as well

export default async function Home() {
  const data = await getData();
  const publicProducts = data.products
    .filter((product) => product.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <main className="min-h-screen bg-[#f8fbf8] pb-20">
      <Header restaurant={data.restaurant} />
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <CategoryNav categories={data.categories} primaryColor={data.restaurant.primaryColor} />
      </div>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <FeaturedProducts products={publicProducts} />
        <ProductList categories={data.categories} products={publicProducts} />
      </div>
    </main>
  );
}
