import type Stripe from 'stripe';
import {NextRequest,NextResponse} from 'next/server';
import {supabaseAdmin as db} from '@/lib/server/supabase';
import {getStripe} from '@/lib/server/stripe';
import {fulfillSession} from '@/lib/server/checkout';
export async function GET(req:NextRequest){
 if(!process.env.CRON_SECRET || req.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data,error}=await db.from('commerce_reservations').select('*').eq('status','reserved').order('created_at').limit(100);
 if(error)return NextResponse.json({error:'Database unavailable'},{status:500});
 let processed=0;const failures:string[]=[];const stripe=getStripe();
 for(const r of data || [])try{
   let session:Stripe.Checkout.Session|null=r.stripe_session_id?await stripe.checkout.sessions.retrieve(r.stripe_session_id):null;
   if(!session && new Date(r.expires_at).getTime()<Date.now()){
     // Recover an accepted Stripe request whose database link failed. Exhaust the
     // bounded creation window before deciding that no external session exists.
     let scanned=0;
     for await(const candidate of stripe.checkout.sessions.list({created:{gte:Math.floor(new Date(r.created_at).getTime()/1000)-60,lte:Math.ceil(new Date(r.expires_at).getTime()/1000)},limit:100})){
       if(++scanned>10000)throw new Error('Reconciliation window too large');
       if(candidate.metadata?.reservation_id===r.id){session=candidate;break;}
     }
     if(session){const link=await db.from('commerce_reservations').update({stripe_session_id:session.id}).eq('id',r.id);if(link.error)throw link.error;}
     else{const result=await db.rpc('release_checkout',{p_id:r.id});if(result.error)throw result.error;processed++;continue;}
   }
   if(!session)continue;
   if(session.payment_status==='paid')await fulfillSession(session.id);
   else if(session.status==='expired'){const result=await db.rpc('release_checkout',{p_id:r.id});if(result.error)throw result.error;}
   processed++;
 }catch{failures.push(r.id);}
 return NextResponse.json({processed,failures},{status:failures.length?500:200});
}
