import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing manual updates vs stored procedures...');
    
    const designerId = 'b9deab43-de7b-4adb-a068-967842aa1ce1';
    const testAmount = 0.01; // Small amount for testing
    
    // Get initial state
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .select('id, sales_total')
      .eq('id', designerId)
      .single();
      
    const { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('id, balance, designer_id')
      .eq('designer_id', designerId)
      .single();
    
    if (designerError || walletError) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch initial data',
        details: { designerError, walletError }
      });
    }
    
    console.log('Initial state:', { designer, wallet });
    
    // Test 1: Try wallet stored procedure (should work)
    console.log('💰 Testing wallet stored procedure...');
    const { data: walletProcResult, error: walletProcError } = await supabase.rpc('add_designer_earnings', {
      p_designer_id: designerId,
      p_amount: testAmount,
      p_order_id: 'test-debug-' + Date.now(),
      p_description: 'Debug test earnings'
    });
    
    // Test 2: Try sales stored procedure (we know this fails)
    console.log('📈 Testing sales stored procedure...');
    const { data: salesProcResult, error: salesProcError } = await supabase.rpc('increment_designer_sales', {
      p_designer_id: designerId,
      p_amount: testAmount
    });
    
    // Test 3: Try manual wallet update (should work like stored procedure)
    console.log('💸 Testing manual wallet update...');
    const newWalletBalance = parseFloat(wallet.balance) + testAmount;
    const { data: manualWalletResult, error: manualWalletError } = await supabase
      .from('designer_wallets')
      .update({
        balance: newWalletBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id)
      .select('balance');
    
    // Test 4: Try manual designer update (this is what's failing)
    console.log('👤 Testing manual designer update...');
    const newSalesTotal = (designer.sales_total || 0) + testAmount;
    const { data: manualDesignerResult, error: manualDesignerError } = await supabase
      .from('designers')
      .update({
        sales_total: newSalesTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', designerId)
      .select('sales_total');
    
    // Get final state
    const { data: finalDesigner } = await supabase
      .from('designers')
      .select('id, sales_total')
      .eq('id', designerId)
      .single();
      
    const { data: finalWallet } = await supabase
      .from('designer_wallets')
      .select('id, balance')
      .eq('designer_id', designerId)
      .single();
    
    return NextResponse.json({
      success: true,
      message: 'Manual vs stored procedure test completed',
      results: {
        initialState: { designer, wallet },
        finalState: { designer: finalDesigner, wallet: finalWallet },
        tests: {
          walletStoredProc: { result: walletProcResult, error: walletProcError },
          salesStoredProc: { result: salesProcResult, error: salesProcError },
          manualWallet: { result: manualWalletResult, error: manualWalletError },
          manualDesigner: { result: manualDesignerResult, error: manualDesignerError }
        }
      }
    });
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 