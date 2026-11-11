import { NextRequest,NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { getStripe } from '@/lib/server/stripe';
export async function GET(req:NextRequest){const denied=await requireAdminSession(req);if(denied)return denied;const {data,error}=await db.from('commerce_withdrawals').select('*').order('created_at',{ascending:false}).limit(200);return NextResponse.json(error?{error:'Unable to load withdrawals'}:{withdrawals:data},{status:error?500:200});}
export async function POST(req:NextRequest){
 const denied=await requireAdminSession(req);if(denied)return denied;
 try{
 const {id,action,reason}=await req.json();const {data:w,error}=await db.from('commerce_withdrawals').select('*').eq('id',id).single();if(error || !w)return NextResponse.json({error:'Withdrawal not found'},{status:404});
 if(['completed','failed'].includes(w.status))return NextResponse.json({success:true,status:w.status});
 if(action==='reject'){
   if(typeof reason!=='string' || !reason.trim())return NextResponse.json({error:'Rejection reason required'},{status:400});
   const result=await db.rpc('finish_commerce_withdrawal',{p_id:id,p_transfer:null,p_rejection:reason.slice(0,500)});if(result.error)throw result.error;return NextResponse.json({success:true});
 }
 if(action!=='approve')return NextResponse.json({error:'Invalid action'},{status:400});
 const table=w.owner_type==='designer'?'designers':'influencer_accounts';
 const {data:owner,error:ownerError}=await db.from(table).select('stripe_account_id,payouts_frozen').eq('id',w.owner_id).single();if(ownerError || !owner?.stripe_account_id)throw new Error('Payout account missing');
 if(owner.payouts_frozen)return NextResponse.json({error:'Payouts are frozen pending payment risk review'},{status:409});
 const stripe=getStripe();const account=await stripe.v2.core.accounts.retrieve(owner.stripe_account_id,{include:['configuration.recipient']});
 if(account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status!=='active')return NextResponse.json({error:'Recipient must finish Stripe verification'},{status:409});
 // Never reissue an ambiguous transfer outside Stripe's idempotency retention window.
 if(w.status==='processing' && Date.now()-new Date(w.processing_at).getTime()>23*60*60*1000)return NextResponse.json({error:'Transfer requires Stripe reconciliation before retry; no additional transfer was sent'},{status:409});
 const claim=await db.from('commerce_withdrawals').update({status:'processing',processing_at:w.processing_at || new Date().toISOString()}).eq('id',id).in('status',['pending','processing']).select('id');if(claim.error || !claim.data?.length)throw new Error('Withdrawal changed');
 const transfer=await stripe.transfers.create({amount:Math.round(Number(w.amount)*100),currency:'ron',destination:owner.stripe_account_id,metadata:{withdrawal_id:w.id},transfer_group:`withdrawal:${w.id}`},{idempotencyKey:`withdrawal:${w.id}`});
 const result=await db.rpc('finish_commerce_withdrawal',{p_id:id,p_transfer:transfer.id,p_rejection:null});if(result.error)throw result.error;
 return NextResponse.json({success:true,transferId:transfer.id});
 }catch(error){console.error('Withdrawal processing failed',error);return NextResponse.json({error:'Withdrawal was not finalized. Retry approval to reconcile the same transfer.'},{status:503});}
}
