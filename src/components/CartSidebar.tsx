"use client";

import { X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getStripePaymentUrl, hasStripeIntegration, getStripeData } from '@/lib/stripe';
import { useState } from 'react';

// Placeholder component for images
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

  const handleQuickCheckout = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Get the first item for demo purposes
      const firstItem = cart[0];
      
      // Check if this product has Stripe integration
      if (!hasStripeIntegration(firstItem.id)) {
        throw new Error(`Product "${firstItem.name}" doesn't have Stripe integration set up yet.`);
      }
      
      // Get the payment URL
      const paymentUrl = getStripePaymentUrl(firstItem.id);
      
      if (!paymentUrl) {
        throw new Error(`No payment link found for product: ${firstItem.name}`);
      }
      
      // Get Stripe data for display purposes
      const stripeData = getStripeData(firstItem.id);
      
      // Open the Stripe checkout
      window.open(paymentUrl, '_blank');
      
      // Show success message with integration info
      const integrationSource = stripeData.source === 'dynamic' ? 'automatically created' : 'pre-configured';
      const message = `Checkout opened for ${firstItem.name}!\n\nTotal: ${firstItem.price * firstItem.quantity} lei\nIntegration: ${integrationSource}\n\nNote: This demo checkout is for the first item only. In production, you'd create a single checkout session with all cart items.`;
      
      alert(message);
      
      console.log('💳 Checkout Details:', {
        product: firstItem.name,
        price: `${firstItem.price * firstItem.quantity} lei`,
        stripeProductId: stripeData.productId,
        stripePriceId: stripeData.priceId,
        paymentUrl: paymentUrl,
        integrationSource: stripeData.source
      });

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setIsCartOpen(false)}>
      <div className="bg-zinc-900 w-full max-w-md h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-zinc-800 rounded">
              <X size={20} />
            </button>
          </div>
          
          {cart.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => {
                  const stripeData = getStripeData(item.id);
                  
                  return (
                    <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex gap-3 p-3 bg-zinc-800 rounded-lg">
                      <PlaceholderImage 
                        type="product" 
                        alt={item.name}
                        className="w-15 h-20 rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.name}</h3>
                        <p className="text-xs text-zinc-400 mb-1">{item.designer.name}</p>
                        <p className="text-xs text-zinc-400 mb-2">{item.size} • {item.color}</p>
                        
                        {/* Stripe Integration Status */}
                        <div className="mb-2">
                          {stripeData.source !== 'none' ? (
                            <span className={`text-xs px-2 py-1 rounded ${
                              stripeData.source === 'dynamic' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {stripeData.source === 'dynamic' ? '🤖 Auto-integrated' : '📦 Pre-configured'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                              ⚠️ No payment setup
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{item.price} lei</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.size, item.color, item.quantity - 1)}
                              className="p-1 hover:bg-zinc-700 rounded"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartItemQuantity(item.id, item.size, item.color, item.quantity + 1)}
                              className="p-1 hover:bg-zinc-700 rounded"
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
              
              <div className="border-t border-zinc-700 pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{cartTotal} lei</span>
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                {/* Integration Status Summary */}
                <div className="text-xs text-zinc-400 space-y-1">
                  <p className="font-medium">Payment Integration Status:</p>
                  {cart.map((item, index) => {
                    const stripeData = getStripeData(item.id);
                    return (
                      <div key={`status-${item.id}-${index}`} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          stripeData.source !== 'none' ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        <span>{item.name}: {
                          stripeData.source === 'dynamic' ? 'Auto-created' :
                          stripeData.source === 'static' ? 'Pre-configured' :
                          'Missing integration'
                        }</span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={handleQuickCheckout}
                    disabled={isProcessing || cart.length === 0}
                    className={`w-full py-3 rounded-lg font-medium transition ${
                      isProcessing 
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                        : 'bg-white text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {isProcessing ? 'Processing...' : 'Quick Checkout'}
                  </button>
                  
                  <p className="text-xs text-zinc-500 text-center">
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