"use client";

import { useState } from 'react';
import { getStripePriceId } from '@/lib/stripe';
import type { CartItem } from '@/contexts/CartContext';

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (cartItems: CartItem[]) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Group cart items by product ID and sum quantities
      const groupedItems = cartItems.reduce((acc, item) => {
        const key = item.id;
        if (acc[key]) {
          acc[key].quantity += item.quantity;
        } else {
          acc[key] = {
            productId: item.id,
            quantity: item.quantity,
            priceId: getStripePriceId(item.id)
          };
        }
        return acc;
      }, {} as Record<string, { productId: string | number; quantity: number; priceId: string | null }>);

      // Create payment links for each unique product
      const checkoutPromises = Object.values(groupedItems).map(async (item) => {
        if (!item.priceId) {
          throw new Error(`No Stripe price found for product ID ${item.productId}`);
        }

        // For now, we'll create individual payment links
        // In a real app, you'd want to create a single checkout session with multiple items
        const response = await fetch('/api/create-payment-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: item.priceId,
            quantity: item.quantity,
            referralCode: typeof window !== 'undefined' ? localStorage.getItem('referral_code') : undefined
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create payment link for product ${item.productId}`);
        }

        return response.json();
      });

      const paymentLinks = await Promise.all(checkoutPromises);
      
      // For simplicity, redirect to the first payment link
      // In a real app, you'd create a single checkout with multiple line items
      if (paymentLinks.length > 0 && paymentLinks[0].url) {
        window.open(paymentLinks[0].url, '_blank');
      } else {
        throw new Error('No payment link created');
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCheckout,
    isProcessing,
    error
  };
} 