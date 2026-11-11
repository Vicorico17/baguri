import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { getStripe } from '@/lib/server/stripe';
import { moneyCents } from '@/lib/commerce';
export async function POST(req:NextRequest) {
 const denied=await requireAdminSession(req);if(denied)return denied;
 try {
  const {orderId,amount,idempotencyKey}=await req.json();const cents=moneyCents(amount);
  if(!/^[0-9a-f-]{36}$/i.test(idempotencyKey || ''))return NextResponse.json({error:'Request key required'},{status:400});
  const {data:order,error}=await db.from('orders').select('*').eq('id',orderId).single();
  if(error || !order || !['completed','refunded'].includes(order.status))return NextResponse.json({error:'Order unavailable'},{status:404});
  const refund=await getStripe().refunds.create({payment_intent:order.stripe_payment_intent_id,amount:cents,metadata:{order_id:order.id}},{idempotencyKey:`refund:${order.id}:${idempotencyKey}`});
  // Ledger reconciliation is driven by the signed charge.refunded event.
  return NextResponse.json({success:true,refundId:refund.id,status:refund.status});
 }catch(error){console.error('Refund failed',error);return NextResponse.json({error:'Refund could not be created; check remaining refundable amount and retry with the same request'},{status:409});}
}
