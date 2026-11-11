'use client';
import {Suspense,useEffect,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {useCart} from '@/contexts/CartContext';
function Receipt(){const params=useSearchParams();const session=params?.get('session_id');const [order,setOrder]=useState<any>(null);const [error,setError]=useState('');const {clearCart}=useCart();
 useEffect(()=>{if(!session)return;let cancelled=false;let timer:ReturnType<typeof setTimeout>;let attempts=0;async function load(){try{const r=await fetch(`/api/orders/${session}`);const d=await r.json();if(cancelled)return;if(r.status===202){setError(d.error);if(++attempts<20)timer=setTimeout(load,3000);return;}if(!r.ok)throw new Error(d.error);setOrder(d);setError('');if(d.status==='completed'){clearCart();sessionStorage.removeItem('baguri_checkout');}}catch(e){if(!cancelled)setError((e as Error).message);}}void load();return()=>{cancelled=true;clearTimeout(timer);};},[session,clearCart]);
 return <main className="max-w-3xl mx-auto p-8 space-y-5"><Link href="/shop">← Continue shopping</Link><h1 className="text-3xl font-bold">{order?'Your order':'Confirming your payment'}</h1><p role="status">{error || (!order?'Waiting for payment confirmation…':'')}</p>{!session&&<p>No receipt was provided.</p>}{order&&<><p>Payment: {order.status} · Delivery: {order.delivery_status}</p><p>Total: {Number(order.total_amount).toFixed(2)} RON · Refunded: {Number(order.refunded_amount).toFixed(2)} RON</p>{order.order_items.map((i:any)=><p key={i.id}>{i.quantity} × {i.product_name} — {i.selected_color} / {i.selected_size}</p>)}{order.tracking_number&&<p>{order.courier_name}: {order.tracking_number}</p>}</>}<button onClick={()=>location.reload()}>Refresh status</button></main>;
}
export default function Success(){return <Suspense fallback={<p>Loading receipt…</p>}><Receipt/></Suspense>;}
