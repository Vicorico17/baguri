import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

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
    
    const { items, referralCode } = parsedBody;
    console.log('Parsed items:', items);
    console.log('Received referralCode from frontend:', referralCode);

    if (!items || items.length === 0) {
      console.log('No items provided');
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    // Validate all items have price IDs and check product status
    for (const item of items) {
      if (!item.priceId) {
        console.log('Missing price ID for item:', item);
        return NextResponse.json({ error: `No price ID found for product: ${item.productName}` }, { status: 400 });
      }

      // Server-side validation: Check product status and designer approval
      const { data: product, error: productError } = await supabase
        .from('designer_products')
        .select(`
          *,
          designers!inner (
            status,
            brand_name
          )
        `)
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        console.log('Product not found:', item.productId);
        return NextResponse.json({ error: `Product "${item.productName}" not found` }, { status: 400 });
      }

      // Check if designer is approved
      if (product.designers.status !== 'approved') {
        console.log('Designer not approved for product:', item.productId);
        return NextResponse.json({ 
          error: `Cannot purchase "${item.productName}" - designer pending approval` 
        }, { status: 400 });
      }

      // Check if product is active and live
      if (!product.is_active) {
        console.log('Product not active:', item.productId);
        return NextResponse.json({ 
          error: `"${item.productName}" is currently not available` 
        }, { status: 400 });
      }

      if (!product.is_live) {
        console.log('Product not live:', item.productId);
        return NextResponse.json({ 
          error: `"${item.productName}" is not currently available for purchase` 
        }, { status: 400 });
      }

      // Check stock status
      if (product.stock_status === 'coming_soon') {
        console.log('Product coming soon:', item.productId);
        return NextResponse.json({ 
          error: `"${item.productName}" is coming soon - not yet available` 
        }, { status: 400 });
      }

      console.log(`✅ Product validated: ${item.productName} (ID: ${item.productId})`);
    }

    console.log('Creating Stripe Checkout Session for', items.length, 'items');

    // Create line items for Stripe Checkout Session
    // Product images will automatically display in Stripe checkout because
    // we now add images to Stripe products when they're created live
    if (!stripe) {
      console.error('Stripe configuration missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const lineItems = items.map((item: any) => ({
      price: item.priceId,
      quantity: item.quantity,
    }));

    console.log('Line items for Stripe:', lineItems);

    const sessionMetadata = {
      created_via: 'baguri_cart_checkout',
      created_at: new Date().toISOString(),
      product_count: items.length.toString(),
      product_names: items.map((item: any) => item.productName).join(', '),
      ...(referralCode ? { referral_code: referralCode } : {})
    };
    console.log('Session metadata to be sent to Stripe:', sessionMetadata);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shop`,
      metadata: sessionMetadata,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['RO'], // Romania only for now
      },
    });

    console.log('Stripe Checkout Session created:', session.id);
    console.log('Final session metadata in Stripe:', session.metadata);
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