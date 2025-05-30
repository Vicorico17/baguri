import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, unit_amount, currency } = body;

    if (!product || !unit_amount || !currency) {
      return NextResponse.json({ 
        error: 'Product ID, unit amount, and currency are required' 
      }, { status: 400 });
    }

    // In a real implementation, this would use the MCP function directly
    // For demonstration purposes, we'll use the same format as the actual Stripe response
    // but generate it locally. In production, you would call the MCP function here.
    
    // Example of what the actual call would look like:
    // const stripePrice = await mcp_stripe_create_price({ product, unit_amount, currency });
    
    const stripePrice = {
      id: `price_${Math.random().toString(36).substr(2, 14)}`,
      object: 'price',
      active: true,
      billing_scheme: 'per_unit',
      created: Math.floor(Date.now() / 1000),
      currency,
      custom_unit_amount: null,
      livemode: false,
      lookup_key: null,
      metadata: {},
      nickname: null,
      product,
      recurring: null,
      tax_behavior: 'unspecified',
      tiers_mode: null,
      transform_quantity: null,
      type: 'one_time',
      unit_amount,
      unit_amount_decimal: unit_amount.toString()
    };

    return NextResponse.json(stripePrice);
  } catch (error) {
    console.error('Error creating Stripe price:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create price' },
      { status: 500 }
    );
  }
} 