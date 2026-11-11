import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
const designer='11111111-1111-4111-8111-111111111111';const product='22222222-2222-4222-8222-222222222222';const reservation='33333333-3333-4333-8333-333333333333';
const schema=`
CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';CREATE FUNCTION auth.email() RETURNS text LANGUAGE sql AS 'SELECT NULL::text';
CREATE TABLE designers(id uuid PRIMARY KEY,brand_name text,email text,status text,sales_total numeric DEFAULT 0,current_tier text,instagram_verified boolean);
CREATE TABLE designer_auth(id uuid DEFAULT gen_random_uuid(),designer_id uuid,user_id uuid,role text,is_approved boolean);
CREATE TABLE designer_products(id uuid PRIMARY KEY,designer_id uuid REFERENCES designers(id),name text,price numeric,colors jsonb,sizes text[],is_live boolean,is_active boolean,stock_status text);
CREATE TABLE designer_wallets(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),designer_id uuid UNIQUE REFERENCES designers(id),balance numeric DEFAULT 0,total_earnings numeric DEFAULT 0,total_withdrawn numeric DEFAULT 0,pending_balance numeric DEFAULT 0,updated_at timestamptz);
CREATE TABLE orders(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),stripe_payment_intent_id text UNIQUE,stripe_checkout_session_id text,customer_email text,customer_name text,total_amount numeric,currency text,status text,updated_at timestamptz,created_at timestamptz DEFAULT now());
CREATE TABLE order_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_id uuid REFERENCES orders(id),designer_id uuid REFERENCES designers(id),product_id uuid REFERENCES designer_products(id),product_name text,product_price numeric,quantity integer,unit_price numeric,total_price numeric,designer_earnings numeric,baguri_fee numeric,baguri_fee_percentage numeric,commission_tier text,commission_percentage numeric);
CREATE TABLE influencers(tiktok_open_id text PRIMARY KEY,username text,display_name text,is_verified boolean);
CREATE TABLE influencers_wallets(tiktok_open_id text,balance numeric,iban text);
CREATE TABLE influencers_wallet_transactions(transaction_id uuid,tiktok_open_id text,amount numeric,type text,description text,created_at timestamptz);
CREATE TABLE influencer_withdrawals(id uuid,tiktok_open_id text,amount numeric,status text,created_at timestamptz);
CREATE TABLE influencer_addresses(id uuid,influencer_open_id text,address jsonb,label text,created_at timestamptz);
CREATE TABLE influencer_item_requests(id uuid,influencer_open_id text,designer_id uuid,product_id uuid,delivery_address jsonb,status text,created_at timestamptz);
`;
async function setup(){const db=new PGlite();await db.exec(schema);await db.exec(readFileSync('supabase/migrations/20261111134855_commerce_integrity.sql','utf8'));await db.exec(`INSERT INTO designers(id,brand_name,status,sales_total,stripe_account_id) VALUES('${designer}','Test','approved',0,'acct_test');INSERT INTO designer_products VALUES('${product}','${designer}','Dress',100,'[{"name":"Blue","sizes":[{"size":"S","stock":3},{"size":"M","stock":2}]}]',ARRAY['S','M'],true,true,'in_stock','0');`);return db;}
const cart=(size='S',quantity=1)=>JSON.stringify([{productId:product,color:'Blue',size,quantity}]);
test('reserve, fulfill, replay, refund and withdraw preserve the ledger',async()=>{
 const db=await setup();try{
 await db.query('SELECT reserve_checkout($1,$2,2000)',[reservation,cart()]);
 await db.query('SELECT reserve_checkout($1,$2,2000)',[reservation,cart()]);
 assert.equal((await db.query<any>(`SELECT colors->0->'sizes'->0->>'stock' stock FROM designer_products`)).rows[0].stock,'2');
 await db.query('SELECT complete_checkout($1,$2,$3,12000,$4)',[reservation,'cs_test_order','pi_test_order','{}']);
 await db.query('SELECT complete_checkout($1,$2,$3,12000,$4)',[reservation,'cs_test_order','pi_test_order','{}']);
 assert.equal(Number((await db.query<any>('SELECT balance FROM designer_wallets')).rows[0].balance),70);
 assert.equal(Number((await db.query<any>('SELECT sales_total FROM designers')).rows[0].sales_total),100);
 assert.equal((await db.query<any>('SELECT selected_size FROM order_items')).rows[0].selected_size,'S');
 await db.query('SELECT reconcile_commerce_refund($1,$2,6000)',['pi_test_order','ch_test_order']);
 await db.query('SELECT reconcile_commerce_refund($1,$2,6000)',['pi_test_order','ch_test_order']);
 assert.equal(Number((await db.query<any>('SELECT balance FROM designer_wallets')).rows[0].balance),35);
 await assert.rejects(db.query('SELECT request_commerce_withdrawal($1,$2,50,$3)',['designer',designer,'44444444-4444-4444-8444-444444444444']));
 await db.query('SELECT reconcile_commerce_refund($1,$2,12000)',['pi_test_order','ch_test_order']);
 assert.equal(Number((await db.query<any>('SELECT balance FROM designer_wallets')).rows[0].balance),0);
 assert.equal((await db.query<any>(`SELECT colors->0->'sizes'->0->>'stock' stock FROM designer_products`)).rows[0].stock,'3');
 }finally{await db.close();}
});
test('failed reservations roll back stock and duplicate release is harmless',async()=>{const db=await setup();try{await assert.rejects(db.query('SELECT reserve_checkout($1,$2,2000)',[reservation,cart('S',4)]));await db.query('SELECT reserve_checkout($1,$2,2000)',[reservation,cart('M',2)]);await db.query('SELECT release_checkout($1)',[reservation]);await db.query('SELECT release_checkout($1)',[reservation]);assert.equal((await db.query<any>(`SELECT colors->0->'sizes'->1->>'stock' stock FROM designer_products`)).rows[0].stock,'2');}finally{await db.close();}});
test('withdrawal requests atomically hold funds and enforce idempotency',async()=>{const db=await setup();try{await db.exec(`INSERT INTO designer_wallets(designer_id,balance) VALUES('${designer}',100);`);const key='44444444-4444-4444-8444-444444444444';const a=await db.query<any>('SELECT request_commerce_withdrawal($1,$2,75,$3) id',['designer',designer,key]);const b=await db.query<any>('SELECT request_commerce_withdrawal($1,$2,75,$3) id',['designer',designer,key]);assert.equal(a.rows[0].id,b.rows[0].id);await assert.rejects(db.query('SELECT request_commerce_withdrawal($1,$2,50,$3)',['designer',designer,'55555555-5555-4555-8555-555555555555']));await db.query('SELECT finish_commerce_withdrawal($1,NULL,$2)',[a.rows[0].id,'Requested cancellation']);await db.query('SELECT finish_commerce_withdrawal($1,NULL,$2)',[a.rows[0].id,'Replay']);const w=(await db.query<any>('SELECT * FROM designer_wallets')).rows[0];assert.equal(Number(w.balance),100);assert.equal(Number(w.pending_balance),0);assert.equal((await db.query<any>(`SELECT has_function_privilege('anon','reserve_checkout(uuid,jsonb,integer,uuid)','EXECUTE') allowed`)).rows[0].allowed,false);}finally{await db.close();}});
test('concurrent stock claims cannot oversell the same variant',async()=>{const db=await setup();try{const results=await Promise.allSettled([db.query('SELECT reserve_checkout($1,$2,2000)',['66666666-6666-4666-8666-666666666666',cart('M',2)]),db.query('SELECT reserve_checkout($1,$2,2000)',['77777777-7777-4777-8777-777777777777',cart('M',2)])]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal((await db.query<any>(`SELECT colors->0->'sizes'->1->>'stock' stock FROM designer_products`)).rows[0].stock,'0');}finally{await db.close();}});
