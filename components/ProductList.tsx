'use client';
import { Category, Product } from '@/lib/db';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { trackPixelAndCapi } from '@/lib/track-unified';

export default function ProductList({ categories, products }: { categories: Category[], products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleProducts = useMemo(() => {
    if (normalizedSearch.length < 2) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch, products]);

  useEffect(() => {
    if (normalizedSearch.length < 2) return;
    const timeout = window.setTimeout(() => {
      const resultCount = visibleProducts.length;
      const eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'search',
          metadata: { search_string: normalizedSearch, result_count: resultCount },
        }),
        keepalive: true,
      }).catch(() => {});
      trackPixelAndCapi('Search', {
        search_string: normalizedSearch,
        content_type: 'product',
        content_ids: visibleProducts.slice(0, 10).map((product) => product.id),
        result_count: resultCount,
      }, eventId);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [normalizedSearch, visibleProducts]);

  return (
    <div id="cardapio" className="space-y-8">
        <div className="rounded-lg border border-emerald-100 bg-white p-3 shadow-sm">
            <label htmlFor="menu-search" className="sr-only">Buscar no cardápio</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" size={18} />
                <input
                    id="menu-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar no cardápio..."
                    className="w-full rounded-lg border border-emerald-100 bg-emerald-50/40 py-3 pl-10 pr-4 text-sm text-gray-950 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
            </div>
        </div>
        {categories.map((cat, index) => {
            const catProducts = visibleProducts.filter(p => p.categoryId === cat.id);
            if (catProducts.length === 0) return null;
            return (
                <motion.div 
                    key={cat.id} 
                    id={`cat-${cat.id}`} 
                    className="scroll-mt-36"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-950">{cat.name}</h2>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            {catProducts.length} opcoes
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catProducts.map(product => (
                            <ProductItem key={product.id} product={product} />
                        ))}
                    </div>
                </motion.div>
            )
        })}
        {visibleProducts.length === 0 && (
            <div className="rounded-lg border border-dashed border-emerald-100 bg-white p-8 text-center text-sm text-gray-500">
                Nenhum produto encontrado para essa busca.
            </div>
        )}
    </div>
  );
}
