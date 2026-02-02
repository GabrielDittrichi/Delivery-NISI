'use client'

import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartSidebar() {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    updateQuantity, 
    removeFromCart, 
    cartTotal 
  } = useCart();

  // Prevent scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCartOpen(false)}
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Seu Carrinho</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <p>Seu carrinho está vazio.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-green-600 font-medium hover:underline"
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={`${item.id}-${item.selectedFlavor || ''}-${JSON.stringify(item.selectedAddons || [])}-${index}`} className="flex gap-4 py-4 border-b last:border-0">
                       {item.imageUrl && (
                         <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                           <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                       )}
                       <div className="flex-1 flex flex-col justify-between">
                         <div className="flex justify-between">
                           <div>
                               <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                               {item.selectedFlavor && (
                                   <div className="text-sm text-gray-500 mt-1">
                                       Sabor: {item.flavors?.find(f => f.id === item.selectedFlavor)?.name}
                                   </div>
                               )}
                               {item.selectedAddons && item.selectedAddons.length > 0 && (
                                   <div className="text-sm text-gray-500 mt-1">
                                       Adicionais: {item.selectedAddons.map(id => {
                                           const addon = item.addons?.find(a => a.id === id);
                                           if (!addon) return null;
                                           return addon.price > 0 
                                             ? `${addon.name} (+R$ ${addon.price.toFixed(2).replace('.', ',')})`
                                             : addon.name;
                                       }).filter(Boolean).join(', ')}
                                   </div>
                               )}
                           </div>
                           <button 
                             onClick={() => removeFromCart(item.id, item.selectedFlavor, item.selectedAddons)}
                             className="text-gray-400 hover:text-red-500 p-1 h-fit"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                         <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center border rounded-md h-8">
                             <button 
                               onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedFlavor, item.selectedAddons)}
                               className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50"
                             >
                               <Minus size={14} />
                             </button>
                             <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                             <button 
                               onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedFlavor, item.selectedAddons)}
                               className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-gray-50"
                             >
                               <Plus size={14} />
                             </button>
                           </div>
                           <div className="font-semibold text-gray-900">
                             R$ {((item.price + (item.selectedAddons?.reduce((acc, id) => acc + (item.addons?.find(a => a.id === id)?.price || 0), 0) || 0)) * item.quantity).toFixed(2).replace('.', ',')}
                           </div>
                         </div>
                       </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t p-4 space-y-4 bg-gray-50">
                  <div className="flex items-center justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center bg-yellow-50 p-2 rounded border border-yellow-100">
                    🛵 Frete calculado no atendimento
                  </p>
                  <Link 
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Finalizar Pedido
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
