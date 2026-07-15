'use client';
import { Category, Product } from '@/lib/db';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';

export default function ProductList({ categories, products }: { categories: Category[], products: Product[] }) {
  return (
    <div id="cardapio" className="space-y-8">
        {categories.map((cat, index) => {
            const catProducts = products.filter(p => p.categoryId === cat.id);
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
    </div>
  );
}
