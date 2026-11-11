import 'server-only';
import { getStripe } from './stripe';
import { supabaseAdmin as db } from './supabase';
export async function syncSubscription(id:string) {
  // Retrieve current state rather than trusting potentially out-of-order event snapshots.
  const sub=await getStripe().subscriptions.retrieve(id);
  const designerId=sub.metadata.designer_id;
  if(!designerId) return;
  const {error}=await db.from('designer_subscriptions').upsert({designer_id:designerId,
    stripe_subscription_id:sub.id,stripe_customer_id:typeof sub.customer==='string'?sub.customer:sub.customer.id,
    status:sub.status,plan:sub.metadata.plan,current_period_end:sub.items.data[0]?.current_period_end?new Date(sub.items.data[0].current_period_end*1000).toISOString():null,updated_at:new Date().toISOString()});
  if(error) throw error;
}
