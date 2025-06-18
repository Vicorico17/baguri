import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Log which client we're using for debugging
console.log('🔑 Webhook using Supabase client:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Admin (Service Role)' : 'Anonymous');

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
    
    // Extract referral code from metadata if present
    const referralCode = session.metadata?.referral_code;
    let influencer = null;
    let influencerCommission = 0;
    if (referralCode) {
      console.log('🔗 Referral code detected in checkout session:', referralCode);
      // Look up influencer by tiktok_open_id (referralCode)
      const { data: influencer, error: influencerError } = await supabase
        .from('influencers')
        .select('*')
        .eq('tiktok_open_id', referralCode)
        .single();
      if (influencerError || !influencer) {
        console.error('Error looking up influencer by referral code:', influencerError);
      } else {
        // Calculate commission (10% of total order amount)
        const influencerCommission = (session.amount_total ? session.amount_total / 100 : 0) * 0.10;
        // Get or create influencer wallet
        let { data: wallet, error: walletError } = await supabase
          .from('influencers_wallets')
          .select('*')
          .eq('tiktok_open_id', influencer.tiktok_open_id)
          .single();
        if (walletError && walletError.code === 'PGRST116') {
          // Create wallet if it doesn't exist
          const { data: newWallet, error: createError } = await supabase
            .from('influencers_wallets')
            .insert({
              tiktok_open_id: influencer.tiktok_open_id,
              tiktok_display_name: influencer.display_name,
              balance: 0
            })
            .select()
            .single();
          if (createError) {
            console.error('Error creating influencer wallet:', createError);
          } else {
            wallet = newWallet;
          }
        }
        if (wallet) {
          // Update wallet balance
          const newBalance = parseFloat(wallet.balance) + influencerCommission;
          const { error: updateError } = await supabase
            .from('influencers_wallets')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('tiktok_open_id', influencer.tiktok_open_id);
          if (updateError) {
            console.error('Error updating influencer wallet:', updateError);
          } else {
            // Create transaction record
            const { error: transactionError } = await supabase
              .from('influencers_wallet_transactions')
              .insert({
                tiktok_open_id: influencer.tiktok_open_id,
                tiktok_display_name: influencer.display_name,
                type: 'commission',
                amount: influencerCommission,
                description: `10% commission for order ${session.id}`,
                created_at: new Date().toISOString()
              });
            if (transactionError) {
              console.error('Error creating influencer wallet transaction:', transactionError);
            } else {
              console.log(`✅ Added ${influencerCommission} RON commission to influencer ${influencer.display_name} (wallet: ${wallet.tiktok_open_id})`);
            }
          }
        }
      }
    }

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

      // 🔍 GET INITIAL DESIGNER STATE FOR LOGGING
      const { data: initialDesigner, error: designerError } = await supabase
        .from('designers')
        .select('sales_total, brand_name')
        .eq('id', designerId)
        .single();

      if (designerError) {
        console.error('Error fetching designer:', designerError);
        continue;
      }

      // Get initial wallet state
      const { data: initialWallet } = await supabase
        .from('designer_wallets')
        .select('balance, total_earnings')
        .eq('designer_id', designerId)
        .single();

      console.log(`\n🎯 ===== PROCESSING SALE FOR ${initialDesigner.brand_name} (${designerId}) =====`);
      console.log(`💰 BEFORE: Wallet Balance: ${initialWallet?.balance || 0} RON, Sales Total: ${initialDesigner.sales_total || 0} RON`);
      console.log(`🛒 ORDER: ${totalPrice} RON (${quantity}x ${unitPrice} RON)`);

      // Calculate commission based on current tier
      const currentTier = getCommissionTier(initialDesigner.sales_total || 0);
      const designerEarnings = totalPrice * (currentTier.designerEarningsPct / 100);
      const platformFee = totalPrice * (currentTier.platformFeePct / 100);

      console.log(`📊 TIER: ${currentTier.name} (${currentTier.designerEarningsPct}% commission)`);
      console.log(`💸 EARNINGS: Designer gets ${designerEarnings} RON, Platform gets ${platformFee} RON`);

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

      console.log(`✅ Created order item for ${product.name || 'Unknown Product'}`);

      // Add earnings to designer wallet
      console.log(`💰 Adding ${designerEarnings} RON to wallet...`);
      await addEarningsToWallet(designerId, designerEarnings, order.id, productId);

      // Update designer's sales total
      console.log(`📈 Adding ${totalPrice} RON to sales total...`);
      try {
        const salesUpdateResult = await updateDesignerSalesTotal(designerId, totalPrice);
        
        if (!salesUpdateResult) {
          console.warn(`⚠️ Sales total update failed for ${designerId} but continuing with order processing`);
        }
      } catch (salesError) {
        console.error(`❌ Sales total update error for ${designerId}:`, salesError);
        console.warn(`⚠️ Continuing order processing despite sales total update failure`);
      }

      // 🔍 GET FINAL DESIGNER STATE FOR LOGGING
      const { data: finalDesigner } = await supabase
        .from('designers')
        .select('sales_total')
        .eq('id', designerId)
        .single();

      const { data: finalWallet } = await supabase
        .from('designer_wallets')
        .select('balance, total_earnings')
        .eq('designer_id', designerId)
        .single();

      console.log(`\n🎉 FINAL STATE FOR ${initialDesigner.brand_name}:`);
      console.log(`💰 AFTER: Wallet Balance: ${finalWallet?.balance || 0} RON (+${(finalWallet?.balance || 0) - (initialWallet?.balance || 0)})`);
      console.log(`📈 AFTER: Sales Total: ${finalDesigner?.sales_total || 0} RON (+${(finalDesigner?.sales_total || 0) - (initialDesigner?.sales_total || 0)})`);
      console.log(`🎯 ===== COMPLETED PROCESSING FOR ${initialDesigner.brand_name} =====\n`)
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
    console.log(`📈 [SALES UPDATE] Starting update for designer ${designerId}: +${additionalSales} RON`);
    
    // Use the stored procedure first (same pattern as wallet)
    console.log(`📈 [SALES UPDATE] Attempting stored procedure increment_designer_sales...`);
    const { data: result, error: storedProcError } = await supabase.rpc('increment_designer_sales', {
      p_designer_id: designerId,
      p_amount: additionalSales
    });

    if (storedProcError) {
      console.error(`📈 [SALES UPDATE] Stored procedure failed for ${designerId}:`, storedProcError);
      console.log(`📈 [SALES UPDATE] Attempting manual update as fallback...`);
      
      // Fallback to manual update (same pattern as wallet fallback)
      const { data: currentData, error: fetchError } = await supabase
        .from('designers')
        .select('sales_total')
        .eq('id', designerId)
        .single();

      if (fetchError) {
        console.error(`📈 [SALES UPDATE] Error fetching current sales total for ${designerId}:`, fetchError);
        return false;
      }

      const currentTotal = currentData?.sales_total || 0;
      const newTotal = currentTotal + additionalSales;
      console.log(`📈 [SALES UPDATE] Current: ${currentTotal}, Adding: ${additionalSales}, New: ${newTotal}`);

      const { error: updateError } = await supabase
        .from('designers')
        .update({ 
          sales_total: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', designerId);

      if (updateError) {
        console.error(`📈 [SALES UPDATE] Manual update failed for ${designerId}:`, updateError);
        return false;
      }

      console.log(`📈 [SALES UPDATE] ✅ Manually updated ${designerId} sales total to ${newTotal} RON (fallback method)`);
    } else {
      console.log(`📈 [SALES UPDATE] ✅ Successfully updated ${designerId} sales total via stored procedure`);
    }
    
    // Verify the update worked (same verification as wallet)
    console.log(`📈 [SALES UPDATE] Verifying update for ${designerId}...`);
    const { data: verifyData, error: verifyError } = await supabase
      .from('designers')
      .select('sales_total')
      .eq('id', designerId)
      .single();
    
    if (verifyError) {
      console.error(`📈 [SALES UPDATE] Verification failed for ${designerId}:`, verifyError);
      return false;
    } else {
      console.log(`📈 [SALES UPDATE] Verified sales total for ${designerId}:`, verifyData.sales_total);
      return true;
    }
    
  } catch (error) {
    console.error(`📈 [SALES UPDATE] Critical error for ${designerId}:`, error);
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