import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
let stripe: Stripe | null = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

const MIN_WITHDRAWAL_AMOUNT = 50; // 50 RON minimum

export async function POST(request: NextRequest) {
  try {
    // Check if services are properly configured
    if (!supabase || !stripe) {
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

    const { amount, bankDetails } = await request.json();

    // Validate amount
    if (!amount || amount < MIN_WITHDRAWAL_AMOUNT) {
      return NextResponse.json({ 
        error: `Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT} RON` 
      }, { status: 400 });
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

    // Get designer details
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .select('*')
      .eq('id', designerAuth.designer_id)
      .single();

    if (designerError || !designer) {
      return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
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

    // For now, we'll create a pending withdrawal that admin can process manually
    // In production, you'd integrate with Stripe Connect for automatic payouts
    
    // Create withdrawal transaction (pending)
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount: -amount, // Negative for withdrawal
        status: 'pending',
        description: `Withdrawal request of ${amount} RON`,
        metadata: {
          bank_details: bankDetails,
          designer_name: designer.brand_name || designer.name,
          designer_email: designer.email,
          withdrawal_method: 'bank_transfer'
        }
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
        pending_balance: parseFloat(wallet.pending_balance || '0') + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
    }

    // TODO: In production, create Stripe transfer to designer's connected account
    // For now, we'll handle this manually through admin panel

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully! We will process it within 2-3 business days.',
      transactionId: transaction.id,
      amount: amount,
      estimatedProcessingTime: '2-3 business days'
    });

  } catch (error) {
    console.error('Error in withdrawal POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get withdrawal history
export async function GET(request: NextRequest) {
  try {
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
      .select('*')
      .eq('designer_id', designerAuth.designer_id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Get withdrawal transactions
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })
      .limit(50);

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError);
      return NextResponse.json({ error: 'Failed to fetch withdrawal history' }, { status: 500 });
    }

    return NextResponse.json({
      withdrawals: withdrawals.map((w: any) => ({
        id: w.id,
        amount: Math.abs(parseFloat(w.amount)), // Convert to positive for display
        status: w.status,
        description: w.description,
        createdAt: w.created_at,
        metadata: w.metadata
      }))
    });

  } catch (error) {
    console.error('Error in withdrawal GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 