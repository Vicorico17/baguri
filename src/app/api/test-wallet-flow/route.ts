import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing wallet flow - Getting current state');

    // Get all approved designers
    const { data: designers, error: designersError } = await supabase
      .from('designers')
      .select('id, brand_name, email, status, sales_total')
      .eq('status', 'approved');

    if (designersError) {
      throw new Error('Failed to fetch designers: ' + designersError.message);
    }

    // Get wallets for these designers separately
    const designerIds = designers.map(d => d.id);
    const { data: wallets, error: walletsError } = await supabase
      .from('designer_wallets')
      .select('id, designer_id, balance, total_earnings, total_withdrawn, pending_balance')
      .in('designer_id', designerIds);

    if (walletsError) {
      throw new Error('Failed to fetch wallets: ' + walletsError.message);
    }

    // Combine designers with their wallets
    const designersWithWallets = designers.map(designer => ({
      ...designer,
      designer_wallets: wallets.filter(w => w.designer_id === designer.id)
    }));

    // Get all live products
    const { data: products, error: productsError } = await supabase
      .from('designer_products')
      .select(`
        id,
        name,
        price,
        is_live,
        stripe_product_id,
        stripe_price_id,
        designer_id,
        designers!inner (
          brand_name,
          status
        )
      `)
      .eq('is_live', true)
      .eq('designers.status', 'approved');

    if (productsError) {
      throw new Error('Failed to fetch products: ' + productsError.message);
    }

    // Get recent orders for verification
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        stripe_checkout_session_id,
        customer_email,
        total_amount,
        currency,
        status,
        created_at,
        order_items (
          id,
          designer_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          designer_earnings,
          baguri_fee,
          commission_tier,
          commission_percentage
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      throw new Error('Failed to fetch orders: ' + ordersError.message);
    }

    // Get recent wallet transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select(`
        id,
        type,
        amount,
        status,
        description,
        created_at,
        designer_wallets!inner (
          designer_id,
          designers!inner (
            brand_name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transactionsError) {
      throw new Error('Failed to fetch transactions: ' + transactionsError.message);
    }

    // Commission tier calculations
    const COMMISSION_LEVELS = [
      { name: 'Bronze Designer', platformFeePct: 30, designerEarningsPct: 70, threshold: 0 },
      { name: 'Silver Designer', platformFeePct: 25, designerEarningsPct: 75, threshold: 100 },
      { name: 'Gold Designer', platformFeePct: 20, designerEarningsPct: 80, threshold: 1000 },
      { name: 'Platinum Designer', platformFeePct: 17, designerEarningsPct: 83, threshold: 10000 }
    ];

    const getCommissionTier = (salesTotal: number) => {
      for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
        if (salesTotal >= COMMISSION_LEVELS[i].threshold) {
          return COMMISSION_LEVELS[i];
        }
      }
      return COMMISSION_LEVELS[0];
    };

    // Calculate expected earnings for each designer
    const designersWithTiers = designersWithWallets.map(designer => {
      const salesTotal = parseFloat(designer.sales_total) || 0;
      const currentTier = getCommissionTier(salesTotal);
      const wallet = designer.designer_wallets?.[0] || null;
      
      return {
        id: designer.id,
        brandName: designer.brand_name,
        email: designer.email,
        salesTotal,
        currentTier,
        wallet: wallet ? {
          balance: parseFloat(wallet.balance) || 0,
          totalEarnings: parseFloat(wallet.total_earnings) || 0,
          totalWithdrawn: parseFloat(wallet.total_withdrawn) || 0,
          pendingBalance: parseFloat(wallet.pending_balance) || 0
        } : null
      };
    });

    const response = {
      success: true,
      testData: {
        approvedDesigners: designersWithTiers,
        liveProducts: products.map(p => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          designerName: (p.designers as any)?.brand_name,
          stripeProductId: p.stripe_product_id,
          stripePriceId: p.stripe_price_id,
          hasStripeIntegration: !!(p.stripe_product_id && p.stripe_price_id)
        })),
        recentOrders: recentOrders?.map(o => ({
          id: o.id,
          sessionId: o.stripe_checkout_session_id,
          customerEmail: o.customer_email,
          totalAmount: o.total_amount,
          currency: o.currency,
          status: o.status,
          createdAt: o.created_at,
          items: o.order_items?.map(item => ({
            designerId: item.designer_id,
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
            designerEarnings: item.designer_earnings,
            platformFee: item.baguri_fee,
            commissionTier: item.commission_tier,
            commissionPercentage: item.commission_percentage
          })) || []
        })) || [],
        recentTransactions: recentTransactions?.map(t => ({
          id: t.id,
          type: t.type,
          amount: parseFloat(t.amount),
          status: t.status,
          description: t.description,
          createdAt: t.created_at,
          designerName: (t.designer_wallets as any)?.designers?.brand_name
        })) || [],
        commissionLevels: COMMISSION_LEVELS,
        testInstructions: {
          step1: "Find a live product with Stripe integration from the liveProducts array",
          step2: "Note the designer's current wallet balance",
          step3: "Make a test purchase using Stripe test cards",
          step4: "Check webhook logs for processing confirmation", 
          step5: "Verify the designer's wallet balance increased by the correct commission amount",
          testCard: "4242424242424242 (Visa)",
          testExpiry: "12/34",
          testCVC: "123"
        }
      }
    };

    console.log('✅ Test data prepared successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error testing wallet flow:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get wallet flow test data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, designerId, amount } = await request.json();

    if (action === 'simulate_sale') {
      // Simulate a sale for testing purposes
      if (!designerId || !amount) {
        return NextResponse.json({ error: 'Designer ID and amount required' }, { status: 400 });
      }

      console.log(`🧪 Simulating sale: Designer ${designerId}, Amount: ${amount} RON`);

      // Get designer's current sales total
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('sales_total, brand_name')
        .eq('id', designerId)
        .single();

      if (designerError || !designer) {
        return NextResponse.json({ error: 'Designer not found' }, { status: 404 });
      }

      // Calculate commission
      const COMMISSION_LEVELS = [
        { name: 'Bronze Designer', platformFeePct: 30, designerEarningsPct: 70, threshold: 0 },
        { name: 'Silver Designer', platformFeePct: 25, designerEarningsPct: 75, threshold: 100 },
        { name: 'Gold Designer', platformFeePct: 20, designerEarningsPct: 80, threshold: 1000 },
        { name: 'Platinum Designer', platformFeePct: 17, designerEarningsPct: 83, threshold: 10000 }
      ];

      const getCommissionTier = (salesTotal: number) => {
        for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
          if (salesTotal >= COMMISSION_LEVELS[i].threshold) {
            return COMMISSION_LEVELS[i];
          }
        }
        return COMMISSION_LEVELS[0];
      };

      const currentTier = getCommissionTier(designer.sales_total || 0);
      const designerEarnings = amount * (currentTier.designerEarningsPct / 100);
      const platformFee = amount * (currentTier.platformFeePct / 100);

      // Create a test order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          stripe_checkout_session_id: `test_sim_${Date.now()}`,
          stripe_payment_intent_id: `pi_test_sim_${Date.now()}`,
          customer_email: 'test@baguri.com',
          customer_name: 'Test Customer',
          total_amount: amount,
          currency: 'ron',
          status: 'completed'
        })
        .select()
        .single();

      if (orderError) {
        throw new Error('Failed to create test order: ' + orderError.message);
      }

      // Create order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          designer_id: designerId,
          product_id: null,
          product_name: 'Simulated Test Product',
          product_price: amount,
          quantity: 1,
          unit_price: amount,
          total_price: amount,
          designer_earnings: designerEarnings,
          baguri_fee: platformFee,
          baguri_fee_percentage: currentTier.platformFeePct,
          commission_tier: currentTier.name,
          commission_percentage: currentTier.designerEarningsPct
        });

      if (itemError) {
        throw new Error('Failed to create test order item: ' + itemError.message);
      }

      // Add earnings to wallet (simulate the webhook logic)
      // Get or create wallet
      let { data: wallet, error: walletError } = await supabase
        .from('designer_wallets')
        .select('*')
        .eq('designer_id', designerId)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
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
          throw new Error('Failed to create wallet: ' + createError.message);
        }
        wallet = newWallet;
      } else if (walletError) {
        throw new Error('Failed to fetch wallet: ' + walletError.message);
      }

      // Update wallet balance
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
        throw new Error('Failed to update wallet: ' + updateError.message);
      }

      // Create wallet transaction
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          designer_id: designerId,
          type: 'sale',
          amount: designerEarnings,
          status: 'completed',
          description: `Simulated sale commission - ${amount} RON total`
        });

      if (transactionError) {
        throw new Error('Failed to create transaction: ' + transactionError.message);
      }

      // Update designer's sales total
      const { error: updateSalesError } = await supabase
        .from('designers')
        .update({ 
          sales_total: (designer.sales_total || 0) + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', designerId);

      if (updateSalesError) {
        throw new Error('Failed to update sales total: ' + updateSalesError.message);
      }

      const result = {
        success: true,
        simulation: {
          designerName: designer.brand_name,
          saleAmount: amount,
          designerEarnings,
          platformFee,
          commissionTier: currentTier.name,
          commissionPercentage: currentTier.designerEarningsPct,
          newBalance: newBalance,
          newTotalEarnings: newTotalEarnings,
          newSalesTotal: (designer.sales_total || 0) + amount
        }
      };

      console.log('✅ Sale simulation completed:', result.simulation);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in wallet flow simulation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 