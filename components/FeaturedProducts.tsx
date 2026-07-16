'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { Product } from '@/lib/db';
import ProductBadges from './ProductBadges';
import { useRef } from 'react';

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const featured = [...products]
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    })
    .slice(0, 6);

  if (featured.length === 0) return null;

  const scrollByCard = (direction: 'left' | 'right') => {
    carouselRef.current?.scrollBy({
      left: direction === 'left' ? -286 : 286,
      behavior: 'smooth',
    });
  };

  return (
    <section id="destaques" className="mb-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <Sparkles size={13} />
            Destaques do NISI
          </div>
          <h2 className="text-xl font-bold text-gray-950">Mais pedidos para sua rotina</h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCard('left')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
            aria-label="Ver destaques anteriores"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard('right')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
            aria-label="Ver mais destaques"
          >
            <ArrowRight size={16} />
          </button>
          <a href="#cardapio" className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
            Cardápio
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-8 bg-gradient-to-r from-[#f8fbf8] to-transparent sm:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-12 bg-gradient-to-l from-[#f8fbf8] to-transparent sm:block" />
        <div ref={carouselRef} className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {featured.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: index * 0.04 }}
              className="snap-start"
            >
              <Link
                href={`/product/${product.slug}`}
                className="block h-full w-[260px] rounded-lg border border-emerald-100 bg-white p-3 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
              >
                <div className="relative mb-3 aspect-[5/3] overflow-hidden rounded-md bg-emerald-50">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="260px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-700">
                      <Leaf size={34} />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-white/92 px-2 py-1 text-[11px] font-bold text-emerald-800 shadow-sm">
                    Mais pedido
                  </span>
                </div>
                <h3 className="line-clamp-1 font-semibold text-gray-950">{product.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{product.description}</p>
                <ProductBadges product={product} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-emerald-800">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
