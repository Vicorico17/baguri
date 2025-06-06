import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get the latest order
    const { data: latestOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orderError) {
      return NextResponse.json({ error: 'No orders found' }, { status: 404 });
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', latestOrder.id);

    // Get wallet transactions
    const { data: walletTransactions, error: walletError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('order_id', latestOrder.id);

    // Get designer current state
    const designerId = orderItems?.[0]?.designer_id;
    let designer = null;
    if (designerId) {
      const { data: designerData, error: designerError } = await supabase
        .from('designers')
        .select('sales_total, updated_at')
        .eq('id', designerId)
        .single();
      
      designer = designerData;
    }

    // Calculate expected sales total
    const orderTotal = parseFloat(latestOrder.total_amount);
    const expectedSalesTotal = designer ? (parseFloat(designer.sales_total) + orderTotal) : orderTotal;

    return NextResponse.json({
      debug_info: {
        latest_order: {
          id: latestOrder.id,
          stripe_session_id: latestOrder.stripe_checkout_session_id,
          total_amount: latestOrder.total_amount,
          created_at: latestOrder.created_at
        },
        order_items: orderItems,
        wallet_transactions: walletTransactions,
        designer_current_state: designer,
        calculations: {
          order_total: orderTotal,
          current_sales_total: designer?.sales_total || 0,
          expected_sales_total: expectedSalesTotal,
          sales_total_updated: designer?.updated_at > latestOrder.created_at
        },
        issues: {
          wallet_transaction_missing: !walletTransactions?.length,
          sales_total_not_updated: designer && designer.updated_at <= latestOrder.created_at
        }
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 