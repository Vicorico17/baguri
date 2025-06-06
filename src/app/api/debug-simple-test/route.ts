import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing simple updates...');
    
    const designerId = 'b9deab43-de7b-4adb-a068-967842aa1ce1';
    const testAmount = 1.0;
    
    // Test 1: Check if we can read designer
    console.log('📖 Reading designer...');
    const { data: designer, error: readError } = await supabase
      .from('designers')
      .select('id, user_name, sales_total')
      .eq('id', designerId)
      .single();
      
    if (readError) {
      console.error('❌ Cannot read designer:', readError);
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot read designer',
        details: readError
      });
    }
    
    console.log('✅ Designer found:', designer);
    
    // Test 2: Try to update sales_total
    console.log('📝 Updating sales_total...');
    const newSalesTotal = (designer.sales_total || 0) + testAmount;
    
    const { data: updateResult, error: updateError } = await supabase
      .from('designers')
      .update({ 
        sales_total: newSalesTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', designerId)
      .select('sales_total');
      
    if (updateError) {
      console.error('❌ Cannot update sales_total:', updateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot update sales_total',
        details: updateError,
        designerData: designer
      });
    }
    
    console.log('✅ Update result:', updateResult);
    
    // Test 3: Check wallet access
    console.log('💰 Checking wallet access...');
    const { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('id, balance, designer_id')
      .eq('designer_id', designerId)
      .single();
      
    if (walletError) {
      console.error('❌ Cannot read wallet:', walletError);
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot read wallet',
        details: walletError,
        designerData: designer,
        salesUpdateResult: updateResult
      });
    }
    
    console.log('✅ Wallet found:', wallet);
    
    // Test 4: Try to update wallet
    console.log('💸 Updating wallet balance...');
    const newBalance = parseFloat(wallet.balance) + testAmount;
    
    const { data: walletUpdateResult, error: walletUpdateError } = await supabase
      .from('designer_wallets')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', wallet.id)
      .select('balance');
      
    if (walletUpdateError) {
      console.error('❌ Cannot update wallet:', walletUpdateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot update wallet',
        details: walletUpdateError,
        designerData: designer,
        salesUpdateResult: updateResult,
        walletData: wallet
      });
    }
    
    console.log('✅ Wallet update result:', walletUpdateResult);
    
    return NextResponse.json({ 
      success: true,
      message: 'All operations successful',
      results: {
        designer: designer,
        salesUpdate: updateResult,
        wallet: wallet,
        walletUpdate: walletUpdateResult
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