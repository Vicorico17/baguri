import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminSession(request);
    if (unauthorized) return unauthorized;

    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const [
      ordersResult,
      withdrawalsResult,
      designersCountResult,
      influencersCountResult,
      productsCountResult,
      applicationsResult,
    ] = await Promise.all([
      supabase.from('orders').select('total_amount, status').eq('status', 'completed'),
      supabase.from('wallet_transactions').select('amount').eq('type', 'withdrawal').eq('status', 'completed'),
      supabase.from('designers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('influencers').select('*', { count: 'exact', head: true }),
      supabase.from('designer_products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase
        .from('designers')
        .select('*, sales_total, current_tier')
        .not('brand_name', 'is', null)
        .order('created_at', { ascending: false }),
    ]);

    if (applicationsResult.error) {
      console.error('Error loading designer applications:', applicationsResult.error);
      return NextResponse.json({ error: applicationsResult.error.message }, { status: 500 });
    }

    if (ordersResult.error) console.error('Error loading admin orders analytics:', ordersResult.error);
    if (withdrawalsResult.error) console.error('Error loading admin withdrawals analytics:', withdrawalsResult.error);
    if (designersCountResult.error) console.error('Error loading designer count:', designersCountResult.error);
    if (influencersCountResult.error) console.error('Error loading influencer count:', influencersCountResult.error);
    if (productsCountResult.error) console.error('Error loading product count:', productsCountResult.error);

    const orders = ordersResult.data || [];
    const withdrawals = withdrawalsResult.data || [];
    const totalOrders = orders.length;
    const totalVolume = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const totalWithdrawn = withdrawals.reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount || 0)), 0);

    return NextResponse.json({
      applications: applicationsResult.data || [],
      analytics: {
        totalOrders,
        totalVolume,
        totalWithdrawn,
        totalProfit: totalVolume - totalWithdrawn,
        totalDesigners: designersCountResult.count || 0,
        totalInfluencers: influencersCountResult.count || 0,
        totalProducts: productsCountResult.count || 0,
      },
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
