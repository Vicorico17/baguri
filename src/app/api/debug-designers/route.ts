import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { data: designers, error } = await supabase
      .from('designers')
      .select('*')
      .limit(10);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch designers',
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      designers: designers || [],
      count: designers?.length || 0,
      columns: designers?.[0] ? Object.keys(designers[0]) : []
    });

  } catch (error) {
    console.error('Debug designers error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 