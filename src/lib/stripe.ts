import { getStripeDataForProduct } from './stripe-automation';

// Static Stripe product mapping for our existing mock products
export const STRIPE_PRODUCT_MAPPING = {
  1: { // Silk Evening Dress
    priceId: 'price_1RSI8bPlEQlCmBsiIgobO6Hb',
    productId: 'prod_SN2C1FvNiJ2jM9'
  },
  2: { // Oversized Blazer
    priceId: 'price_1RSI8mPlEQlCmBsiAaOoR92C',
    productId: 'prod_SN2DTvr2veSbYC'
  },
  3: { // Handwoven Scarf
    priceId: 'price_1RSI8xPlEQlCmBsiKD8SLVcI',
    productId: 'prod_SN2Dm0EuVjvusT'
  },
  4: { // Minimalist Tote
    priceId: 'price_1RSI98PlEQlCmBsiUkxY4B0z',
    productId: 'prod_SN2DZaCXaXJuHz'
  },
  5: { // Vintage Inspired Gown (same as product 1 for now)
    priceId: 'price_1RSI8bPlEQlCmBsiIgobO6Hb',
    productId: 'prod_SN2C1FvNiJ2jM9'
  }
};

export function getStripeProductId(productId: string | number): string | null {
  // First, check the dynamic mapping from automated product creation
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData) {
    return dynamicData.productId;
  }
  
  // Fallback to static mapping for existing products (only for numeric IDs)
  if (typeof productId === 'number') {
    const mapping = STRIPE_PRODUCT_MAPPING[productId as keyof typeof STRIPE_PRODUCT_MAPPING];
    return mapping?.productId || null;
  }
  
  return null;
}

export function getStripePriceId(productId: string | number): string | null {
  // First, check the dynamic mapping from automated product creation
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData) {
    return dynamicData.priceId;
  }
  
  // Fallback to static mapping for existing products (only for numeric IDs)
  if (typeof productId === 'number') {
    const mapping = STRIPE_PRODUCT_MAPPING[productId as keyof typeof STRIPE_PRODUCT_MAPPING];
    return mapping?.priceId || null;
  }
  
  return null;
}

export function getStripePaymentUrl(productId: string | number): string | null {
  // First, check the dynamic mapping from automated product creation
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData?.paymentLinkUrl) {
    return dynamicData.paymentLinkUrl;
  }
  
  // Fallback to static payment URLs for existing products (only for numeric IDs)
  if (typeof productId === 'number') {
    const paymentUrls: Record<number, string> = {
      1: 'https://buy.stripe.com/test_4gM8wReahgGU6L5cHV8og00', // Silk Evening Dress
      2: 'https://buy.stripe.com/test_8x2aEZ4zH76k7P97nB8og01', // Oversized Blazer  
      3: 'https://buy.stripe.com/test_5kQ6oJ7LT62gc5pfU78og02', // Handwoven Scarf
      4: 'https://buy.stripe.com/test_bJe5kF7LT62gfhB5ft8og03', // Minimalist Tote
      5: 'https://buy.stripe.com/test_4gM8wReahgGU6L5cHV8og00', // Vintage Inspired Gown (same as #1)
    };
    
    return paymentUrls[productId] || null;
  }
  
  return null;
}

// Helper function to check if a product has Stripe integration
export function hasStripeIntegration(productId: string | number): boolean {
  return getStripePriceId(productId) !== null;
}

// Helper function to get all Stripe data for a product
export function getStripeData(productId: string | number): {
  productId: string | null;
  priceId: string | null;
  paymentUrl: string | null;
  source: 'dynamic' | 'static' | 'none';
} {
  // Check dynamic mapping first
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData) {
    return {
      productId: dynamicData.productId,
      priceId: dynamicData.priceId,
      paymentUrl: dynamicData.paymentLinkUrl || null,
      source: 'dynamic'
    };
  }
  
  // Check static mapping (only for numeric IDs)
  if (typeof productId === 'number') {
    const staticMapping = STRIPE_PRODUCT_MAPPING[productId as keyof typeof STRIPE_PRODUCT_MAPPING];
    if (staticMapping) {
      return {
        productId: staticMapping.productId,
        priceId: staticMapping.priceId,
        paymentUrl: getStripePaymentUrl(productId),
        source: 'static'
      };
    }
  }
  
  return {
    productId: null,
    priceId: null,
    paymentUrl: null,
    source: 'none'
  };
} 