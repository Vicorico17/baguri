'use client';
import {useState} from 'react';
import {supabase} from '@/lib/supabase';
export function PayoutSetup({kind='designer'}:{kind?:'designer'|'influencer'}){
 const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 async function open(action:string){setBusy(true);setMessage('');try{const headers:Record<string,string>={'Content-Type':'application/json'};if(kind==='designer'){const {data}=await supabase.auth.getSession();headers.Authorization=`Bearer ${data.session?.access_token}`;}const r=await fetch('/api/connect',{method:'POST',headers,body:JSON.stringify({kind,action})});const d=await r.json();if(!r.ok)throw new Error(d.error);if(d.url)location.assign(d.url);else setMessage(d.active?'Your payout account is ready.':'Finish verification to receive payouts.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 return <section className="border border-gray-700 rounded-xl p-4 my-4 space-y-3"><h2 className="font-bold">Payout account</h2><p>Connect Stripe to verify your identity, manage bank details, and receive earnings.</p><div className="flex flex-wrap gap-4"><button disabled={busy} onClick={()=>open('onboard')}>Set up / update account</button><button disabled={busy} onClick={()=>open('dashboard')}>Open Stripe dashboard</button><button disabled={busy} onClick={()=>open('status')}>Check verification</button></div><p role="status">{message}</p></section>;
}
