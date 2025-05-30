import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { price, quantity } = await request.json();

    if (!price || !quantity) {
      return NextResponse.json({ error: 'Price and quantity are required' }, { status: 400 });
    }

    // Import the MCP Stripe function
    const { mcp_stripe_create_payment_link } = await import('@/lib/mcp_stripe');

    // Create payment link using Stripe MCP
    const paymentLink = await mcp_stripe_create_payment_link({
      price: price,
      quantity: quantity
    });

    console.log('Created payment link via MCP:', paymentLink);

    return NextResponse.json(paymentLink);

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 