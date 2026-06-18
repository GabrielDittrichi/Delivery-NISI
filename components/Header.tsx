'use client';

import { Restaurant } from '@/lib/db';
import { motion } from 'framer-motion';
import { ArrowDown, Clock, HeartPulse, Leaf, Star, Truck, BadgeDollarSign } from 'lucide-react';
import Image from 'next/image';

export default function Header({ restaurant }: { restaurant: Restaurant }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white pb-4"
    >
      <div className="h-32 md:h-48 relative bg-[linear-gradient(135deg,#f7fff9_0%,#e8f8ee_55%,#ffffff_100%)]">
        {restaurant.bannerUrl && (
            <Image
              src={restaurant.bannerUrl}
              alt="Banner"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
             
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/5 via-transparent to-white/85" />
      </div>
      <div className="container mx-auto px-4 max-w-4xl -mt-10 relative flex flex-col md:flex-row items-start md:items-end gap-4">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md z-10">
           {restaurant.logoUrl ? (
             <Image
               src={restaurant.logoUrl}
               alt="Logo"
               width={96}
               height={96}
               className="w-full h-full object-cover"
              
             />
           ) : (
             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Logo</div>
           )}
        </div>
        <div className="flex-1 pt-2 md:pt-0">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border bg-white/90 px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <Leaf size={13} />
              Espaco Vida Saudavel
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{restaurant.name}</h1>
            {restaurant.description && (
              <p className="text-sm text-gray-700 mt-1">{restaurant.description}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white/80 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                <HeartPulse size={14} className="opacity-70" />
                Atendimento para seus objetivos
              </span>
              {restaurant.deliveryTime && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white/80 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                  <Clock size={14} className="opacity-70" />
                  {restaurant.deliveryTime}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white/80 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                <Truck size={14} className="opacity-70" />
                {restaurant.deliveryFee > 0 ? `Entrega R$ ${restaurant.deliveryFee.toFixed(2).replace('.', ',')}` : 'Entrega a combinar'}
              </span>
              {restaurant.minOrder > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white/80 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                  <BadgeDollarSign size={14} className="opacity-70" />
                  Min. R$ {restaurant.minOrder.toFixed(2).replace('.', ',')}
                </span>
              )}
              {restaurant.rating > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white/80 backdrop-blur" style={{ borderColor: 'var(--border)', color: 'var(--brand)' }}>
                  <Star size={14} className="opacity-90" />
                  {restaurant.rating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="#destaques"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                Ver destaques
                <ArrowDown size={16} />
              </a>
              <a
                href="#cardapio"
                className="inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
                style={{ borderColor: 'var(--border)' }}
              >
                Montar meu pedido
              </a>
            </div>
        </div>
      </div>
    </motion.div>
  );
}
