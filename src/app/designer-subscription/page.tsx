'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '@/lib/supabase';
export default function Subscription(){
 const [subscription,setSubscription]=useState<any>(null);const [available,setAvailable]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function call(body?:any){const {data}=await supabase.auth.getSession();const r=await fetch('/api/designer/subscription',{method:body?'POST':'GET',headers:{Authorization:`Bearer ${data.session?.access_token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw new Error(d.error);return d;}
 useEffect(()=>{call().then(d=>{setSubscription(d.subscription);setAvailable(d.available);}).catch(e=>setError(e.message));},[]);
 async function open(plan?:string){setBusy(true);try{const keyName=`subscription:${plan}`;const key=sessionStorage.getItem(keyName)||crypto.randomUUID();sessionStorage.setItem(keyName,key);const d=await call(plan?{plan,idempotencyKey:key}:{action:'portal'});location.assign(d.url);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <main className="max-w-3xl mx-auto p-6 space-y-6"><Link href="/designer-dashboard">← Dashboard</Link><h1 className="text-3xl font-bold">Designer membership</h1><p>Current status: {subscription?.status || 'No membership'}</p><p role="status">{error}</p>{subscription?.stripe_customer_id&&<button disabled={busy} onClick={()=>open()}>Manage billing & cancellation</button>}<p>Membership is optional. Marketplace commission tiers continue to depend on sales.</p>{!available?<p>Membership enrollment is not available yet.</p>:<div className="grid sm:grid-cols-2 gap-6">{[{id:'weekly',name:'Weekly membership',price:'49 RON / week'},{id:'yearly',name:'Annual membership',price:'499 RON / year'}].map(p=><section key={p.id} className="p-6 border border-gray-700 rounded-xl"><h2>{p.name}</h2><p>{p.price}</p><button disabled={busy || ['active','trialing','past_due'].includes(subscription?.status)} onClick={()=>open(p.id)}>Continue to secure checkout</button></section>)}</div>}</main>;
}
