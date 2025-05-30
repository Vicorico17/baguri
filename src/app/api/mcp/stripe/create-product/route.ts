import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // In a real implementation, this would use the MCP function directly
    // For demonstration purposes, we'll use the same format as the actual Stripe response
    // but generate it locally. In production, you would call the MCP function here.
    
    // Example of what the actual call would look like:
    // const stripeProduct = await mcp_stripe_create_product({ name, description });
    
    const stripeProduct = {
      id: `prod_${Math.random().toString(36).substr(2, 14)}`,
      object: 'product',
      active: true,
      attributes: [],
      created: Math.floor(Date.now() / 1000),
      default_price: null,
      description: description || '',
      images: [],
      livemode: false,
      marketing_features: [],
      metadata: {},
      name,
      package_dimensions: null,
      shippable: null,
      statement_descriptor: null,
      tax_code: null,
      type: 'service',
      unit_label: null,
      updated: Math.floor(Date.now() / 1000),
      url: null
    };

    return NextResponse.json(stripeProduct);
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
} 