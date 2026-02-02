'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/db';

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity: number, selectedFlavor?: string, selectedAddons?: string[]) => {
    setItems(prev => {
      const existing = prev.find(item => {
        const sameId = item.id === product.id;
        const sameFlavor = item.selectedFlavor === selectedFlavor;
        
        // Compare addons arrays
        const itemAddons = item.selectedAddons || [];
        const newAddons = selectedAddons || [];
        const sameAddons = itemAddons.length === newAddons.length && 
          itemAddons.sort().every((val, index) => val === newAddons.sort()[index]);
          
        return sameId && sameFlavor && sameAddons;
      });

      if (existing) {
        return prev.map(item => {
          const sameId = item.id === product.id;
          const sameFlavor = item.selectedFlavor === selectedFlavor;
          const itemAddons = item.selectedAddons || [];
          const newAddons = selectedAddons || [];
          const sameAddons = itemAddons.length === newAddons.length && 
            itemAddons.sort().every((val, index) => val === newAddons.sort()[index]);

          return (sameId && sameFlavor && sameAddons)
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      }
      return [...prev, { ...product, quantity, selectedFlavor, selectedAddons }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedFlavor?: string, selectedAddons?: string[]) => {
    setItems(prev => prev.filter(item => {
      const sameId = item.id === productId;
      const sameFlavor = item.selectedFlavor === selectedFlavor;
      
      const itemAddons = item.selectedAddons || [];
      const targetAddons = selectedAddons || [];
      const sameAddons = itemAddons.length === targetAddons.length && 
        itemAddons.sort().every((val, index) => val === targetAddons.sort()[index]);
        
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
      
      const itemAddons = item.selectedAddons || [];
      const targetAddons = selectedAddons || [];
      const sameAddons = itemAddons.length === targetAddons.length && 
        itemAddons.sort().every((val, index) => val === targetAddons.sort()[index]);
        
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
