import {rateLimit} from '@/lib/server/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import { parseCart } from '@/lib/commerce';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { createReservedSession } from '@/lib/server/checkout';
export async function POST(request: NextRequest) {
  const limited=await rateLimit(request,'checkout',15);if(limited)return limited;
  let body;
  try { body=await request.json(); body.items=parseCart(body.items); }
  catch(error) { return NextResponse.json({error:error instanceof Error?error.message:'Invalid cart'},{status:400}); }
  if(!/^[0-9a-f-]{36}$/i.test(body.idempotencyKey || '')) return NextResponse.json({error:'Checkout request key required'},{status:400});
  try {
    const shipping=Number(process.env.DELIVERY_FEE_RON || 20);
    if(!Number.isFinite(shipping) || shipping<0) throw new Error('Invalid delivery fee configuration');
    const {data,error}=await db.rpc('reserve_checkout',{p_id:body.idempotencyKey,p_items:body.items,p_shipping_cents:Math.round(shipping*100),p_referral:/^[0-9a-f-]{36}$/i.test(body.referralCode || '')?body.referralCode:null});
    if(error) return NextResponse.json({error:error.message},{status:409});
    const session=await createReservedSession(data);
    return NextResponse.json({sessionId:session.id,url:session.url});
  } catch(error) {
    console.error('Checkout creation failed',error instanceof Error?error.message:'Unknown error');
    // Keep reservation on ambiguous network failures. Reusing the key safely recovers the same session.
    return NextResponse.json({error:'Checkout could not be opened. Please retry.'},{status:503});
  }
}
