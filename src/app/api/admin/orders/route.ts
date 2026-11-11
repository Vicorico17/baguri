import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { canTransitionDelivery } from '@/lib/commerce';
export async function GET(req:NextRequest) {
 const denied=await requireAdminSession(req);if(denied)return denied;
 const {data,error}=await db.from('orders').select('*,order_items(*)').order('created_at',{ascending:false}).limit(200);
 return error?NextResponse.json({error:'Unable to load orders'},{status:500}):NextResponse.json({orders:data});
}
export async function PATCH(req:NextRequest) {
 const denied=await requireAdminSession(req);if(denied)return denied;
 const {id,status,trackingNumber,courier}=await req.json();
 const {data:order,error}=await db.from('orders').select('status,delivery_status').eq('id',id).single();
 if(error || !order)return NextResponse.json({error:'Order not found'},{status:404});
 if(order.status!=='completed' || !canTransitionDelivery(order.delivery_status,status))return NextResponse.json({error:'Invalid delivery transition'},{status:409});
 if(status==='shipped' && (!trackingNumber?.trim() || !courier?.trim()))return NextResponse.json({error:'Courier and tracking number required'},{status:400});
 const update:any={delivery_status:status,updated_at:new Date().toISOString()};
 if(status==='shipped')Object.assign(update,{tracking_number:String(trackingNumber).slice(0,150),courier_name:String(courier).slice(0,100),shipped_at:update.updated_at});
 if(status==='delivered')update.delivered_at=update.updated_at;
 const result=await db.from('orders').update(update).eq('id',id).eq('delivery_status',order.delivery_status).select('id');
 return result.error || !result.data?.length?NextResponse.json({error:'Order changed; refresh and retry'},{status:409}):NextResponse.json({success:true});
}
