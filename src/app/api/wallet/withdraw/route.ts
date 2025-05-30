import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { designerService } from '@/lib/designerService';

export async function POST(request: NextRequest) {
  try {
    const { amount, bankDetails } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is 50 RON' },
        { status: 400 }
      );
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get designer auth record
    const { data: designerAuth, error: authError } = await supabase
      .from('designer_auth')
      .select('designer_id')
      .eq('user_id', user.id)
      .single();

    if (authError || !designerAuth) {
      return NextResponse.json(
        { error: 'Designer not found' },
        { status: 404 }
      );
    }

    // Get designer wallet
    const wallet = await designerService.getDesignerWallet(designerAuth.designer_id);
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check if sufficient balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ${wallet.balance.toFixed(2)} RON` },
        { status: 400 }
      );
    }

    // Create withdrawal transaction record (pending)
    const { data: transaction, error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount: -amount, // Negative for withdrawal
        status: 'pending',
        description: `Withdrawal request for ${amount.toFixed(2)} RON`
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating withdrawal transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create withdrawal request' },
        { status: 500 }
      );
    }

    // In a real implementation, you would:
    // 1. Create a Stripe transfer to the designer's bank account
    // 2. Update the transaction with the Stripe transfer ID
    // 3. Process the withdrawal using the stored procedure
    
    // For now, we'll simulate the process
    console.log('💰 Withdrawal request created:', {
      designerId: designerAuth.designer_id,
      amount: amount,
      transactionId: transaction.id,
      bankDetails: bankDetails
    });

    // Simulate processing (in production, this would be handled by Stripe webhooks)
    setTimeout(async () => {
      try {
        // Process the withdrawal
        const result = await designerService.processWithdrawal(
          designerAuth.designer_id,
          amount,
          `simulated_transfer_${Date.now()}`
        );
        
        if (result.success) {
          console.log('✅ Withdrawal processed successfully');
        } else {
          console.error('❌ Withdrawal processing failed:', result.error);
        }
      } catch (error) {
        console.error('Error processing withdrawal:', error);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transactionId: transaction.id,
      estimatedProcessingTime: '1-3 business days'
    });

  } catch (error) {
    console.error('Withdrawal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 