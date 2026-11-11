import { NextRequest,NextResponse } from 'next/server';
import { supabaseAdmin as db } from '@/lib/server/supabase';
export async function GET(_req:NextRequest,{params}:{params:Promise<{sessionId:string}>}){
 const {sessionId}=await params;
 if(!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId))return NextResponse.json({error:'Invalid receipt'},{status:400});
 const {data,error}=await db.from('orders').select('id,stripe_checkout_session_id,total_amount,subtotal_amount,shipping_amount,refunded_amount,currency,status,delivery_status,courier_name,tracking_number,created_at,order_items(id,product_name,quantity,unit_price,total_price,selected_size,selected_color)').eq('stripe_checkout_session_id',sessionId).maybeSingle();
 if(error)return NextResponse.json({error:'Receipt unavailable'},{status:503});
 if(!data)return NextResponse.json({error:'Payment confirmation is processing. Please refresh shortly.'},{status:202});
 return NextResponse.json({...data,is_pending:data.status==='pending'},{headers:{'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
}
