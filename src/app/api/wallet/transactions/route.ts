import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create Supabase client with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get designer profile
    const { data: designerAuth, error: designerAuthError } = await supabase
      .from('designer_auth')
      .select('designer_id')
      .eq('user_id', user.id)
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