// Types for product creation
export interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  designerName: string;
  designerId: string;
  sizes: string[];
  colors: string[];
  images?: string[];
}

export interface StripeProductResult {
  productId: string;
  priceId: string;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
}

// In-memory store for dynamic product mappings (in production, this would be in a database)
let dynamicStripeMapping: Record<number, StripeProductResult> = {};

export function addToStripeMapping(productId: number, stripeData: StripeProductResult) {
  dynamicStripeMapping[productId] = stripeData;
}

export function getStripeDataForProduct(productId: number): StripeProductResult | null {
  return dynamicStripeMapping[productId] || null;
}

export function getAllStripeMappings(): Record<number, StripeProductResult> {
  return { ...dynamicStripeMapping };
}

// Function to create Stripe product and price (would be called from server action)
export async function createStripeProductAndPrice(productData: ProductData): Promise<StripeProductResult> {
  try {
    // In production, this would use Stripe SDK or MCP
    // For demo, we'll simulate the process
    
    const mockProductId = `prod_${Math.random().toString(36).substr(2, 14)}`;
    const mockPriceId = `price_${Math.random().toString(36).substr(2, 14)}`;
    const mockPaymentLinkId = `plink_${Math.random().toString(36).substr(2, 14)}`;
    const mockPaymentLinkUrl = `https://buy.stripe.com/test_${Math.random().toString(36).substr(2, 9)}`;

    const stripeResult: StripeProductResult = {
      productId: mockProductId,
      priceId: mockPriceId,
      paymentLinkId: mockPaymentLinkId,
      paymentLinkUrl: mockPaymentLinkUrl
    };

    // Add to our mapping
    addToStripeMapping(productData.id, stripeResult);

    console.log(`✅ Stripe integration created for ${productData.name}:`, stripeResult);
    
    return stripeResult;

  } catch (error) {
    console.error('Failed to create Stripe product:', error);
    throw new Error(`Stripe integration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to approve a product and make it available for purchase
export async function approveProduct(productId: number): Promise<boolean> {
  try {
    const stripeData = getStripeDataForProduct(productId);
    
    if (!stripeData) {
      throw new Error('No Stripe integration found for this product');
    }

    // In production, you would:
    // 1. Update product status in database
    // 2. Potentially update Stripe product metadata
    // 3. Send notifications to designer
    
    console.log(`✅ Product ${productId} approved and ready for sale`);
    console.log(`💳 Payment URL: ${stripeData.paymentLinkUrl}`);
    
    return true;
    
  } catch (error) {
    console.error('Failed to approve product:', error);
    return false;
  }
}

// Function to get payment URL for a product
export function getPaymentUrlForProduct(productId: number): string | null {
  const stripeData = getStripeDataForProduct(productId);
  return stripeData?.paymentLinkUrl || null;
} 