// Direct MCP Stripe functions for frontend usage
// This file provides direct access to MCP Stripe functions

declare global {
  interface Window {
    mcp_stripe_mcp_create_product?: (params: { name: string; description?: string }) => Promise<any>;
    mcp_stripe_mcp_create_price?: (params: { product: string; unit_amount: number; currency: string }) => Promise<any>;
    mcp_stripe_mcp_create_payment_link?: (params: { price: string; quantity: number }) => Promise<any>;
  }
}

export async function mcp_stripe_mcp_create_product(params: { name: string; description?: string }) {
  try {
    console.log('🚀 Creating real Stripe product via MCP:', params);
    
    // Use the actual MCP Stripe function that's available in the environment
    // The MCP functions are available as global functions in the MCP environment
    const response = await fetch('/api/mcp-stripe/create-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stripe MCP error: ${errorText}`);
    }

    const product = await response.json();
    console.log('✅ Real Stripe product created:', product);
    return product;
  } catch (error) {
    console.error('❌ Error creating Stripe product:', error);
    throw new Error(`Failed to create Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function mcp_stripe_mcp_create_price(params: { product: string; unit_amount: number; currency: string }) {
  try {
    console.log('🚀 Creating real Stripe price via MCP:', params);
    
    const response = await fetch('/api/mcp-stripe/create-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stripe MCP error: ${errorText}`);
    }

    const price = await response.json();
    console.log('✅ Real Stripe price created:', price);
    return price;
  } catch (error) {
    console.error('❌ Error creating Stripe price:', error);
    throw new Error(`Failed to create Stripe price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function mcp_stripe_mcp_create_payment_link(params: { price: string; quantity: number }) {
  try {
    console.log('🚀 Creating real Stripe payment link via MCP:', params);
    
    const response = await fetch('/api/mcp-stripe/create-payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stripe MCP error: ${errorText}`);
    }

    const paymentLink = await response.json();
    console.log('✅ Real Stripe payment link created:', paymentLink);
    return paymentLink;
  } catch (error) {
    console.error('❌ Error creating Stripe payment link:', error);
    throw new Error(`Failed to create Stripe payment link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 