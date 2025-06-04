"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear cart from localStorage after successful purchase
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baguri-cart');
    }
    
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
            <div className="mb-6">
              <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-zinc-400">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {sessionId && (
              <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={16} className="text-zinc-400" />
                  <span className="text-sm font-medium">Order Reference</span>
                </div>
                <p className="text-xs text-zinc-500 font-mono break-all">
                  {sessionId}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                You will receive an email confirmation shortly with your order details and tracking information.
              </p>
              
              <div className="pt-4 space-y-3">
                <Link 
                  href="/shop"
                  className="block w-full py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition font-medium"
                >
                  Continue Shopping
                </Link>
                
                <Link 
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition"
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 