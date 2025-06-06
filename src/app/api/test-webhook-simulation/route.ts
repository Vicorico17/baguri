import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Commission tier structure - same as webhook
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
  for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
    if (salesTotal >= COMMISSION_LEVELS[i].threshold) {
      return COMMISSION_LEVELS[i];
    }
  }
  return COMMISSION_LEVELS[0];
}

export async function POST(request: NextRequest) {
  try {
    const { designer_id, amount = 50 } = await request.json();
    
    if (!designer_id) {
      return NextResponse.json({ error: 'designer_id required' }, { status: 400 });
    }

    console.log(`🧪 SIMULATING WEBHOOK: Processing ${amount} RON sale for designer ${designer_id}`);

    // Get designer
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .select('sales_total, brand_name')
      .eq('id', designer_id)
      .single();

    if (designerError) {
      return NextResponse.json({ error: 'Designer not found' }, { status: 404 });
    }

    // Calculate commission
    const currentTier = getCommissionTier(designer.sales_total || 0);
    const designerEarnings = amount * (currentTier.designerEarningsPct / 100);
    const platformFee = amount * (currentTier.platformFeePct / 100);

    console.log(`📊 Commission: ${currentTier.name} - Designer gets ${designerEarnings} RON (${currentTier.designerEarningsPct}%)`);

    // Create fake order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        stripe_checkout_session_id: `cs_test_webhook_sim_${Date.now()}`,
        stripe_payment_intent_id: `pi_test_webhook_sim_${Date.now()}`,
        customer_email: 'webhook-test@baguri.com',
        customer_name: 'Webhook Test Customer',
        total_amount: amount,
        currency: 'ron',
        status: 'completed'
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: 'Failed to create test order' }, { status: 500 });
    }

    // Create order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        designer_id: designer_id,
        product_id: 'webhook-test-product',
        product_name: 'Webhook Test Product',
        product_price: amount,
        quantity: 1,
        unit_price: amount,
        total_price: amount,
        designer_earnings: designerEarnings,
        baguri_earnings: platformFee,
        commission_tier: currentTier.name,
        commission_percentage: currentTier.designerEarningsPct
      });

    if (itemError) {
      console.error('Error creating order item:', itemError);
      return NextResponse.json({ error: 'Failed to create order item' }, { status: 500 });
    }

    // Get or create wallet
    let { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('*')
      .eq('designer_id', designer_id)
      .single();

    if (walletError && walletError.code === 'PGRST116') {
      // Create wallet
      const { data: newWallet, error: createError } = await supabase
        .from('designer_wallets')
        .insert({
          designer_id: designer_id,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
          pending_balance: 0
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
      }
      wallet = newWallet;
    } else if (walletError) {
      return NextResponse.json({ error: 'Wallet error' }, { status: 500 });
    }

    // Update wallet
    const newBalance = parseFloat(wallet.balance) + designerEarnings;
    const newTotalEarnings = parseFloat(wallet.total_earnings) + designerEarnings;

    const { error: updateError } = await supabase
      .from('designer_wallets')
      .update({
        balance: newBalance,
        total_earnings: newTotalEarnings,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
    }

    // Create wallet transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'sale',
        amount: designerEarnings,
        status: 'completed',
        description: `Webhook simulation - ${amount} RON total`,
        order_id: order.id
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
    }

    // Update designer sales total
    const { error: updateSalesError } = await supabase
      .from('designers')
      .update({ 
        sales_total: (designer.sales_total || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', designer_id);

    if (updateSalesError) {
      console.error('Error updating sales total:', updateSalesError);
    }

    console.log(`✅ WEBHOOK SIMULATION COMPLETE: Added ${designerEarnings} RON to wallet`);

    return NextResponse.json({
      success: true,
      message: 'Webhook simulation completed successfully',
      details: {
        designer_id,
        designer_name: designer.brand_name,
        amount_sold: amount,
        commission_tier: currentTier.name,
        commission_percentage: currentTier.designerEarningsPct,
        designer_earnings: designerEarnings,
        platform_fee: platformFee,
        new_wallet_balance: newBalance,
        new_sales_total: (designer.sales_total || 0) + amount,
        order_id: order.id
      }
    });

  } catch (error) {
    console.error('Webhook simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 