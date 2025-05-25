"use client";

import React, { useEffect } from 'react';
import { CartProvider, useCart } from './CartContext';
import { ToastProvider, useToast } from './ToastContext';
import { ToastContainer } from '@/components/Toast';

// Inner component that connects cart events to toast notifications
function CartToastConnector({ children }: { children: React.ReactNode }) {
  const { setOnCartAdd, setIsCartOpen } = useCart();
  const { showCartAddSuccess } = useToast();

  useEffect(() => {
    // Set up the connection between cart adds and toast notifications
    // Only show toast for actual new additions (not on page load/refresh)
    setOnCartAdd((productName: string, size: string, color: string, isNewItem: boolean) => {
      // Additional validation to prevent stale/invalid calls
      if (productName && size && color) {
        showCartAddSuccess(productName, size, color, () => {
          setIsCartOpen(true);
        });
      }
    });
  }, [setOnCartAdd, showCartAddSuccess, setIsCartOpen]);

  return <>{children}</>;
}

// Combined provider that sets up all the necessary context providers
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <CartToastConnector>
          {children}
          <ToastContainer />
        </CartToastConnector>
      </CartProvider>
    </ToastProvider>
  );
} 