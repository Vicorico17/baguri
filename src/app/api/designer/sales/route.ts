import {NextRequest,NextResponse} from 'next/server';
import {requireDesignerUser} from '@/lib/apiAuth';
import {supabaseAdmin as db} from '@/lib/server/supabase';
export async function GET(req:NextRequest){const a=await requireDesignerUser(req);if(a instanceof NextResponse)return a;const {data,error}=await db.from('order_items').select('order_id,total_price').eq('designer_id',a.designerId);return NextResponse.json(error?{error:'Sales unavailable'}:{orderCount:new Set(data.map(x=>x.order_id)).size},{status:error?503:200});}
