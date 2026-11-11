import 'server-only';
import { NextRequest,NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { appUrl } from './stripe';
import { signSession,verifySession } from '@/lib/session';
import { cookieOptions,INFLUENCER_COOKIE } from './influencerAuth';
import { supabaseAdmin as db } from './supabase';
type Provider='tiktok'|'instagram';
export function startOAuth(provider:Provider,designerId?:string) {
 const client=provider==='tiktok'?process.env.TIKTOK_CLIENT_KEY:process.env.INSTAGRAM_CLIENT_ID;
 if(!client)throw new Error(`${provider} login is not configured`);
 const state=signSession({sub:designerId || 'influencer',purpose:`oauth:${provider}`,exp:Math.floor(Date.now()/1000)+600,nonce:randomUUID()});
 const url=new URL(provider==='tiktok'?'https://www.tiktok.com/v2/auth/authorize/':'https://www.instagram.com/oauth/authorize');
 url.searchParams.set(provider==='tiktok'?'client_key':'client_id',client);
 url.searchParams.set('redirect_uri',`${appUrl()}/api/auth/${provider}/callback`);
 url.searchParams.set('scope',provider==='tiktok'?'user.info.basic,user.info.stats':'instagram_business_basic');
 url.searchParams.set('response_type','code');url.searchParams.set('state',state);
 const response=designerId?NextResponse.json({success:true,authUrl:url.toString()}):NextResponse.redirect(url);
 response.cookies.set(`baguri_oauth_${provider}`,state,{...cookieOptions,maxAge:600});
 return response;
}
export async function finishOAuth(req:NextRequest,provider:Provider) {
 const state=req.nextUrl.searchParams.get('state');const code=req.nextUrl.searchParams.get('code');
 const identity=verifySession(state || undefined,`oauth:${provider}`);
 if(!code || !identity || state!==req.cookies.get(`baguri_oauth_${provider}`)?.value)return NextResponse.json({error:'Invalid or expired sign-in. Start again.'},{status:400});
 try {
  let id:string,username:string,name:string,verified=false;
  if(provider==='tiktok'){
   const tokenResponse=await fetch('https://open.tiktokapis.com/v2/oauth/token/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_key:process.env.TIKTOK_CLIENT_KEY!,client_secret:process.env.TIKTOK_CLIENT_SECRET!,code,grant_type:'authorization_code',redirect_uri:`${appUrl()}/api/auth/tiktok/callback`})});
   const token=await tokenResponse.json();if(!tokenResponse.ok || !token.access_token)throw new Error('Token exchange failed');
   const profileResponse=await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,likes_count,video_count',{headers:{Authorization:`Bearer ${token.access_token}`}});
   const profile=await profileResponse.json();const user=profile.data?.user;
   if(!profileResponse.ok || !user?.open_id || user.open_id!==token.open_id)throw new Error('Profile verification failed');
   id=user.open_id;username=user.display_name;name=user.display_name;
   verified=user.follower_count>=10000 && user.likes_count>=100000 && user.video_count>=5;
  }else{
   const tokenResponse=await fetch('https://api.instagram.com/oauth/access_token',{method:'POST',body:new URLSearchParams({client_id:process.env.INSTAGRAM_CLIENT_ID!,client_secret:process.env.INSTAGRAM_CLIENT_SECRET!,grant_type:'authorization_code',redirect_uri:`${appUrl()}/api/auth/instagram/callback`,code})});
   const token=await tokenResponse.json();if(!tokenResponse.ok || !token.access_token)throw new Error('Token exchange failed');
   const profileResponse=await fetch('https://graph.instagram.com/me?fields=user_id,username',{headers:{Authorization:`Bearer ${token.access_token}`}});
   const user=await profileResponse.json();if(!profileResponse.ok || !user.user_id || !user.username)throw new Error('Profile verification failed');
   id=String(user.user_id);username=user.username;name=user.username;
  }
  if(identity.sub!=='influencer'){
   const {error}=await db.from('designers').update({instagram:`@${username}`,instagram_verified:true,instagram_user_id:id,instagram_access_token:null}).eq('id',identity.sub);
   if(error)throw error;
   const response=NextResponse.redirect(`${appUrl()}/designer-dashboard?instagram=verified`);response.cookies.delete(`baguri_oauth_${provider}`);return response;
  }
  const {data:existing,error:lookupError}=await db.from('influencer_accounts').select('id,verified').eq('provider',provider).eq('provider_id',id).maybeSingle();
  if(lookupError)throw lookupError;
  const {data:account,error}=await db.from('influencer_accounts').upsert({provider,provider_id:id,username,display_name:name,verified:existing?.verified || verified},{onConflict:'provider,provider_id'}).select('id').single();
  if(error)throw error;
  const response=NextResponse.redirect(`${appUrl()}/influencer-dashboard`);
  response.cookies.delete(`baguri_oauth_${provider}`);
  response.cookies.set(INFLUENCER_COOKIE,signSession({sub:account.id,purpose:'influencer',exp:Math.floor(Date.now()/1000)+60*60*24*7}),{...cookieOptions,maxAge:60*60*24*7});
  return response;
 }catch(error){console.error('Social login failed',{provider,error:error instanceof Error?error.message:'Database error'});const response=NextResponse.redirect(`${appUrl()}/influencer-auth?error=callback_failed`);response.cookies.delete(`baguri_oauth_${provider}`);return response;}
}
