'use client';

import { Restaurant } from '@/lib/db';
import { motion } from 'framer-motion';

export default function Header({ restaurant }: { restaurant: Restaurant }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white pb-4"
    >
      <div className="h-32 md:h-48 relative bg-gray-200">
        {restaurant.bannerUrl && (
            <img src={restaurant.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="container mx-auto px-4 max-w-4xl -mt-10 relative flex flex-col md:flex-row items-start md:items-end gap-4">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-md z-10">
           {restaurant.logoUrl ? (
             <img src={restaurant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Logo</div>
           )}
        </div>
        <div className="flex-1 pt-2 md:pt-0">
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{restaurant.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
