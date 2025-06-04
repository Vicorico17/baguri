import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, unit_amount, currency } = body;

    if (!product || !unit_amount || !currency) {
      return NextResponse.json({ 
        error: 'Product ID, unit_amount, and currency are required' 
      }, { status: 400 });
    }

    console.log('🚀 Creating Stripe price:', { product, unit_amount, currency });

    // Create Stripe price using official SDK
    const stripePrice = await stripe.prices.create({
      product,
      unit_amount,
      currency,
      metadata: {
        created_via: 'baguri_automation',
        created_at: new Date().toISOString()
      }
    });

    console.log('✅ Stripe price created:', stripePrice.id);
    return NextResponse.json(stripePrice);
    
  } catch (error) {
    console.error('Error creating Stripe price:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create price' },
      { status: 500 }
    );
  }
} 