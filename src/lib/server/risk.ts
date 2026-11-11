import 'server-only';
import {supabaseAdmin as db} from './supabase';
export async function recordRisk(id:string,type:string,payment:string|null,details:Record<string,unknown>){
 const result=await db.from('commerce_risk_events').upsert({id,event_type:type,payment_intent:payment,details},{onConflict:'id',ignoreDuplicates:true});if(result.error)throw result.error;
 if(!payment)return;
 const {data:order,error}=await db.from('orders').select('id').eq('stripe_payment_intent_id',payment).maybeSingle();if(error)throw error;if(!order)return;
 const ledger=await db.from('commerce_ledger').select('owner_type,owner_id').eq('order_id',order.id);if(ledger.error)throw ledger.error;
 for(const owner of ledger.data || []){const update=await db.from(owner.owner_type==='designer'?'designers':'influencer_accounts').update({payouts_frozen:true}).eq('id',owner.owner_id);if(update.error)throw update.error;}
}
