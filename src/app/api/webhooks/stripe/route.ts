import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Create Stripe client with fallback for build time
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

let stripe: Stripe | null = null;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
  });
}

// Commission tier structure - matches commission-levels page
const COMMISSION_LEVELS = [
  { 
    id: 'bronze',
    name: 'Bronze Designer', 
    platformFeePct: 30, 
    designerEarningsPct: 70, 
    threshold: 0 
  },
  { 
    id: 'silver',
    name: 'Silver Designer', 
    platformFeePct: 25, 
    designerEarningsPct: 75, 
    threshold: 100 
  },
  { 
    id: 'gold',
    name: 'Gold Designer', 
    platformFeePct: 20, 
    designerEarningsPct: 80, 
    threshold: 1000 
  },
  { 
    id: 'platinum',
    name: 'Platinum Designer', 
    platformFeePct: 17, 
    designerEarningsPct: 83, 
    threshold: 10000 
  }
];

function getCommissionTier(salesTotal: number) {
  // Find the highest tier the designer qualifies for
  for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
    if (salesTotal >= COMMISSION_LEVELS[i].threshold) {
      return COMMISSION_LEVELS[i];
    }
  }
  return COMMISSION_LEVELS[0]; // Default to Bronze
}

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!stripe || !endpointSecret) {
      console.error('Stripe configuration missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

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
    console.log('🎯 Processing checkout completed:', session.id);
    
    // Check if Stripe is available
    if (!stripe) {
      console.error('Stripe not configured for webhook processing');
      return;
    }

    // Check if this session has already been processed (idempotency)
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('stripe_checkout_session_id', session.id)
      .single();

    if (existingOrderError && existingOrderError.code !== 'PGRST116') {
      console.error('Error checking existing order:', existingOrderError);
      return;
    }

    if (existingOrder) {
      console.log(`⚠️ Session ${session.id} already processed (Order: ${existingOrder.id}), skipping to prevent duplicate processing`);
      return;
    }
    
    // Get line items from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    });

    if (!lineItems.data.length) {
      console.log('No line items found for session:', session.id);
      return;
    }

    // Validate session amount matches our calculations
    const calculatedTotal = lineItems.data.reduce((total, item) => {
      return total + (item.amount_total || 0);
    }, 0);

    if (Math.abs(calculatedTotal - (session.amount_total || 0)) > 1) { // Allow 1 cent difference for rounding
      console.error(`⚠️ Amount mismatch detected! Session: ${session.amount_total}, Calculated: ${calculatedTotal}`);
      return;
    }

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name || 'Unknown Customer',
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

    console.log('✅ Created order:', order.id);

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
      const platformFee = totalPrice * (currentTier.platformFeePct / 100);

      console.log(`Processing sale: Designer ${designerId}, Amount: ${totalPrice} RON`);
      console.log(`Tier: ${currentTier.name}, Designer gets: ${designerEarnings} RON (${currentTier.designerEarningsPct}%)`);

      // Create order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          designer_id: designerId,
          product_id: productId,
          product_name: product.name || 'Unknown Product',
          product_price: unitPrice,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          designer_earnings: designerEarnings,
          baguri_fee: platformFee,
          commission_tier: currentTier.name,
          commission_percentage: currentTier.designerEarningsPct
        });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        continue;
      }

      // Add earnings to designer wallet
      await addEarningsToWallet(designerId, designerEarnings, order.id, productId);

      // Update designer's sales total using atomic increment
      await updateDesignerSalesTotal(designerId, totalPrice);
    }

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function addEarningsToWallet(designerId: string, earnings: number, orderId: string, productId: string) {
  try {
    console.log(`💰 Processing earnings for designer ${designerId}: ${earnings} RON from order ${orderId}`);
    
    // Check if this order has already been processed for this designer
    const { data: existingTransaction, error: checkError } = await supabase
      .from('wallet_transactions')
      .select('id')
      .eq('order_id', orderId)
      .eq('type', 'sale')
      .eq('status', 'completed')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing transaction:', checkError);
      return;
    }

    if (existingTransaction) {
      console.log(`⚠️ Order ${orderId} already processed for designer ${designerId}, skipping to prevent duplicate earnings`);
      return;
    }

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('*')
      .eq('designer_id', designerId)
      .single();

    if (walletError) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('designer_wallets')
        .insert({
          designer_id: designerId,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
          pending_balance: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return;
      }
      wallet = newWallet;
      console.log(`✅ Created new wallet for designer ${designerId}`);
    }

    // Use database transaction for atomic operations
    const { data: result, error: transactionError } = await supabase.rpc('add_designer_earnings', {
      p_designer_id: designerId,
      p_amount: earnings,
      p_order_id: orderId,
      p_description: `Sale commission from order ${orderId} - Product: ${productId}`
    });

    if (transactionError) {
      console.error('Error adding earnings via stored procedure:', transactionError);
      
      // Fallback to manual transaction if stored procedure fails
      console.log('Attempting manual wallet update as fallback...');
      
      // Update wallet balance and total earnings
      const newBalance = parseFloat(wallet.balance) + earnings;
      const newTotalEarnings = parseFloat(wallet.total_earnings) + earnings;

      const { error: updateError } = await supabase
        .from('designer_wallets')
        .update({
          balance: newBalance,
          total_earnings: newTotalEarnings,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Error updating wallet balance:', updateError);
        return;
      }

      // Create wallet transaction record
      const { error: manualTransactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'sale',
          amount: earnings,
          status: 'completed',
          description: `Sale commission from order ${orderId} - Product: ${productId}`,
          order_id: orderId,
          metadata: {
            order_id: orderId,
            product_id: productId,
            processed_via: 'manual_fallback',
            processed_at: new Date().toISOString()
          }
        });

      if (manualTransactionError) {
        console.error('Error creating wallet transaction (manual):', manualTransactionError);
        return;
      }

      console.log(`✅ Manually added ${earnings} RON to designer ${designerId} wallet (fallback method)`);
    } else {
      console.log(`✅ Successfully added ${earnings} RON to designer ${designerId} wallet via stored procedure`);
    }

    // Verify the transaction was recorded
    const { data: verification, error: verifyError } = await supabase
      .from('wallet_transactions')
      .select('id, amount, status')
      .eq('order_id', orderId)
      .eq('type', 'sale')
      .eq('status', 'completed')
      .single();

    if (verifyError || !verification) {
      console.error('⚠️ Failed to verify transaction was recorded properly:', verifyError);
    } else {
      console.log(`✅ Transaction verified: ${verification.id} for ${verification.amount} RON`);
    }

  } catch (error) {
    console.error('❌ Critical error adding earnings to wallet:', error);
    
    // Log critical errors for manual review
    try {
      await supabase.from('error_logs').insert({
        error_type: 'wallet_funding_error',
        designer_id: designerId,
        order_id: orderId,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          earnings_amount: earnings,
          product_id: productId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

async function updateDesignerSalesTotal(designerId: string, additionalSales: number) {
  try {
    console.log(`📈 Updating sales total for designer ${designerId}: +${additionalSales} RON`);
    
    // Skip stored procedure for now due to bugs - use direct fallback method
    
    // Fallback: Use multiple retries to handle concurrent updates
    let retries = 3;
    while (retries > 0) {
      try {
        // Get current sales total
        const { data: currentData, error: fetchError } = await supabase
          .from('designers')
          .select('sales_total')
          .eq('id', designerId)
          .single();

        if (fetchError) {
          console.error('Error fetching current sales total:', fetchError);
          retries--;
          continue;
        }

        const currentTotal = currentData?.sales_total || 0;
        const newTotal = currentTotal + additionalSales;

        // Update with the calculated new total
        const { data: updateData, error: updateError } = await supabase
          .from('designers')
          .update({ 
            sales_total: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', designerId)
          .eq('sales_total', currentTotal) // Optimistic locking - only update if sales_total hasn't changed
          .select('sales_total')
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
            // No rows updated - someone else updated it, retry
            console.log(`⚠️ Concurrent update detected for designer ${designerId}, retrying...`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
            continue;
          } else {
            console.error('Error updating designer sales total:', updateError);
            return false;
          }
        }

        console.log(`✅ Updated designer ${designerId} sales total from ${currentTotal} to ${newTotal} RON`);
        return true;

      } catch (retryError) {
        console.error('Error in retry attempt:', retryError);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    console.error(`❌ Failed to update sales total for designer ${designerId} after all retries`);
    return false;
    
  } catch (error) {
    console.error('Critical error updating designer sales total:', error);
    return false;
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
      console.error('Error updating order status for failed payment:', error);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
} 