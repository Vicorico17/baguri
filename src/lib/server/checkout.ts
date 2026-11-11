import 'server-only';
import { getStripe, appUrl } from './stripe';
import { supabaseAdmin as db } from './supabase';
export async function createReservedSession(r: any) {
  const stripe = getStripe();
  if (r.stripe_session_id) return stripe.checkout.sessions.retrieve(r.stripe_session_id);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', client_reference_id: r.id,
    integration_identifier: 'baguri_checkout_abcdefgh',
    metadata: { reservation_id: r.id },
    payment_intent_data: { metadata: { reservation_id: r.id }, transfer_group: r.id },
    line_items: r.items.map((item: any) => ({ quantity: item.quantity, price_data: {
      currency: 'ron', unit_amount: item.unit_cents,
      product_data: { name: item.name, description: [item.color,item.size].filter(Boolean).join(' / ') || undefined,
        metadata: { product_id:item.product_id, designer_id:item.designer_id, size:item.size, color:item.color } }
    }})),
    expires_at: Math.floor(new Date(r.expires_at).getTime()/1000),
    success_url: `${appUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/shop`,
    phone_number_collection: { enabled:true }, shipping_address_collection:{allowed_countries:['RO']},
    shipping_options:[{shipping_rate_data:{type:'fixed_amount',fixed_amount:{amount:r.shipping_cents,currency:'ron'},display_name:'Courier delivery'}}]
  }, { idempotencyKey:`checkout:${r.id}` });
  const {error} = await db.from('commerce_reservations').update({stripe_session_id:session.id}).eq('id',r.id);
  if(error) throw error;
  return session;
}
export async function fulfillSession(sessionId: string) {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if(session.mode !== 'payment' || session.payment_status !== 'paid') return;
  const id = session.metadata?.reservation_id;
  if(!id) throw new Error('Legacy checkout requires manual reconciliation');
  const shipping = session.collected_information?.shipping_details;
  const {error} = await db.rpc('complete_checkout', {
    p_id:id,p_session:session.id,p_payment:typeof session.payment_intent==='string'?session.payment_intent:session.payment_intent?.id,
    p_total:session.amount_total,p_customer:{...session.customer_details,address:shipping?.address,shipping_name:shipping?.name}
  });
  if(error) throw error;
}
