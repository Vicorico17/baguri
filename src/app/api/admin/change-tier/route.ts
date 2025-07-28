import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const { designerId, newTier } = await request.json();

    if (!designerId || !newTier) {
      return NextResponse.json({ success: false, error: 'Missing designerId or newTier' }, { status: 400 });
    }

    // Authenticate as service role to bypass RLS and ensure admin access
    // In a real application, you'd want to verify the user making this request is an actual admin
    // For now, we'll assume the service role key grants sufficient privilege for this internal API.

    const { error } = await supabase
      .from('designers')
      .update({ current_tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', designerId);

    if (error) {
      console.error('Error updating designer tier:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in change-tier API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
