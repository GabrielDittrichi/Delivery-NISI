import { getData } from '@/lib/db';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ProductList from '@/components/ProductList';
import { Leaf } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CardapioPage() {
  const data = await getData();
  const publicProducts = data.products
    .filter((product) => product.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <main className="min-h-screen bg-[#f8fbf8] pb-20">
      <div className="relative">
        <Header restaurant={data.restaurant} simplified />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur">
            <Leaf size={16} />
            Cardápio para consumo no espaço
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <CategoryNav categories={data.categories} primaryColor={data.restaurant.primaryColor} />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ProductList categories={data.categories} products={publicProducts} />
      </div>
    </main>
  );
}
