import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const designerId = 'b9deab43-de7b-4adb-a068-967842aa1ce1';
    const testAmount = 100.00; // Larger test amount
    
    console.log(`🧪 Testing sales total update for designer ${designerId} with amount ${testAmount}`);
    
    // Get current sales total
    const { data: beforeData, error: fetchError } = await supabase
      .from('designers')
      .select('sales_total')
      .eq('id', designerId)
      .single();
    
    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current sales total',
        details: fetchError
      });
    }
    
    const beforeTotal = beforeData.sales_total || 0;
    console.log(`📊 Current sales total: ${beforeTotal}`);
    
    // Test direct update method (skipping stored procedure)
    const newTotal = beforeTotal + testAmount;

    const { error: updateError } = await supabase
      .from('designers')
      .update({ 
        sales_total: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq('id', designerId);
    
    if (updateError) {
      console.error('❌ Direct update failed:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Direct update failed',
        details: updateError,
        beforeTotal
      });
    }
    
    // Get updated sales total
    const { data: afterData, error: afterError } = await supabase
      .from('designers')
      .select('sales_total')
      .eq('id', designerId)
      .single();
    
    if (afterError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch updated sales total',
        details: afterError
      });
    }
    
    const afterTotal = afterData.sales_total || 0;
    console.log(`📊 Updated sales total: ${afterTotal}`);
    
    return NextResponse.json({
      success: true,
      beforeTotal,
      afterTotal,
      difference: afterTotal - beforeTotal,
      testAmount,
      updateResult: "success",
      message: `Sales total successfully updated from ${beforeTotal} to ${afterTotal}`
    });
    
  } catch (error) {
    console.error('❌ Debug sales update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 