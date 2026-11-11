import { NextRequest,NextResponse } from 'next/server';
import { requireDesignerUser } from '@/lib/apiAuth';
import { requireInfluencer } from '@/lib/server/influencerAuth';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { getStripe,appUrl } from '@/lib/server/stripe';
export async function POST(req:NextRequest){
 try{
 const {kind,action}=await req.json();
 let id:string;let name:string;let accountId:string|null;let table:string;let returnPath:string;
 if(kind==='influencer'){
  const a=await requireInfluencer(req);if(a instanceof NextResponse)return a;
  if(!a.verified)return NextResponse.json({error:'Account approval required'},{status:403});
  id=a.id;name=a.display_name;accountId=a.stripe_account_id;table='influencer_accounts';returnPath='/influencer-dashboard';
 }else{
  const a=await requireDesignerUser(req);if(a instanceof NextResponse)return a;
  if(!a.isApproved)return NextResponse.json({error:'Designer approval required'},{status:403});
  const {data,error}=await db.from('designers').select('brand_name,stripe_account_id').eq('id',a.designerId).single();if(error)throw error;
  id=a.designerId;name=data.brand_name;accountId=data.stripe_account_id;table='designers';returnPath='/wallet';
 }
 const stripe=getStripe();
 if(!accountId){
   const account=await stripe.v2.core.accounts.create({display_name:name,dashboard:'express',identity:{country:'ro'},configuration:{recipient:{capabilities:{stripe_balance:{stripe_transfers:{requested:true}}}}},defaults:{responsibilities:{fees_collector:'application',losses_collector:'application'}},metadata:{owner_id:id,owner_type:table==='designers'?'designer':'influencer'}},{idempotencyKey:`connect:${table}:${id}`});
   accountId=account.id;const {error}=await db.from(table).update({stripe_account_id:accountId}).eq('id',id);if(error)throw error;
 }
 if(action==='dashboard'){const link=await stripe.accounts.createLoginLink(accountId);return NextResponse.json({url:link.url});}
 if(action==='notification_banner'){
   const session=await stripe.accountSessions.create({account:accountId,components:{notification_banner:{enabled:true}}});return NextResponse.json({clientSecret:session.client_secret});
 }
 const account=await stripe.v2.core.accounts.retrieve(accountId,{include:['configuration.recipient']});
 const active=account.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status==='active';
 if(action==='status')return NextResponse.json({active});
 const link=await stripe.v2.core.accountLinks.create({account:accountId,use_case:{type:'account_onboarding',account_onboarding:{refresh_url:`${appUrl()}${returnPath}?connect=refresh`,return_url:`${appUrl()}${returnPath}?connect=return`}}});
 return NextResponse.json({url:link.url,active});
 }catch(error){console.error('Connect failed',error);return NextResponse.json({error:'Payout account setup is unavailable. Please retry or contact support.'},{status:503});}
}
