"use client";

import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getStripePaymentUrl, hasStripeIntegration, getStripeData } from '@/lib/stripe';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from "@/lib/supabase";

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

// Type for Stripe data
interface StripeDataResult {
  productId: string | null;
  priceId: string | null;
  paymentUrl: string | null;
  source: 'dynamic' | 'static' | 'none';
}

export function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, updateCartItemQuantity, cartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeDataCache, setStripeDataCache] = useState<Record<string, StripeDataResult>>({});
  const [loadingStripeData, setLoadingStripeData] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Function to validate product availability and status
  const validateProduct = async (productId: string): Promise<{ isValid: boolean; error?: string; product?: any }> => {
    try {
      const { data: product, error: productError } = await supabase
        .from('designer_products')
        .select(`
          *,
          designers!inner (
            status,
            brand_name
          )
        `)
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return { isValid: false, error: 'Product not found' };
      }

      // Check if designer is approved
      if (product.designers.status !== 'approved') {
        return { 
          isValid: false, 
          error: `${product.name} is not available - designer pending approval` 
        };
      }

      // Check if product is active
      if (!product.is_active) {
        return { 
          isValid: false, 
          error: `${product.name} has been deactivated` 
        };
      }

      // Check if product is live
      if (!product.is_live) {
        return { 
          isValid: false, 
          error: `${product.name} is not currently available` 
        };
      }

      // Check stock status
      if (product.stock_status === 'coming_soon') {
        return { 
          isValid: false, 
          error: `${product.name} is coming soon - not yet available` 
        };
      }

      // For products with size/color variants, check specific stock
      if (product.colors && Array.isArray(product.colors)) {
        // This validation would need to be more specific based on the selected size/color
        // For now, we'll just check if the product has any available variants
        const hasAvailableVariants = product.colors.some((color: any) => 
          color.sizes && Array.isArray(color.sizes) && 
          color.sizes.some((size: any) => size.stock > 0)
        );

        if (!hasAvailableVariants) {
          return { 
            isValid: false, 
            error: `${product.name} is out of stock` 
          };
        }
      }

      return { isValid: true, product };
    } catch (error) {
      console.error('Error validating product:', error);
      return { 
        isValid: false, 
        error: 'Unable to verify product availability' 
      };
    }
  };

  // Function to validate cart item stock for specific size/color
  const validateCartItemStock = (product: any, cartItem: any): { isValid: boolean; error?: string } => {
    if (!product.colors || !Array.isArray(product.colors)) {
      return { isValid: true }; // No variant system, assume available
    }

    // Find the specific color
    const selectedColor = product.colors.find((color: any) => 
      color.name.toLowerCase() === cartItem.color.toLowerCase()
    );

    if (!selectedColor) {
      return { 
        isValid: false, 
        error: `Color "${cartItem.color}" is no longer available for ${product.name}` 
      };
    }

    // Find the specific size
    const selectedSize = selectedColor.sizes?.find((size: any) => 
      size.size === cartItem.size
    );

    if (!selectedSize) {
      return { 
        isValid: false, 
        error: `Size "${cartItem.size}" is no longer available in ${cartItem.color} for ${product.name}` 
      };
    }

    // Check if enough stock is available
    if (selectedSize.stock < cartItem.quantity) {
      return { 
        isValid: false, 
        error: `Only ${selectedSize.stock} items available for ${product.name} in ${cartItem.size}/${cartItem.color}` 
      };
    }

    return { isValid: true };
  };

  // Validate all cart items before checkout
  const validateCartForCheckout = async (): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    const itemValidation: Record<string, string> = {};

    for (const item of cart) {
      const validation = await validateProduct(String(item.id));
      
      if (!validation.isValid) {
        errors.push(validation.error || 'Product validation failed');
        itemValidation[`${item.id}-${item.size}-${item.color}`] = validation.error || 'Invalid';
        continue;
      }

      // Check specific variant stock
      const stockValidation = validateCartItemStock(validation.product, item);
      if (!stockValidation.isValid) {
        errors.push(stockValidation.error || 'Stock validation failed');
        itemValidation[`${item.id}-${item.size}-${item.color}`] = stockValidation.error || 'Out of stock';
      }
    }

    setValidationErrors(itemValidation);
    return { isValid: errors.length === 0, errors };
  };

  // Function to fetch Stripe data for a product
  const fetchStripeData = async (productId: string): Promise<StripeDataResult> => {
    if (stripeDataCache[productId]) {
      return stripeDataCache[productId];
    }

    if (loadingStripeData.has(productId)) {
      // Wait for existing request
      return new Promise((resolve) => {
        const checkCache = () => {
          if (stripeDataCache[productId]) {
            resolve(stripeDataCache[productId]);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    setLoadingStripeData(prev => new Set(prev).add(productId));

    try {
      const response = await fetch(`/api/stripe-data/${productId}`);
      const data = await response.json();
      
      setStripeDataCache(prev => ({ ...prev, [productId]: data }));
      return data;
    } catch (error) {
      console.error('Error fetching Stripe data:', error);
      const fallbackData = getStripeData(productId);
      setStripeDataCache(prev => ({ ...prev, [productId]: fallbackData }));
      return fallbackData;
    } finally {
      setLoadingStripeData(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Load Stripe data for all cart items
  useEffect(() => {
    if (isCartOpen && cart.length > 0) {
      cart.forEach(item => {
        const productIdStr = String(item.id);
        if (!stripeDataCache[productIdStr] && !loadingStripeData.has(productIdStr)) {
          fetchStripeData(productIdStr);
        }
      });
    }
  }, [isCartOpen, cart, stripeDataCache, loadingStripeData]);

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
    setValidationErrors({});

    try {
      // First, validate all cart items
      const validation = await validateCartForCheckout();
      
      if (!validation.isValid) {
        throw new Error(`Cannot proceed with checkout:\n${validation.errors.join('\n')}`);
      }

      // Get Stripe data for all cart items
      const cartWithStripeData = await Promise.all(
        cart.map(async (item) => {
          const stripeData = await fetchStripeData(String(item.id));
          return { ...item, stripeData };
        })
      );

      // Prepare items for checkout
      const checkoutItems = cartWithStripeData
        .filter(item => item.stripeData.priceId)
        .map(item => ({
          priceId: item.stripeData.priceId!,
          quantity: item.quantity,
          productName: item.name,
          productId: item.id
        }));

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
          items: checkoutItems,
          referralCode: typeof window !== 'undefined' ? localStorage.getItem('referral_code') : undefined
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
                  const productIdStr = String(item.id);
                  const stripeData = stripeDataCache[productIdStr] || { 
                    productId: null, 
                    priceId: null, 
                    paymentUrl: null, 
                    source: 'none' as const 
                  };
                  const isLoadingStripe = loadingStripeData.has(productIdStr);
                  const itemKey = `${item.id}-${item.size}-${item.color}`;
                  const validationError = validationErrors[itemKey];
                  
                  // Debug logging
                  console.log('Cart item image:', item.image, 'for product:', item.name);
                  
                  return (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex gap-4 p-4 bg-zinc-800 rounded-lg mobile-p-3 mobile-card border border-zinc-700">
                      {item.image ? (
                        <div className="w-16 h-20 rounded-lg mobile-w-12 mobile-h-16 relative overflow-hidden flex-shrink-0 bg-zinc-700 border border-zinc-600">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              console.error('Failed to load image:', item.image, 'for product:', item.name);
                              // If image fails to load, hide it and show placeholder
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                            onLoad={() => {
                              console.log('Successfully loaded image:', item.image, 'for product:', item.name);
                            }}
                          />
                          <PlaceholderImage 
                            type="product" 
                            alt={item.name}
                            className="w-full h-full absolute inset-0 hidden"
                          />
                        </div>
                      ) : (
                        <PlaceholderImage 
                          type="product" 
                          alt={item.name}
                          className="w-16 h-20 rounded-lg mobile-w-12 mobile-h-16 flex-shrink-0 border border-zinc-600"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium mb-1 mobile-text-sm mobile-line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mb-1 mobile-truncate">{item.designer.name}</p>
                        <p className="text-xs text-zinc-400 mb-2">{item.size} • {item.color}</p>
                        
                        {/* Validation Error - Priority Display */}
                        {validationError ? (
                          <div className="mb-2">
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30 mobile-text-xs">
                              ❌ {validationError}
                            </span>
                          </div>
                        ) : (
                          /* Stripe Integration Status - Collapsible on mobile */
                        <div className="mb-2 mobile-collapsible">
                          {isLoadingStripe ? (
                            <span className="text-xs px-2 py-1 rounded bg-zinc-500/20 text-zinc-400 mobile-text-xs">
                              🔄 Verifying stock...
                            </span>
                          ) : stripeData.source !== 'none' ? (
                            <span className={`text-xs px-2 py-1 rounded mobile-text-xs ${
                              stripeData.source === 'dynamic' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {stripeData.source === 'dynamic' ? '✅ In Stock' : '📦 Pre-configured'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 mobile-text-xs">
                              ⚠️ No payment setup
                            </span>
                          )}
                        </div>
                        )}
                        
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
                  <div className={`${
                    error.includes('✅') 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-red-500/10 border border-red-500/20'
                  } rounded-lg p-3 mobile-p-2`}>
                    <p className={`${
                      error.includes('✅') ? 'text-green-400' : 'text-red-400'
                    } text-sm mobile-text-xs`}>
                      {error}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2 mobile-gap-3">
                  {/* Validation Check Button */}
                  <button 
                    onClick={async () => {
                      setError(null);
                      setValidationErrors({});
                      const validation = await validateCartForCheckout();
                      if (validation.isValid) {
                        // Show success message temporarily
                        setError("✅ All items are verified and available for purchase!");
                        setTimeout(() => setError(null), 3000);
                      }
                    }}
                    className="w-full py-2 text-sm border border-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-800 transition mobile-touch-target"
                  >
                    🔍 Check Product Availability
                  </button>
                  
                  <button 
                    onClick={handleQuickCheckout}
                    disabled={isProcessing || cart.length === 0 || Object.keys(validationErrors).length > 0}
                    className={`w-full py-3 rounded-lg font-medium transition mobile-touch-target mobile-text-base ${
                      isProcessing 
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed mobile-loading' 
                        : Object.keys(validationErrors).length > 0
                        ? 'bg-red-500/20 text-red-400 cursor-not-allowed border border-red-500/30'
                        : 'bg-white text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {isProcessing 
                      ? 'Processing...' 
                      : Object.keys(validationErrors).length > 0
                      ? 'Fix Issues Above First'
                      : 'Quick Checkout'
                    }
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 