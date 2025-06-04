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
      const errorText = await response.text();
      throw new Error(`Failed to create Stripe product: ${errorText}`);
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
      const errorText = await response.text();
      throw new Error(`Failed to create Stripe price: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in mcp_stripe_create_price:', error);
    throw error;
  }
}

export async function mcp_stripe_create_payment_link(params: StripePaymentLinkParams): Promise<StripePaymentLink> {
  try {
    const response = await fetch('/api/mcp/stripe/create-payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Stripe payment link: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in mcp_stripe_create_payment_link:', error);
    throw error;
  }
} 