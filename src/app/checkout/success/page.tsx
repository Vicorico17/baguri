"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowLeft, Sparkles } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { OrderTracker } from "@/components/ui/order-tracker";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    // Clear cart from localStorage after successful purchase
    if (typeof window !== 'undefined') {
      localStorage.removeItem('baguri-cart');
    }
    
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Hide celebration after 5 seconds
    const celebrationTimer = setTimeout(() => {
      setShowCelebration(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(celebrationTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <CheckCircle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-400" size={24} />
          </div>
          <p className="text-zinc-400 mb-2">Processing your order...</p>
          <p className="text-sm text-zinc-500">Setting up tracking & notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center animate-fade-in-up">
            <div className="relative mb-6">
              <Sparkles className="absolute -top-2 -left-2 text-yellow-400 animate-pulse" size={20} />
              <CheckCircle size={80} className="mx-auto text-green-400 animate-bounce" />
              <Sparkles className="absolute -bottom-2 -right-2 text-yellow-400 animate-pulse" size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Order Confirmed! 🎉
            </h1>
            <p className="text-xl text-zinc-300 mb-2">
              Welcome to the Baguri family!
            </p>
            <p className="text-zinc-400">
              Your order is now being processed...
            </p>
          </div>
        </div>
      )}
      
      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle size={32} className="text-green-400" />
              <h1 className="text-2xl md:text-3xl font-bold">Order Successful!</h1>
            </div>
            <p className="text-zinc-400 text-lg">
              Thank you for supporting Romanian designers! 🇷🇴
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              You&apos;ll receive email updates as your order progresses
            </p>
          </div>

          {/* Order Tracker Component */}
          <OrderTracker sessionId={sessionId || undefined} className="mb-8" />

          {/* Action Buttons */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">What&apos;s Next?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link 
                href="/shop"
                className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition group"
              >
                <Package size={24} className="text-blue-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-medium text-white">Continue Shopping</span>
                <span className="text-xs text-zinc-400 mt-1">Discover more designers</span>
              </Link>
              
              <a 
                href="https://instagram.com/baguri.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition group"
              >
                <Sparkles size={24} className="text-pink-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-medium text-white">Follow Us</span>
                <span className="text-xs text-zinc-400 mt-1">@baguri.ro</span>
              </a>
              
              <Link 
                href="/"
                className="flex flex-col items-center p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition group"
              >
                <ArrowLeft size={24} className="text-green-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-medium text-white">Back to Home</span>
                <span className="text-xs text-zinc-400 mt-1">Explore Baguri</span>
              </Link>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Thank You for Choosing Baguri! 💙</h3>
            <p className="text-zinc-300 text-sm">
              Your support helps Romanian designers showcase their talent worldwide. 
              Every purchase makes a difference in supporting local creativity and craftsmanship.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
} 