import 'server-only';
import {createHash} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {supabaseAdmin as db} from './supabase';
export async function rateLimit(req:NextRequest,scope:string,limit=10,seconds=60){
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
 const bucket=createHash('sha256').update(`${scope}:${ip}`).digest('hex');
 try{const {data,error}=await db.rpc('consume_rate_limit',{p_bucket:bucket,p_limit:limit,p_window:seconds});if(error)throw error;return data?null:NextResponse.json({error:'Too many requests. Please try again shortly.'},{status:429,headers:{'Retry-After':String(seconds)}});}catch{return NextResponse.json({error:'Service temporarily unavailable'},{status:503});}
}
