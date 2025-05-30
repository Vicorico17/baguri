"use client";

import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

// Force dynamic rendering for this page since it uses useSearchParams
export const dynamic = 'force-dynamic';

function DemoCheckoutContent() {
  const searchParams = useSearchParams();
  const price = searchParams?.get('price');
  const quantity = searchParams?.get('quantity');

  return (
    <div className="max-w-md w-full bg-zinc-800 rounded-lg p-8 text-center">
      <div className="mb-6">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Demo Checkout</h1>
        <p className="text-zinc-400">
          This is a demonstration of the checkout flow
        </p>
      </div>

      <div className="bg-zinc-700 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Order Details</h2>
        <div className="text-sm text-zinc-300 space-y-1">
          <div className="flex justify-between">
            <span>Price ID:</span>
            <span className="font-mono text-xs">{price || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{quantity || '1'}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <p className="text-blue-400 text-sm">
          <strong>Demo Mode:</strong> In a production environment, this would redirect to a real Stripe checkout page where customers can complete their purchase.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-zinc-400 text-sm">
          ✅ Product successfully added to Stripe<br />
          ✅ Payment link generated<br />
          ✅ Checkout flow working
        </p>
        
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    </div>
  );
}

export default function DemoCheckoutPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-zinc-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="text-zinc-400 mt-4">Loading...</p>
        </div>
      }>
        <DemoCheckoutContent />
      </Suspense>
    </div>
  );
} 