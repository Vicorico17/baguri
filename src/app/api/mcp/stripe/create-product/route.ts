import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    console.log('🚀 Creating Stripe product:', { name, description });

    // Create Stripe product using official SDK
    const stripeProduct = await stripe.products.create({
      name,
      description: description || '',
      metadata: {
        created_via: 'baguri_automation',
        created_at: new Date().toISOString()
      }
    });

    console.log('✅ Stripe product created:', stripeProduct.id);
    return NextResponse.json(stripeProduct);
    
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
} 