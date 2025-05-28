import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Testing database connectivity...');
    
    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('designer_auth')
      .select('user_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connectivity test failed:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Database query failed'
      }, { status: 500 });
    }
    
    console.log('✅ Database connectivity test passed');
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      hasData: data && data.length > 0
    });
    
  } catch (error) {
    console.error('💥 Database connectivity test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Database connection failed'
    }, { status: 500 });
  }
} 