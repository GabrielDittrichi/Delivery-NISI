'use client'

import { Product } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, Star, User, X, ZoomIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { trackProductView } from '@/lib/analytics';

export default function ProductDetails({ product, primaryColor }: { product: Product, primaryColor: string }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    trackProductView(product.id);
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedFlavor, selectedAddons);
    router.push('/');
  };

  const handleAddonToggle = (addonId: string) => {
    if (product.allowMultipleAddons) {
      setSelectedAddons(prev => 
        prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
      );
    } else {
      setSelectedAddons(prev => 
        prev.includes(addonId) ? [] : [addonId]
      );
    }
  };

  const currentPrice = product.price + selectedAddons.reduce((total, addonId) => {
    const addon = product.addons.find(a => a.id === addonId);
    return total + (addon?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       {/* Simple Header for navigation */}
       <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
         <div className="container mx-auto max-w-2xl flex items-center">
             <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                 <ArrowLeft size={24} color={primaryColor} />
             </Link>
             <h1 className="ml-2 font-medium text-lg text-gray-800">Detalhes do Produto</h1>
         </div>
       </div>

       <div className="container mx-auto max-w-2xl">
          {product.imageUrl && (
              <div 
                className="w-full h-64 md:h-80 bg-white relative cursor-pointer group overflow-hidden"
                onClick={() => setIsImageOpen(true)}
              >
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain bg-white"
                  />
                  <div className="absolute inset-0 transition-all flex items-center justify-center hover:bg-black/10">
                    <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={32} />
                  </div>
              </div>
          )}

          {/* Lightbox Modal */}
          {isImageOpen && product.imageUrl && (
            <div 
              className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4 animate-in fade-in duration-200"
              onClick={() => setIsImageOpen(false)}
            >
              <button 
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => setIsImageOpen(false)}
              >
                <X size={32} />
              </button>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          )}

          <div className="p-6 bg-white">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
              
              <div className="flex gap-6 mb-6 text-sm text-gray-500 border-t border-b py-4">
                  {product.weight > 0 && (
                      <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-900">{product.weight}g</span>
                          <span>Peso</span>
                      </div>
                  )}
                  {product.volume > 0 && (
                      <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-900">{product.volume}ml</span>
                          <span>Volume</span>
                      </div>
                  )}
                  {product.calories > 0 && (
                      <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-900">{product.calories}</span>
                          <span>Kcal</span>
                      </div>
                  )}
                  {product.proteins > 0 && (
                      <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-900">{product.proteins}g</span>
                          <span>Proteínas</span>
                      </div>
                  )}
              </div>

              {product.flavors && product.flavors.length > 0 && (
                  <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Escolha um sabor</h3>
                      <div className="space-y-2">
                          {product.flavors.map((flavor) => (
                              <label key={flavor.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                      type="radio"
                                      name="flavor"
                                      value={flavor.id}
                                      checked={selectedFlavor === flavor.id}
                                      onChange={() => setSelectedFlavor(flavor.id)}
                                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                      style={{ color: primaryColor }}
                                  />
                                  <span className="ml-3 text-gray-900">{flavor.name}</span>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              {product.addons && product.addons.length > 0 && (
                  <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Adicionais (opcional)</h3>
                      <div className="space-y-2">
                          {product.addons.map((addon) => (
                              <label key={addon.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <input
                                      type={product.allowMultipleAddons ? "checkbox" : "radio"}
                                      name="addon"
                                      value={addon.id}
                                      checked={selectedAddons.includes(addon.id)}
                                      onChange={() => handleAddonToggle(addon.id)}
                                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 rounded"
                                      style={{ color: primaryColor }}
                                  />
                                  <span className="ml-3 text-gray-900 flex-1">
                                      {addon.name}
                                      {addon.price > 0 && (
                                          <span className="text-gray-500 text-sm ml-2">
                                              (+ R$ {addon.price.toFixed(2).replace('.', ',')})
                                          </span>
                                      )}
                                  </span>
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              <div className="text-2xl font-semibold" style={{ color: primaryColor }}>
                  R$ {currentPrice.toFixed(2).replace('.', ',')}
              </div>
          </div>

          {/* Fictitious Reviews */}
          <div className="p-6 bg-white mt-2 mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Avaliações dos Clientes</h2>
              <div className="space-y-6">
                  <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800">Ricardo Silva</span>
                          <div className="flex items-center ml-auto">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} fill={i < 5 ? primaryColor : "transparent"} color={primaryColor} />
                              ))}
                          </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"Muito bom! Chegou quentinho e o tempero estava perfeito."</p>
                  </div>

                  <div className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800">Ana Oliveira</span>
                          <div className="flex items-center ml-auto">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} fill={i < 4 ? primaryColor : "transparent"} color={primaryColor} />
                              ))}
                          </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"Gostei bastante, só achei que poderia vir um pouco mais de molho. Mas a qualidade é excelente!"</p>
                  </div>

                  <div className="pb-4">
                      <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={16} className="text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800">Marcos Paulo</span>
                          <div className="flex items-center ml-auto">
                              {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} fill={i < 5 ? primaryColor : "transparent"} color={primaryColor} />
                              ))}
                          </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">"Melhor custo benefício da região. Recomendo com certeza!"</p>
                  </div>
              </div>
          </div>
       </div>

       {/* Footer Actions */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-20">
           <div className="container mx-auto max-w-2xl flex items-center gap-4">
               {/* Quantity Selector */}
               <div className="flex items-center border rounded-lg h-12">
                   <button 
                     onClick={() => setQuantity(q => Math.max(1, q - 1))}
                     className="w-12 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 active:bg-gray-100 rounded-l-lg"
                   >
                       <Minus size={20} />
                   </button>
                   <span className="w-8 text-center font-medium text-gray-900">{quantity}</span>
                   <button 
                     onClick={() => setQuantity(q => q + 1)}
                     className="w-12 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 rounded-r-lg" 
                     style={{ color: primaryColor }}
                   >
                       <Plus size={20} />
                   </button>
               </div>

               <button 
                  onClick={handleAddToCart}
                  disabled={product.flavors && product.flavors.length > 0 && !selectedFlavor}
                  className="flex-1 h-12 rounded-lg font-semibold text-white flex items-center justify-center gap-2 active:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
               >
                   <span>Adicionar</span>
                   <span className="bg-black/20 px-2 py-0.5 rounded text-sm">
                       R$ {(currentPrice * quantity).toFixed(2).replace('.', ',')}
                   </span>
               </button>
           </div>
       </div>
    </div>
  );
}
