import { NextRequest,NextResponse } from 'next/server';
import { requireDesignerUser } from '@/lib/apiAuth';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { getStripe,appUrl } from '@/lib/server/stripe';
export async function GET(req:NextRequest){const a=await requireDesignerUser(req);if(a instanceof NextResponse)return a;const {data,error}=await db.from('designer_subscriptions').select('*').eq('designer_id',a.designerId).maybeSingle();return NextResponse.json(error?{error:'Subscription unavailable'}:{subscription:data,available:!!process.env.STRIPE_WEEKLY_PRICE_ID && !!process.env.STRIPE_YEARLY_PRICE_ID},{status:error?500:200});}
export async function POST(req:NextRequest){
 const a=await requireDesignerUser(req);if(a instanceof NextResponse)return a;
 if(!a.isApproved)return NextResponse.json({error:'Designer approval required'},{status:403});
 try{
 const {plan,action,idempotencyKey}=await req.json();const stripe=getStripe();
 const {data:existing,error}=await db.from('designer_subscriptions').select('*').eq('designer_id',a.designerId).maybeSingle();if(error)throw error;
 if(action==='portal'){
  if(!existing?.stripe_customer_id)return NextResponse.json({error:'No subscription to manage'},{status:404});
  const portal=await stripe.billingPortal.sessions.create({customer:existing.stripe_customer_id,return_url:`${appUrl()}/designer-subscription`});return NextResponse.json({url:portal.url});
 }
 if(existing && ['active','trialing','past_due'].includes(existing.status))return NextResponse.json({error:'Manage your existing subscription instead'},{status:409});
 const price=plan==='weekly'?process.env.STRIPE_WEEKLY_PRICE_ID:plan==='yearly'?process.env.STRIPE_YEARLY_PRICE_ID:null;
 if(!price)return NextResponse.json({error:'Subscription plan is not configured'},{status:503});
 const configuredPrice=await stripe.prices.retrieve(price);
 if(configuredPrice.currency!=='ron' || configuredPrice.unit_amount!==(plan==='weekly'?4900:49900) || configuredPrice.recurring?.interval!==(plan==='weekly'?'week':'year'))throw new Error('Configured price does not match published membership terms');
 if(!/^[0-9a-f-]{36}$/i.test(idempotencyKey || ''))return NextResponse.json({error:'Request key required'},{status:400});
 let customer=existing?.stripe_customer_id;
 if(!customer){const created=await stripe.customers.create({email:a.user.email,metadata:{designer_id:a.designerId}},{idempotencyKey:`subscription-customer:${a.designerId}`});customer=created.id;const result=await db.from('designer_subscriptions').upsert({designer_id:a.designerId,stripe_customer_id:customer,status:'inactive'});if(result.error)throw result.error;}
 const session=await stripe.checkout.sessions.create({mode:'subscription',customer,line_items:[{price,quantity:1}],integration_identifier:'baguri_subscription_abcdefgh',subscription_data:{metadata:{designer_id:a.designerId,plan}},success_url:`${appUrl()}/designer-subscription?success=true`,cancel_url:`${appUrl()}/designer-subscription`},{idempotencyKey:`subscription:${a.designerId}:${idempotencyKey}`});return NextResponse.json({url:session.url});
 }catch(error){console.error('Subscription failed',error);return NextResponse.json({error:'Subscription request failed'},{status:503});}
}
