import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/apiAuth';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await requireSupabaseUser(request);
    if (auth instanceof NextResponse) return auth;

    // Get designer profile
    const { data: designerAuth, error: designerAuthError } = await supabase
      .from('designer_auth')
      .select('designer_id')
      .eq('user_id', auth.user.id)
      .single();

    if (designerAuthError || !designerAuth) {
      return NextResponse.json({ error: 'Designer not found' }, { status: 404 });
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('id')
      .eq('designer_id', designerAuth.designer_id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ transactions: [] });
    }

    // Get transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    const formattedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      walletId: transaction.wallet_id,
      type: transaction.type,
      amount: parseFloat(transaction.amount),
      status: transaction.status,
      description: transaction.description,
      orderId: transaction.order_id,
      stripeTransferId: transaction.stripe_transfer_id,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at
    }));

    return NextResponse.json({ transactions: formattedTransactions });

  } catch (error) {
    console.error('Error in wallet transactions GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
