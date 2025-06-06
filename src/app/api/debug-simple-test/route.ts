import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Testing increment_designer_sales procedure...');
    
    const designerId = 'b9deab43-de7b-4adb-a068-967842aa1ce1';
    const testAmount = 1.0;
    
    // First verify the designer exists
    console.log('📖 Verifying designer exists...');
    const { data: designer, error: readError } = await supabase
      .from('designers')
      .select('id, brand_name, sales_total')
      .eq('id', designerId)
      .single();
    
    if (readError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Designer not found',
        details: readError
      });
    }
    
    console.log('✅ Designer found:', designer);
    
    // Test different parameter combinations for increment_designer_sales
    const parameterTests = [
      { name: 'p_designer_id + p_amount', params: { p_designer_id: designerId, p_amount: testAmount } },
      { name: 'designer_id + amount', params: { designer_id: designerId, amount: testAmount } },
      { name: 'designer_id_param + amount_param', params: { designer_id_param: designerId, amount_param: testAmount } },
      { name: 'id + amount', params: { id: designerId, amount: testAmount } },
    ];
    
    const results: Record<string, any> = {};
    
    for (const test of parameterTests) {
      console.log(`📈 Testing increment_designer_sales with ${test.name}...`);
      try {
        const { data: result, error } = await supabase.rpc('increment_designer_sales', test.params);
        results[test.name] = { result, error };
        console.log(`${test.name} result:`, result, 'Error:', error);
        
        // If successful, break to avoid multiple updates
        if (!error) {
          console.log('✅ Found working parameter format!');
          break;
        }
      } catch (err) {
        results[test.name] = { error: err };
        console.log(`${test.name} failed:`, err);
      }
    }
    
    // Check final sales total
    const { data: finalDesigner } = await supabase
      .from('designers')
      .select('id, brand_name, sales_total')
      .eq('id', designerId)
      .single();
    
    return NextResponse.json({ 
      success: true,
      message: 'Parameter tests completed',
      results: {
        initialDesigner: designer,
        finalDesigner: finalDesigner,
        parameterTests: results
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