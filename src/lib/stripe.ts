import { getStripeDataForProduct } from './stripe-automation';

export function getStripeProductId(productId: string | number): string | null {
  // First, check the dynamic mapping from automated product creation
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData) {
    return dynamicData.productId;
  }

  return null;
}

export function getStripePriceId(productId: string | number): string | null {
  // First, check the dynamic mapping from automated product creation
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData) {
    return dynamicData.priceId;
  }

  return null;
}

export function getStripePaymentUrl(productId: string | number): string | null {
  // First, check the dynamic mapping from automated product creation
  const dynamicData = getStripeDataForProduct(productId);
  if (dynamicData?.paymentLinkUrl) {
    return dynamicData.paymentLinkUrl;
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

  return {
    productId: null,
    priceId: null,
    paymentUrl: null,
    source: 'none'
  };
}
