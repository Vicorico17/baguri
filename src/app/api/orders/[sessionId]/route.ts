import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('Fetching order for session:', sessionId);

    // First, try to get the order from our database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    if (orderError && orderError.code !== 'PGRST116') {
      console.error('Database error:', orderError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no order found in database, try to get session info from Stripe
    if (!order) {
      try {
        console.log('Order not found in database, fetching from Stripe...');
        
        // Get session from Stripe to show basic info even if webhook hasn't processed yet
        if (!stripe) {
          return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items', 'line_items.data.price.product']
        });

        if (!stripeSession) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Return basic session info if order hasn't been processed yet
        const sessionData = {
          id: 'pending',
          stripe_checkout_session_id: stripeSession.id,
          stripe_payment_intent_id: stripeSession.payment_intent as string,
          customer_email: stripeSession.customer_details?.email || 'Unknown',
          customer_name: stripeSession.customer_details?.name || 'Unknown Customer',
          total_amount: stripeSession.amount_total ? stripeSession.amount_total / 100 : 0,
          currency: stripeSession.currency || 'ron',
          status: stripeSession.payment_status === 'paid' ? 'processing' : 'pending',
          created_at: new Date(stripeSession.created * 1000).toISOString(),
          order_items: stripeSession.line_items?.data?.map((item, index) => ({
            id: `temp-${index}`,
            product_name: (item.price?.product as Stripe.Product)?.name || 'Unknown Product',
            quantity: item.quantity || 1,
            unit_price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
            total_price: item.amount_total ? item.amount_total / 100 : 0,
            designer_earnings: 0, // Will be calculated when webhook processes
            commission_tier: 'Pending',
            commission_percentage: 0,
            baguri_fee: 0,
            baguri_fee_percentage: 0
          })) || [],
          is_pending: true // Flag to indicate this is from Stripe, not processed yet
        };

        return NextResponse.json(sessionData);
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        return NextResponse.json({ 
          error: 'Order not found and could not retrieve from payment provider' 
        }, { status: 404 });
      }
    }

    // Return the processed order from database
    const formattedOrder = {
      ...order,
      is_pending: false // This order has been fully processed
    };

    return NextResponse.json(formattedOrder);

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 