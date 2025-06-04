import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  console.log('=== CREATE CHECKOUT SESSION API CALLED ===');
  
  try {
    const body = await request.text();
    console.log('Raw request body:', body);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { items } = parsedBody;
    console.log('Parsed items:', items);

    if (!items || items.length === 0) {
      console.log('No items provided');
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Validate all items have price IDs
    for (const item of items) {
      if (!item.priceId) {
        console.log('Missing price ID for item:', item);
        return NextResponse.json({ error: `No price ID found for product: ${item.productName}` }, { status: 400 });
      }
    }

    console.log('Creating Stripe Checkout Session for', items.length, 'items');

    // Create line items for Stripe Checkout Session
    const lineItems = items.map((item: any) => ({
      price: item.priceId,
      quantity: item.quantity,
    }));

    console.log('Line items for Stripe:', lineItems);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shop`,
      metadata: {
        created_via: 'baguri_cart_checkout',
        created_at: new Date().toISOString(),
        product_count: items.length.toString(),
        product_names: items.map((item: any) => item.productName).join(', ')
      },
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['RO'], // Romania only for now
      },
    });

    console.log('Stripe Checkout Session created:', session.id);
    console.log('Checkout URL:', session.url);
    
    const response = { 
      url: session.url,
      sessionId: session.id
    };
    
    console.log('Returning response:', response);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 