import {NextRequest,NextResponse} from 'next/server';
import {requireAdminSession} from '@/lib/adminAuth';
import {supabaseAdmin as db} from '@/lib/server/supabase';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest){const denied=await requireAdminSession(req);if(denied)return denied;const [applications,metrics]=await Promise.all([db.from('designers').select('*').not('brand_name','is',null).order('created_at',{ascending:false}),db.rpc('commerce_metrics')]);if(applications.error || metrics.error)return NextResponse.json({error:'Dashboard unavailable'},{status:503});return NextResponse.json({applications:applications.data,analytics:metrics.data});}
