// Wrapper functions for Stripe MCP integration

export interface StripeProductParams {
  name: string;
  description?: string;
}

export interface StripePriceParams {
  product: string;
  unit_amount: number;
  currency: string;
}

export interface StripeProduct {
  id: string;
  object: string;
  active: boolean;
  name: string;
  description: string;
  created: number;
  [key: string]: any;
}

export interface StripePrice {
  id: string;
  object: string;
  active: boolean;
  currency: string;
  product: string;
  unit_amount: number;
  created: number;
  [key: string]: any;
}

export interface StripePaymentLinkParams {
  price: string;
  quantity: number;
}

export interface StripePaymentLink {
  id: string;
  object: string;
  active: boolean;
  url: string;
  price: string;
  quantity: number;
  created: number;
  [key: string]: any;
}

export async function mcp_stripe_create_product(params: StripeProductParams): Promise<StripeProduct> {
  try {
    const response = await fetch('/api/mcp/stripe/create-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in mcp_stripe_create_product:', error);
    throw error;
  }
}

export async function mcp_stripe_create_price(params: StripePriceParams): Promise<StripePrice> {
  try {
    const response = await fetch('/api/mcp/stripe/create-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe price');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in mcp_stripe_create_price:', error);
    throw error;
  }
}

export async function mcp_stripe_create_payment_link(params: StripePaymentLinkParams): Promise<StripePaymentLink> {
  try {
    // For now, we'll create a simple demo payment link since we don't have Stripe MCP configured
    // In production, this would use the actual Stripe MCP tool
    console.log('Creating payment link with params:', params);
    
    // Return a demo payment link that redirects to a simple success page
    const paymentLink: StripePaymentLink = {
      id: `plink_demo_${Date.now()}`,
      object: 'payment_link',
      active: true,
      url: `/checkout/demo?price=${params.price}&quantity=${params.quantity}`,
      price: params.price,
      quantity: params.quantity,
      created: Math.floor(Date.now() / 1000)
    };

    console.log('Created demo payment link:', paymentLink);
    return paymentLink;
    
  } catch (error) {
    console.error('Error in mcp_stripe_create_payment_link:', error);
    throw error;
  }
} 