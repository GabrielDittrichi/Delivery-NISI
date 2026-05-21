'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/db';
import { trackMarketingEvent } from '@/lib/tracking';

export interface CartItem extends Product {
  quantity: number;
  selectedFlavor?: string;
  selectedAddons?: string[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedFlavor?: string, selectedAddons?: string[]) => void;
  removeFromCart: (productId: string, selectedFlavor?: string, selectedAddons?: string[]) => void;
  updateQuantity: (productId: string, quantity: number, selectedFlavor?: string, selectedAddons?: string[]) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function trackClientEvent(type: 'add_to_cart', metadata?: Record<string, unknown>) {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, metadata }),
    keepalive: true,
  }).catch(() => {});
}

function sameSelection(
  itemAddons: string[] | undefined,
  targetAddons: string[] | undefined
) {
  const current = [...(itemAddons || [])].sort();
  const target = [...(targetAddons || [])].sort();
  return current.length === target.length && current.every((val, index) => val === target[index]);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, selectedFlavor?: string, selectedAddons?: string[]) => {
    setItems(prev => {
      const existing = prev.find(item => {
        const sameId = item.id === product.id;
        const sameFlavor = item.selectedFlavor === selectedFlavor;
        const sameAddons = sameSelection(item.selectedAddons, selectedAddons);
          
        return sameId && sameFlavor && sameAddons;
      });

      if (existing) {
        return prev.map(item => {
          const sameId = item.id === product.id;
          const sameFlavor = item.selectedFlavor === selectedFlavor;
          const sameAddons = sameSelection(item.selectedAddons, selectedAddons);

          return (sameId && sameFlavor && sameAddons)
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      return [...prev, { ...product, quantity, selectedFlavor, selectedAddons }];
    });
    trackClientEvent('add_to_cart', {
      productId: product.id,
      productName: product.name,
      quantity,
      hasFlavor: Boolean(selectedFlavor),
      addons: selectedAddons?.length || 0,
    });
    trackMarketingEvent('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      currency: 'BRL',
      value: product.price * quantity,
      quantity,
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedFlavor?: string, selectedAddons?: string[]) => {
    setItems(prev => prev.filter(item => {
      const sameId = item.id === productId;
      const sameFlavor = item.selectedFlavor === selectedFlavor;
      const sameAddons = sameSelection(item.selectedAddons, selectedAddons);
        
      return !(sameId && sameFlavor && sameAddons);
    }));
  };

  const updateQuantity = (productId: string, quantity: number, selectedFlavor?: string, selectedAddons?: string[]) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedFlavor, selectedAddons);
      return;
    }
    setItems(prev => prev.map(item => {
      const sameId = item.id === productId;
      const sameFlavor = item.selectedFlavor === selectedFlavor;
      const sameAddons = sameSelection(item.selectedAddons, selectedAddons);
        
      return (sameId && sameFlavor && sameAddons) ? { ...item, quantity } : item;
    }));
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => {
    const addonsPrice = item.selectedAddons?.reduce((acc, addonId) => {
      const addon = item.addons?.find(a => a.id === addonId);
      return acc + (addon?.price || 0);
    }, 0) || 0;
    return total + ((item.price + addonsPrice) * item.quantity);
  }, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
