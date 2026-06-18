import { NextRequest, NextResponse } from 'next/server';
import { getStripeDataForProductEnhanced } from '@/lib/stripe-automation';

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
