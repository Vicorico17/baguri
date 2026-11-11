import {NextRequest,NextResponse} from 'next/server';
import {requireDesignerUser} from '@/lib/apiAuth';
import {supabaseAdmin as db} from '@/lib/server/supabase';
export async function POST(req:NextRequest){const a=await requireDesignerUser(req);if(a instanceof NextResponse)return a;const {error}=await db.from('designers').update({instagram_verified:false,instagram_user_id:null,instagram_access_token:null}).eq('id',a.designerId);return NextResponse.json({success:!error},{status:error?503:200});}
