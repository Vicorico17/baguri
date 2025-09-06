import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price, quantity, referralCode } = body;

    if (!price || !quantity) {
      return NextResponse.json({ 
        error: 'Price ID and quantity are required' 
      }, { status: 400 });
    }

    console.log('🚀 Creating Stripe payment link:', { price, quantity, referralCode });

    if (!stripe) {
      console.error('Stripe configuration missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create Stripe payment link using official SDK
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price,
          quantity,
        },
      ],
      metadata: {
        created_via: 'baguri_automation',
        created_at: new Date().toISOString(),
        ...(referralCode ? { referral_code: referralCode } : {})
      }
    });

    console.log('✅ Stripe payment link created:', paymentLink.url);
    return NextResponse.json(paymentLink);
    
  } catch (error) {
    console.error('Error creating Stripe payment link:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 