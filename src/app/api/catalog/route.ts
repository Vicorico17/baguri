import {NextResponse} from 'next/server';
import {supabaseAdmin as db} from '@/lib/server/supabase';
export const dynamic='force-dynamic';
export async function GET(){try{
 const [designers,products]=await Promise.all([
 db.from('designers').select('id,brand_name,description,short_description,long_description,logo_url,secondary_logo_url,city,year_founded,username,specialties,tags,instagram,instagram_verified,tiktok,website,current_tier,sales_total,status,created_at').eq('status','approved').not('brand_name','is',null),
 db.from('designer_products').select('id,designer_id,name,description,price,images,sizes,colors,stock_status,is_active,is_live,created_at').eq('is_live',true).eq('is_active',true)]);
 if(designers.error || products.error)throw new Error('Catalog query failed');
 const approved=new Map(designers.data.map(d=>[d.id,d]));
 return NextResponse.json({designers:designers.data,products:products.data.filter(p=>approved.has(p.designer_id)).map(p=>({...p,designers:approved.get(p.designer_id)}))},{headers:{'Cache-Control':'public, s-maxage=30, stale-while-revalidate=60'}});
 }catch{return NextResponse.json({error:'Catalog temporarily unavailable'},{status:503});}}
