import {recordRisk} from '@/lib/server/risk';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/server/stripe';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { fulfillSession } from '@/lib/server/checkout';
import { syncSubscription } from '@/lib/server/subscriptions';
export async function POST(request:NextRequest) {
  const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!secret) return NextResponse.json({error:'Webhook not configured'},{status:503});
  let event:Stripe.Event;
  try {event=getStripe().webhooks.constructEvent(await request.text(),request.headers.get('stripe-signature') || '',secret);}
  catch {return NextResponse.json({error:'Invalid signature'},{status:400});}
  try {
    switch(event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session=event.data.object;
        if(session.mode==='subscription' && session.subscription) await syncSubscription(typeof session.subscription==='string'?session.subscription:session.subscription.id);
        else await fulfillSession(session.id);
        break;
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session=await getStripe().checkout.sessions.retrieve(event.data.object.id);
        if(session.payment_status==='paid') await fulfillSession(session.id);
        else if(session.metadata?.reservation_id) {
          const {error}=await db.rpc('release_checkout',{p_id:session.metadata.reservation_id}); if(error) throw error;
        }
        break;
      }
      case 'charge.refunded': {
        const charge=await getStripe().charges.retrieve(event.data.object.id);
        const payment=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id;
        if(payment) {
          const intent=await getStripe().paymentIntents.retrieve(payment);
          const existing=await db.from('orders').select('id').eq('stripe_payment_intent_id',payment).maybeSingle();
          if(existing.error)throw existing.error;
          if(!existing.data && !intent.metadata.reservation_id){await recordRisk(event.id,event.type,payment,{chargeId:charge.id,refunded:charge.amount_refunded});break;}
          const {error}=await db.rpc('reconcile_commerce_refund',{p_payment:payment,p_charge:charge.id,p_refunded_cents:charge.amount_refunded});if(error) throw error;
        }
        break;
      }
      case 'charge.dispute.created': {
        const dispute=event.data.object;
        await recordRisk(event.id,event.type,typeof dispute.payment_intent==='string'?dispute.payment_intent:dispute.payment_intent?.id || null,{disputeId:dispute.id});break;
      }
      case 'radar.early_fraud_warning.created': {
        const warning=event.data.object;
        await recordRisk(event.id,event.type,typeof warning.payment_intent==='string'?warning.payment_intent:warning.payment_intent?.id || null,{warningId:warning.id});break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': await syncSubscription(event.data.object.id);break;
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const sub=event.data.object.parent?.subscription_details?.subscription;
        if(sub) await syncSubscription(typeof sub==='string'?sub:sub.id);break;
      }
    }
    return NextResponse.json({received:true});
  } catch(error) {
    console.error('Webhook processing failed',{eventId:event.id,type:event.type,error:error instanceof Error?error.message:'Database error'});
    return NextResponse.json({error:'Processing failed; retry required'},{status:500});
  }
}
