import { NextRequest,NextResponse } from 'next/server';
import { requireInfluencer } from '@/lib/server/influencerAuth';
import { supabaseAdmin as db } from '@/lib/server/supabase';
import { moneyCents } from '@/lib/commerce';
export async function GET(req:NextRequest){
 const a=await requireInfluencer(req);if(a instanceof NextResponse)return a;
 const [ledger,withdrawals]=await Promise.all([db.from('commerce_ledger').select('*').eq('owner_type','influencer').eq('owner_id',a.id).order('created_at',{ascending:false}).limit(100),db.from('commerce_withdrawals').select('*').eq('owner_type','influencer').eq('owner_id',a.id).order('created_at',{ascending:false}).limit(100)]);
 if(ledger.error || withdrawals.error)return NextResponse.json({error:'Wallet unavailable'},{status:503});
 return NextResponse.json({account:a,transactions:ledger.data,withdrawals:withdrawals.data});
}
export async function POST(req:NextRequest){
 const a=await requireInfluencer(req);if(a instanceof NextResponse)return a;
 if(!a.verified)return NextResponse.json({error:'Account approval required'},{status:403});
 try{const {amount,idempotencyKey}=await req.json();moneyCents(amount);if(!/^[0-9a-f-]{36}$/i.test(idempotencyKey || ''))throw new Error('Invalid request key');
 const {data,error}=await db.rpc('request_commerce_withdrawal',{p_type:'influencer',p_owner:a.id,p_amount:amount,p_key:idempotencyKey});
 if(error)return NextResponse.json({error:error.message},{status:409});return NextResponse.json({success:true,id:data});
 }catch{return NextResponse.json({error:'Invalid withdrawal request'},{status:400});}
}
