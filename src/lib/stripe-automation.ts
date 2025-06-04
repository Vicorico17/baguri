// Types for product creation
export interface ProductData {
  id: string;
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
let dynamicStripeMapping: Record<string, StripeProductResult> = {};

export function addToStripeMapping(productId: string, stripeData: StripeProductResult) {
  dynamicStripeMapping[productId] = stripeData;
}

// Function to get Stripe data from database
export async function getStripeDataFromDatabase(productId: string): Promise<StripeProductResult | null> {
  try {
    // Import supabase here to avoid circular dependencies
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase
      .from('designer_products')
      .select('stripe_product_id, stripe_price_id, stripe_payment_link')
      .eq('id', productId)
      .single();

    if (error || !data) {
      return null;
    }

    if (data.stripe_product_id && data.stripe_price_id) {
      return {
        productId: data.stripe_product_id,
        priceId: data.stripe_price_id,
        paymentLinkUrl: data.stripe_payment_link || undefined
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching Stripe data from database:', error);
    return null;
  }
}

export function getStripeDataForProduct(productId: string | number): StripeProductResult | null {
  const key = String(productId);
  return dynamicStripeMapping[key] || null;
}

// Enhanced function that checks both memory and database
export async function getStripeDataForProductEnhanced(productId: string | number): Promise<StripeProductResult | null> {
  const key = String(productId);
  
  // First check in-memory mapping
  const memoryData = dynamicStripeMapping[key];
  if (memoryData) {
    return memoryData;
  }
  
  // Then check database
  const dbData = await getStripeDataFromDatabase(key);
  if (dbData) {
    // Cache it in memory for future use
    dynamicStripeMapping[key] = dbData;
    return dbData;
  }
  
  return null;
}

export function getAllStripeMappings(): Record<string, StripeProductResult> {
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
export async function approveProduct(productId: string): Promise<boolean> {
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
export function getPaymentUrlForProduct(productId: string): string | null {
  const stripeData = getStripeDataForProduct(productId);
  return stripeData?.paymentLinkUrl || null;
} 