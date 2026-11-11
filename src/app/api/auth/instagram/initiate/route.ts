import { NextRequest,NextResponse } from 'next/server';
import { requireDesignerUser } from '@/lib/apiAuth';
import { startOAuth } from '@/lib/server/socialOAuth';
export async function POST(req:NextRequest) { const auth=await requireDesignerUser(req);if(auth instanceof NextResponse)return auth;return startOAuth('instagram',auth.designerId); }
