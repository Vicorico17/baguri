import { NextRequest, NextResponse } from 'next/server';

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

    // For now, we'll create a payment link for the first item
    // In production, you'd create a checkout session with all items
    const firstItem = items[0];
    console.log('First item:', firstItem);
    
    if (!firstItem.priceId) {
      console.log('No price ID found for first item');
      return NextResponse.json({ error: 'No price ID found for product' }, { status: 400 });
    }

    console.log('Creating payment link for item:', firstItem);

    // Call the internal MCP Stripe API to create a real payment link
    const mcpResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mcp/stripe/create-payment-link-internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price: firstItem.priceId,
        quantity: firstItem.quantity
      }),
    });

    console.log('MCP API response status:', mcpResponse.status);

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error('MCP API error:', errorText);
      throw new Error(`Failed to create payment link: ${errorText}`);
    }

    const mcpResult = await mcpResponse.json();
    console.log('MCP payment link result:', mcpResult);
    
    if (!mcpResult.url) {
      throw new Error('No payment URL received from Stripe');
    }
    
    const response = { 
      url: mcpResult.url,
      sessionId: mcpResult.id || `plink_${Date.now()}`
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