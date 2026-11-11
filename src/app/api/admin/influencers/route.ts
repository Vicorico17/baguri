import {NextRequest,NextResponse} from 'next/server';
import {requireAdminSession} from '@/lib/adminAuth';
import {supabaseAdmin as db} from '@/lib/server/supabase';
export async function GET(req:NextRequest){const denied=await requireAdminSession(req);if(denied)return denied;const {data,error}=await db.from('influencer_accounts').select('id,provider,username,display_name,verified,created_at').order('created_at',{ascending:false});return NextResponse.json(error?{error:'Unable to load influencers'}:{accounts:data},{status:error?500:200});}
export async function POST(req:NextRequest){const denied=await requireAdminSession(req);if(denied)return denied;const {id,verified}=await req.json();if(typeof verified!=='boolean')return NextResponse.json({error:'Invalid approval'},{status:400});const {error}=await db.from('influencer_accounts').update({verified}).eq('id',id);return NextResponse.json({success:!error},{status:error?500:200});}
