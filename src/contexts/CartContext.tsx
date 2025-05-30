"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: string | number; // Support both string UUIDs and numeric IDs
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  designer: { name: string; logo: string };
  quantity: number;
  size: string;
  color: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, size: string, color: string) => void;
  updateCartItemQuantity: (id: string | number, size: string, color: string, quantity: number) => void;
  removeFromCart: (id: string | number, size: string, color: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Callback for when items are added (used by ToastProvider)
  onCartAdd?: (productName: string, size: string, color: string, isNewItem: boolean) => void;
  setOnCartAdd: (callback: (productName: string, size: string, color: string, isNewItem: boolean) => void) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [onCartAdd, setOnCartAdd] = useState<((productName: string, size: string, color: string, isNewItem: boolean) => void) | undefined>();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('baguri-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Silently load cart without triggering any notifications
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear invalid cart data
        localStorage.removeItem('baguri-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('baguri-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, size: string, color: string) => {
    const existingItem = cart.find(item => 
      item.id === product.id && item.size === size && item.color === color
    );

    const isNewItem = !existingItem;

    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id && item.size === size && item.color === color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        designer: product.designer,
        quantity: 1,
        size,
        color
      };
      setCart([...cart, newItem]);
    }

    // Trigger toast notification
    if (onCartAdd) {
      onCartAdd(product.name, size, color, isNewItem);
    }
  };

  const updateCartItemQuantity = (id: string | number, size: string, color: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id, size, color);
    } else {
      setCart(cart.map(item => 
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (id: string | number, size: string, color: string) => {
    setCart(cart.filter(item => !(item.id === id && item.size === size && item.color === color)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const value: CartContextType = {
    cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
    onCartAdd,
    setOnCartAdd,
  };

  return (
    <CartContext.Provider value={value}>
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