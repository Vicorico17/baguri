"use client";

import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getStripePaymentUrl, hasStripeIntegration, getStripeData } from '@/lib/stripe';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Placeholder component for images when no image is available
function PlaceholderImage({ type, className, alt }: { type: 'product' | 'logo'; className?: string; alt: string }) {
  const colors = {
    product: ['bg-gradient-to-br from-amber-100 to-amber-200', 'bg-gradient-to-br from-zinc-100 to-zinc-300', 'bg-gradient-to-br from-emerald-100 to-emerald-200', 'bg-gradient-to-br from-rose-100 to-rose-200'],
    logo: ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500']
  };
  
  const colorIndex = alt.length % colors[type].length;
  const bgColor = colors[type][colorIndex];
  
  return (
    <div className={`${bgColor} flex items-center justify-center ${className}`}>
      <span className="text-zinc-600 text-xs font-bold opacity-50">
        {type === 'logo' ? alt.substring(0, 2).toUpperCase() : 'IMG'}
      </span>
    </div>
  );
}

export function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, updateCartItemQuantity, cartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll when cart is open on mobile
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

  const handleQuickCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // For now, handle the first item (in production, you'd create a session with all items)
      const firstItem = cart[0];
      
      console.log('Starting checkout for item:', firstItem);
      
      // Check if this product has Stripe integration
      if (!hasStripeIntegration(firstItem.id)) {
        throw new Error(`Product "${firstItem.name}" doesn't have Stripe integration set up yet.`);
      }
      
      // Get Stripe data for the product
      const stripeData = getStripeData(firstItem.id);
      
      console.log('Stripe data for product:', stripeData);
      
      if (!stripeData.priceId) {
        throw new Error(`No price found for product: ${firstItem.name}`);
      }

      // Prepare items for checkout
      const checkoutItems = cart.map(item => {
        const itemStripeData = getStripeData(item.id);
        return {
          priceId: itemStripeData.priceId,
          quantity: item.quantity,
          productName: item.name,
          productId: item.id
        };
      }).filter(item => item.priceId); // Only include items with valid Stripe integration

      console.log('Checkout items:', checkoutItems);

      if (checkoutItems.length === 0) {
        throw new Error('No products in cart have Stripe integration set up.');
      }

      // Create checkout session via API
      console.log('Making API call to create checkout session...');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create checkout session`);
      }

      const result = await response.json();
      console.log('Checkout session result:', result);
      
      if (!result.url) {
        throw new Error('No checkout URL received from server');
      }
      
      // Redirect to Stripe checkout
      console.log('Redirecting to:', result.url);
      window.location.href = result.url;
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50 safe-area-inset" onClick={() => setIsCartOpen(false)}>
      {/* Mobile handle bar - only visible on mobile */}
      <div className="md:hidden absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full z-10"></div>
      
      <div className="bg-zinc-900 w-full max-w-md h-full overflow-y-auto mobile-cart-sidebar mobile-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 mobile-p-4 safe-area-bottom">
          <div className="flex justify-between items-center mb-6 mobile-mb-4">
            <h2 className="text-xl font-bold mobile-text-lg">Shopping Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-zinc-800 rounded mobile-touch-target">
              <X size={20} />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-zinc-400 text-center py-8 mobile-py-6">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6 mobile-gap-3 mobile-mb-4">
                {cart.map((item, index) => {
                  const stripeData = getStripeData(item.id);
                  
                  return (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex gap-3 p-3 bg-zinc-800 rounded-lg mobile-p-3 mobile-card">
                      {item.image ? (
                        <div className="w-15 h-20 rounded mobile-w-12 mobile-h-16 relative overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <PlaceholderImage 
                          type="product" 
                          alt={item.name}
                          className="w-15 h-20 rounded mobile-w-12 mobile-h-16"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium mb-1 mobile-text-sm mobile-line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mb-1 mobile-truncate">{item.designer.name}</p>
                        <p className="text-xs text-zinc-400 mb-2">{item.size} • {item.color}</p>
                        
                        {/* Stripe Integration Status - Collapsible on mobile */}
                        <div className="mb-2 mobile-collapsible">
                          {stripeData.source !== 'none' ? (
                            <span className={`text-xs px-2 py-1 rounded mobile-text-xs ${
                              stripeData.source === 'dynamic' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {stripeData.source === 'dynamic' ? '🤖 Auto-integrated' : '📦 Pre-configured'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 mobile-text-xs">
                              ⚠️ No payment setup
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold mobile-text-sm">{item.price} lei</span>
                          <div className="flex items-center gap-2 mobile-gap-3">
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.size, item.color, item.quantity - 1)}
                              className="p-1 hover:bg-zinc-700 rounded mobile-touch-target"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center mobile-text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.size, item.color, item.quantity + 1)}
                              className="p-1 hover:bg-zinc-700 rounded mobile-touch-target"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t border-zinc-700 pt-4 space-y-4 mobile-pt-3 mobile-gap-3">
                <div className="flex justify-between items-center text-lg font-bold mobile-text-base">
                  <span>Total:</span>
                  <span>{cartTotal} lei</span>
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mobile-p-2">
                    <p className="text-red-400 text-sm mobile-text-xs">{error}</p>
                  </div>
                )}
                
                {/* Integration Status Summary - Collapsible on mobile */}
                <div className="text-xs text-zinc-400 space-y-1 mobile-collapsible mobile-text-xs">
                  <p className="font-medium">Payment Integration Status:</p>
                  {cart.map((item, index) => {
                    const stripeData = getStripeData(item.id);
                    return (
                      <div key={`status-${item.id}-${index}`} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          stripeData.source !== 'none' ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        <span className="mobile-truncate">{item.name}: {
                          stripeData.source === 'dynamic' ? 'Auto-created' :
                          stripeData.source === 'static' ? 'Pre-configured' :
                          'Missing integration'
                        }</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-2 mobile-gap-3">
                  <button 
                    onClick={handleQuickCheckout}
                    disabled={isProcessing || cart.length === 0}
                    className={`w-full py-3 rounded-lg font-medium transition mobile-touch-target mobile-text-base ${
                      isProcessing 
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed mobile-loading' 
                        : 'bg-white text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Quick Checkout'}
                  </button>
                  
                  <p className="text-xs text-zinc-500 text-center mobile-text-xs mobile-px-2">
                    ✨ Products with automated integration are ready for immediate checkout
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 