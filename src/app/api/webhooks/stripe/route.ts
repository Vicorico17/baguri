import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Commission tier structure
const COMMISSION_TIERS = [
  { name: 'Bronze', baguriFeePct: 50, designerEarningsPct: 50, minSales: 0, maxSales: 999.99 },
  { name: 'Silver', baguriFeePct: 40, designerEarningsPct: 60, minSales: 1000, maxSales: 9999.99 },
  { name: 'Gold', baguriFeePct: 30, designerEarningsPct: 70, minSales: 10000, maxSales: undefined }
];

function getCommissionTier(salesTotal: number) {
  for (const tier of COMMISSION_TIERS) {
    if (salesTotal >= tier.minSales && (tier.maxSales === undefined || salesTotal <= tier.maxSales)) {
      return tier;
    }
  }
  return COMMISSION_TIERS[0]; // Default to Bronze
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log('Processing Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing checkout completed:', session.id);
    
    // Get line items from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    });

    if (!lineItems.data.length) {
      console.log('No line items found for session:', session.id);
      return;
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: session.customer_details?.email,
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'ron',
        status: 'completed'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return;
    }

    console.log('Created order:', order.id);

    // Process each line item
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product;
      if (!product?.metadata?.designer_id || !product?.metadata?.product_id) {
        console.log('Skipping item without designer/product metadata:', item.id);
        continue;
      }

      const designerId = product.metadata.designer_id;
      const productId = product.metadata.product_id;
      const quantity = item.quantity || 1;
      const unitPrice = item.price?.unit_amount ? item.price.unit_amount / 100 : 0;
      const totalPrice = unitPrice * quantity;

      // Get designer's current sales total to determine tier
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('sales_total')
        .eq('id', designerId)
        .single();

      if (designerError) {
        console.error('Error fetching designer:', designerError);
        continue;
      }

      // Calculate commission based on current tier
      const currentTier = getCommissionTier(designer.sales_total || 0);
      const designerEarnings = totalPrice * (currentTier.designerEarningsPct / 100);
      const baguriEarnings = totalPrice * (currentTier.baguriFeePct / 100);

      // Create order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          designer_id: designerId,
          product_id: productId,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          designer_earnings: designerEarnings,
          baguri_earnings: baguriEarnings,
          commission_tier: currentTier.name,
          commission_percentage: currentTier.designerEarningsPct
        });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        continue;
      }

      // Update designer's sales total and wallet balance
      const { error: updateError } = await supabase.rpc('process_order_earnings', {
        p_designer_id: designerId,
        p_order_id: order.id,
        p_earnings_amount: designerEarnings,
        p_sales_amount: totalPrice
      });

      if (updateError) {
        console.error('Error processing earnings:', updateError);
      } else {
        console.log(`Processed earnings for designer ${designerId}: ${designerEarnings} RON`);
      }
    }

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Update order status if it exists
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'completed',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating order status:', error);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    
    // Update order status if it exists
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'failed',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating order status:', error);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
} 