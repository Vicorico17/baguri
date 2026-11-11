'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
export default function Withdrawals(){
 const [rows,setRows]=useState<any[]>([]);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function load(){const r=await fetch('/api/admin/withdrawals');const d=await r.json();if(!r.ok)throw new Error(d.error);setRows(d.withdrawals);}
 useEffect(()=>{load().catch(e=>setError(e.message));},[]);
 async function act(id:string,action:string){const reason=action==='reject'?prompt('Reason for rejecting this withdrawal'):undefined;if(action==='reject' && !reason)return;if(action==='approve' && !confirm('Transfer these funds to the recipient’s Stripe account?'))return;setBusy(true);setError('');try{const r=await fetch('/api/admin/withdrawals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action,reason})});const d=await r.json();if(!r.ok)throw new Error(d.error);await load();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <main className="max-w-5xl mx-auto p-6 space-y-5"><Link href="/admin">← Admin</Link><h1 className="text-3xl font-bold">Withdrawals</h1><p>Approval transfers funds to the verified Stripe payout account. Bank payout timing is managed by Stripe.</p><p role="alert">{error}</p><button onClick={()=>load().catch(e=>setError(e.message))}>Refresh</button>{rows.map(w=><section key={w.id} className="p-5 border border-gray-700 rounded-xl space-y-2"><p>{w.owner_type} · {w.owner_id}</p><p>{Number(w.amount).toFixed(2)} RON · {w.status}</p><p>{w.stripe_transfer_id || w.rejection_reason}</p>{['pending','processing'].includes(w.status)&&<div className="flex gap-5"><button disabled={busy} onClick={()=>act(w.id,'approve')}>{w.status==='processing'?'Reconcile transfer':'Approve & transfer'}</button>{w.status==='pending'&&<button disabled={busy} onClick={()=>act(w.id,'reject')}>Reject</button>}</div>}</section>)}{!rows.length&&<p>No withdrawals.</p>}</main>;
}
