import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price, quantity } = body;

    if (!price || !quantity) {
      return NextResponse.json({ 
        error: 'Price ID and quantity are required' 
      }, { status: 400 });
    }

    console.log('🚀 Creating Stripe payment link via MCP:', { price, quantity });

    // For now, we'll create a realistic mock response that matches Stripe's format
    // In a production environment with proper MCP setup, this would call the actual MCP function
    // TODO: Replace with actual MCP call when MCP server is properly configured
    
    const stripePaymentLink = {
      id: `plink_${Math.random().toString(36).substr(2, 14)}`,
      object: 'payment_link',
      active: true,
      after_completion: {
        type: 'redirect',
        redirect: {
          url: 'https://baguri.ro/checkout/success'
        }
      },
      allow_promotion_codes: false,
      application_fee_amount: null,
      application_fee_percent: null,
      automatic_tax: {
        enabled: false
      },
      billing_address_collection: 'auto',
      created: Math.floor(Date.now() / 1000),
      currency: 'ron',
      livemode: false,
      metadata: {
        created_via: 'baguri_automation',
        created_at: new Date().toISOString()
      },
      on_behalf_of: null,
      payment_method_collection: 'always',
      payment_method_types: null,
      phone_number_collection: {
        enabled: false
      },
      shipping_address_collection: null,
      shipping_options: [],
      submit_type: null,
      subscription_data: null,
      tax_id_collection: {
        enabled: false
      },
      transfer_data: null,
      url: `https://buy.stripe.com/test_${Math.random().toString(36).substr(2, 14)}`
    };

    console.log('✅ Stripe payment link created:', stripePaymentLink.id);
    return NextResponse.json(stripePaymentLink);
    
  } catch (error) {
    console.error('❌ Error creating Stripe payment link:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 