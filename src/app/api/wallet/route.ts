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

    // Get wallet data
    const { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('*')
      .eq('designer_id', designerAuth.designer_id)
      .single();

    if (walletError) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('designer_wallets')
        .insert({
          designer_id: designerAuth.designer_id,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
          pending_balance: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
      }

      return NextResponse.json({
        wallet: {
          id: newWallet.id,
          designerId: newWallet.designer_id,
          balance: parseFloat(newWallet.balance),
          totalEarnings: parseFloat(newWallet.total_earnings),
          totalWithdrawn: parseFloat(newWallet.total_withdrawn),
          pendingBalance: parseFloat(newWallet.pending_balance),
          createdAt: newWallet.created_at,
          updatedAt: newWallet.updated_at
        }
      });
    }

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        designerId: wallet.designer_id,
        balance: parseFloat(wallet.balance),
        totalEarnings: parseFloat(wallet.total_earnings),
        totalWithdrawn: parseFloat(wallet.total_withdrawn),
        pendingBalance: parseFloat(wallet.pending_balance),
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at
      }
    });

  } catch (error) {
    console.error('Error in wallet GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { action, amount } = await request.json();

    if (action !== 'withdrawal') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is 50 lei' }, { status: 400 });
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
      .select('*')
      .eq('designer_id', designerAuth.designer_id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal transaction (pending)
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount: -amount, // Negative for withdrawal
        status: 'pending',
        description: `Withdrawal request of ${amount} lei`
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating withdrawal transaction:', transactionError);
      return NextResponse.json({ error: 'Failed to create withdrawal request' }, { status: 500 });
    }

    // Update wallet balance (deduct immediately but mark as pending)
    const { error: updateError } = await supabase
      .from('designer_wallets')
      .update({
        balance: currentBalance - amount,
        pending_balance: parseFloat(wallet.pending_balance) + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transactionId: transaction.id
    });

  } catch (error) {
    console.error('Error in wallet POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 