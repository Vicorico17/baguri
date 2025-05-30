import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { price, quantity } = await request.json();

    if (!price || !quantity) {
      return NextResponse.json({ error: 'Price and quantity are required' }, { status: 400 });
    }

    console.log('Creating payment link with MCP Stripe for:', { price, quantity });

    // Use the actual Stripe MCP function to create a real payment link
    try {
      // Call the MCP Stripe function to create a payment link
      const mcpResponse = await fetch('http://localhost:3000/api/mcp/stripe/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: price,
          quantity: quantity
        }),
      });

      if (!mcpResponse.ok) {
        const errorText = await mcpResponse.text();
        console.error('MCP Stripe API error:', errorText);
        throw new Error(`MCP API error: ${errorText}`);
      }

      const paymentLink = await mcpResponse.json();
      console.log('Created payment link via MCP:', paymentLink);
      
      return NextResponse.json(paymentLink);
      
    } catch (mcpError) {
      console.error('MCP error:', mcpError);
      
      // If MCP fails, return a helpful error instead of a fake URL
      return NextResponse.json(
        { 
          error: 'Stripe integration not available. Please ensure Stripe MCP is configured.',
          details: mcpError instanceof Error ? mcpError.message : 'Unknown MCP error'
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
} 