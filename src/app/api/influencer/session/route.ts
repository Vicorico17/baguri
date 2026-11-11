import { NextRequest,NextResponse } from 'next/server';
import { requireInfluencer,INFLUENCER_COOKIE } from '@/lib/server/influencerAuth';
export async function GET(req:NextRequest){const account=await requireInfluencer(req);return account instanceof NextResponse?account:NextResponse.json({account});}
export async function DELETE(){const response=NextResponse.json({success:true});response.cookies.delete(INFLUENCER_COOKIE);return response;}
