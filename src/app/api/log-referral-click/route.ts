import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { referral_code, product_id } = await request.json();
    if (!referral_code || !product_id) {
      return NextResponse.json({ error: 'Missing referral_code or product_id' }, { status: 400 });
    }

    // Look up influencer by tiktok_open_id (referral_code)
    let influencerId = null;
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('id')
      .eq('tiktok_open_id', referral_code)
      .single();
    if (!influencerError && influencer) {
      influencerId = influencer.id;
    }

    const { data, error } = await supabase
      .from('referral_clicks')
      .insert([
        {
          referral_code,
          product_id,
          influencer_id: influencerId,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 