import { getData } from '@/lib/db';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ProductList from '@/components/ProductList';

export const dynamic = 'force-dynamic'; // To ensure we always get fresh data

export default async function Home() {
  const data = await getData();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <Header restaurant={data.restaurant} />
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <CategoryNav categories={data.categories} primaryColor={data.restaurant.primaryColor} />
      </div>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ProductList categories={data.categories} products={data.products} primaryColor={data.restaurant.primaryColor} />
      </div>
    </main>
  );
}
