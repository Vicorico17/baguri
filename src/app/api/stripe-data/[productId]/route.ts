import { NextRequest, NextResponse } from 'next/server';
import { getStripeDataForProductEnhanced } from '@/lib/stripe-automation';
import { STRIPE_PRODUCT_MAPPING } from '@/lib/stripe';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    // Check enhanced mapping (memory + database)
    const dynamicData = await getStripeDataForProductEnhanced(productId);
    if (dynamicData) {
      return NextResponse.json({
        productId: dynamicData.productId,
        priceId: dynamicData.priceId,
        paymentUrl: dynamicData.paymentLinkUrl || null,
        source: 'dynamic'
      });
    }

    // Check static mapping (only for numeric IDs)
    const numericId = parseInt(productId);
    if (!isNaN(numericId)) {
      const staticMapping = STRIPE_PRODUCT_MAPPING[numericId as keyof typeof STRIPE_PRODUCT_MAPPING];
      if (staticMapping) {
        const paymentUrls: Record<number, string> = {
          1: 'https://buy.stripe.com/test_4gM8wReahgGU6L5cHV8og00',
          2: 'https://buy.stripe.com/test_8x2aEZ4zH76k7P97nB8og01',
          3: 'https://buy.stripe.com/test_5kQ6oJ7LT62gc5pfU78og02',
          4: 'https://buy.stripe.com/test_bJe5kF7LT62gfhB5ft8og03',
          5: 'https://buy.stripe.com/test_4gM8wReahgGU6L5cHV8og00',
        };

        return NextResponse.json({
          productId: staticMapping.productId,
          priceId: staticMapping.priceId,
          paymentUrl: paymentUrls[numericId] || null,
          source: 'static'
        });
      }
    }

    // No Stripe integration found
    return NextResponse.json({
      productId: null,
      priceId: null,
      paymentUrl: null,
      source: 'none'
    });

  } catch (error) {
    console.error('Error fetching Stripe data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe data' },
      { status: 500 }
    );
  }
} 