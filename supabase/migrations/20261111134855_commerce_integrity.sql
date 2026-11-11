-- Compatible with the restored production schema and the repository baseline.
ALTER TABLE public.designer_products ADD COLUMN IF NOT EXISTS stock_quantity text DEFAULT '0';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone text,
 ADD COLUMN IF NOT EXISTS subtotal_amount numeric(12,2), ADD COLUMN IF NOT EXISTS shipping_amount numeric(12,2) DEFAULT 0,
 ADD COLUMN IF NOT EXISTS shipping_name text, ADD COLUMN IF NOT EXISTS shipping_address jsonb,
 ADD COLUMN IF NOT EXISTS delivery_status text DEFAULT 'pending', ADD COLUMN IF NOT EXISTS fulfillment_method text DEFAULT 'courier',
 ADD COLUMN IF NOT EXISTS tracking_number text, ADD COLUMN IF NOT EXISTS courier_name text,
 ADD COLUMN IF NOT EXISTS shipped_at timestamptz, ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES designer_wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sale', 'withdrawal', 'refund', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT NOT NULL,
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    stripe_transfer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallet_transactions
ADD COLUMN IF NOT EXISTS designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Additive commerce migration. Apply after the baseline schema; no example data.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refunded_amount numeric(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS stripe_account_id text;
ALTER TABLE public.designers ADD COLUMN IF NOT EXISTS payouts_frozen boolean NOT NULL DEFAULT false;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_size text NOT NULL DEFAULT '';
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_color text NOT NULL DEFAULT '';
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS line_key text;
DROP INDEX IF EXISTS public.idx_order_items_order_designer_product_unique;
CREATE UNIQUE INDEX IF NOT EXISTS order_items_line_unique ON public.order_items(order_id,line_key);
CREATE TABLE IF NOT EXISTS public.influencer_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider text NOT NULL CHECK(provider IN ('tiktok','instagram')),
 provider_id text NOT NULL, username text NOT NULL, display_name text NOT NULL, verified boolean NOT NULL DEFAULT false,
 balance numeric(12,2) NOT NULL DEFAULT 0, pending_balance numeric(12,2) NOT NULL DEFAULT 0,
 stripe_account_id text, iban text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider,provider_id)
);
CREATE TABLE IF NOT EXISTS public.commerce_reservations (
 id uuid PRIMARY KEY, items jsonb NOT NULL, request_items jsonb NOT NULL, referral_id uuid REFERENCES public.influencer_accounts(id),
 subtotal_cents integer NOT NULL, shipping_cents integer NOT NULL, stripe_session_id text UNIQUE,
 status text NOT NULL DEFAULT 'reserved' CHECK(status IN ('reserved','paid','released')),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '31 minutes', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commerce_ledger (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_type text NOT NULL CHECK(owner_type IN ('designer','influencer')),
 owner_id text NOT NULL, order_id uuid REFERENCES public.orders(id), entry_key text NOT NULL UNIQUE,
 amount numeric(12,2) NOT NULL, kind text NOT NULL, description text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commerce_withdrawals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_type text NOT NULL CHECK(owner_type IN ('designer','influencer')),
 owner_id text NOT NULL, amount numeric(12,2) NOT NULL CHECK(amount>=50),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','failed')),
 stripe_transfer_id text UNIQUE, rejection_reason text, idempotency_key uuid NOT NULL UNIQUE,
 processing_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.commerce_refunds (
 stripe_charge_id text PRIMARY KEY, order_id uuid NOT NULL REFERENCES public.orders(id), amount_cents integer NOT NULL CHECK(amount_cents>=0), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.designer_subscriptions (
 designer_id uuid PRIMARY KEY REFERENCES public.designers(id), stripe_customer_id text, stripe_subscription_id text UNIQUE,
 status text NOT NULL DEFAULT 'inactive', plan text, current_period_end timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.influencer_saved_addresses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), influencer_id uuid NOT NULL REFERENCES public.influencer_accounts(id),
 address text NOT NULL, label text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.influencer_product_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), influencer_id uuid NOT NULL REFERENCES public.influencer_accounts(id),
 designer_id uuid NOT NULL REFERENCES public.designers(id), product_id uuid NOT NULL REFERENCES public.designer_products(id),
 delivery_address text NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(influencer_id,product_id)
);
-- Every new table is server-only; no anonymous or browser writes to financial data.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['influencer_accounts','commerce_reservations','commerce_ledger','commerce_withdrawals','commerce_refunds','designer_subscriptions','influencer_saved_addresses','influencer_product_requests'] LOOP
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
 EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
 END LOOP;
END $$;

-- Locks all products in stable order, checks exact variants, snapshots trusted prices,
-- and deducts stock in the same transaction as creating the reservation.
CREATE OR REPLACE FUNCTION public.reserve_checkout(p_id uuid,p_items jsonb,p_shipping_cents integer,p_referral uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE existing commerce_reservations; item jsonb; p designer_products; d designers; c jsonb; z jsonb;
 ci integer; si integer; qty integer; stock integer; cents integer; total integer:=0; snapshots jsonb:='[]'; ref uuid;
BEGIN
 PERFORM set_config('baguri.inventory_write','true',true);
 PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 SELECT * INTO existing FROM commerce_reservations WHERE id=p_id;
 IF FOUND THEN
   IF existing.request_items<>p_items THEN RAISE EXCEPTION 'Checkout key belongs to another cart'; END IF;
   IF existing.status<>'reserved' OR existing.expires_at<now() THEN RAISE EXCEPTION 'Checkout expired; start again'; END IF;
   RETURN to_jsonb(existing);
 END IF;
 IF jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 OR p_shipping_cents NOT BETWEEN 0 AND 100000 THEN RAISE EXCEPTION 'Invalid checkout'; END IF;
 IF p_referral IS NOT NULL THEN SELECT id INTO ref FROM influencer_accounts WHERE id=p_referral AND verified; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(p_items) ORDER BY value->>'productId',value->>'color',value->>'size' LOOP
   qty:=(item->>'quantity')::integer;
   IF qty NOT BETWEEN 1 AND 10 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
   SELECT * INTO p FROM designer_products WHERE id=(item->>'productId')::uuid FOR UPDATE;
   IF NOT FOUND OR NOT p.is_active OR NOT p.is_live OR p.stock_status='coming_soon' THEN RAISE EXCEPTION 'Product unavailable'; END IF;
   SELECT * INTO d FROM designers WHERE id=p.designer_id;
   IF d.status<>'approved' THEN RAISE EXCEPTION 'Designer not approved'; END IF;
   cents:=round(p.price::numeric*100);
   IF cents<=0 THEN RAISE EXCEPTION 'Invalid product price'; END IF;
   ci:=NULL; si:=NULL;
   IF jsonb_array_length(COALESCE(p.colors::jsonb,'[]'))>0 THEN
     SELECT value, ordinality::integer-1 INTO c,ci FROM jsonb_array_elements(p.colors::jsonb) WITH ORDINALITY WHERE lower(value->>'name')=lower(item->>'color');
     IF ci IS NULL THEN RAISE EXCEPTION 'Color unavailable'; END IF;
     SELECT value, ordinality::integer-1 INTO z,si FROM jsonb_array_elements(COALESCE(c->'sizes','[]')) WITH ORDINALITY WHERE value->>'size'=item->>'size';
     IF si IS NULL THEN RAISE EXCEPTION 'Size unavailable'; END IF;
     IF p.stock_status='in_stock' THEN
       stock:=(z->>'stock')::integer;
       IF stock IS NULL OR stock<qty THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
       UPDATE designer_products SET colors=jsonb_set(p.colors::jsonb,ARRAY[ci::text,'sizes',si::text,'stock'],to_jsonb(stock-qty)) WHERE id=p.id;
     END IF;
   ELSE
     IF COALESCE(item->>'color','')<>'' OR (COALESCE(item->>'size','')<>'' AND NOT (to_jsonb(p.sizes) ? (item->>'size'))) THEN RAISE EXCEPTION 'Variant unavailable'; END IF;
     IF p.stock_status='in_stock' THEN
       stock:=p.stock_quantity::integer;
       IF stock IS NULL OR stock<qty THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
       UPDATE designer_products SET stock_quantity=(stock-qty)::text WHERE id=p.id;
     END IF;
   END IF;
   snapshots:=snapshots||jsonb_build_array(jsonb_build_object('product_id',p.id,'designer_id',p.designer_id,'name',p.name,'size',item->>'size','color',item->>'color','quantity',qty,'unit_cents',cents,'stock_reserved',p.stock_status='in_stock'));
   total:=total+cents*qty;
 END LOOP;
 INSERT INTO commerce_reservations(id,items,request_items,referral_id,subtotal_cents,shipping_cents) VALUES(p_id,snapshots,p_items,ref,total,p_shipping_cents) RETURNING * INTO existing;
 RETURN to_jsonb(existing);
END $$;

CREATE OR REPLACE FUNCTION public.restore_reserved_stock(p_items jsonb) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE item jsonb;p designer_products;ci integer;si integer;c jsonb;z jsonb;
BEGIN
 PERFORM set_config('baguri.inventory_write','true',true);
 FOR item IN SELECT value FROM jsonb_array_elements(p_items) ORDER BY value->>'product_id' LOOP
 IF NOT (item->>'stock_reserved')::boolean THEN CONTINUE; END IF;
 SELECT * INTO p FROM designer_products WHERE id=(item->>'product_id')::uuid FOR UPDATE;
 IF NOT FOUND THEN CONTINUE; END IF;
 IF COALESCE(item->>'color','')<>'' THEN
   SELECT value,ordinality::integer-1 INTO c,ci FROM jsonb_array_elements(p.colors::jsonb) WITH ORDINALITY WHERE lower(value->>'name')=lower(item->>'color');
   SELECT value,ordinality::integer-1 INTO z,si FROM jsonb_array_elements(COALESCE(c->'sizes','[]')) WITH ORDINALITY WHERE value->>'size'=item->>'size';
   IF ci IS NULL OR si IS NULL THEN RAISE EXCEPTION 'Reserved variant was removed; restore it before releasing stock'; END IF;
   UPDATE designer_products SET colors=jsonb_set(p.colors::jsonb,ARRAY[ci::text,'sizes',si::text,'stock'],to_jsonb((z->>'stock')::integer+(item->>'quantity')::integer)) WHERE id=p.id;
 ELSE
   UPDATE designer_products SET stock_quantity=(COALESCE(p.stock_quantity::integer,0)+(item->>'quantity')::integer)::text WHERE id=p.id;
 END IF;
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.release_checkout(p_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE r commerce_reservations;
BEGIN
 SELECT * INTO r FROM commerce_reservations WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR r.status<>'reserved' THEN RETURN; END IF;
 PERFORM restore_reserved_stock(r.items);
 UPDATE commerce_reservations SET status='released' WHERE id=p_id;
END $$;

CREATE OR REPLACE FUNCTION public.complete_checkout(p_id uuid,p_session text,p_payment text,p_total integer,p_customer jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE r commerce_reservations;o uuid;item jsonb;d designers;fee numeric;earn numeric;line_total numeric;line_id uuid;line_no integer:=0;ref_earn numeric;
BEGIN
 SELECT * INTO r FROM commerce_reservations WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Missing checkout reservation'; END IF;
 IF r.stripe_session_id IS NOT NULL AND r.stripe_session_id<>p_session THEN RAISE EXCEPTION 'Session mismatch'; END IF;
 IF r.status='paid' THEN SELECT id INTO o FROM orders WHERE stripe_checkout_session_id=p_session; RETURN o; END IF;
 IF r.status<>'reserved' OR p_total<>r.subtotal_cents+r.shipping_cents THEN RAISE EXCEPTION 'Checkout reconciliation mismatch'; END IF;
 INSERT INTO orders(stripe_checkout_session_id,stripe_payment_intent_id,customer_email,customer_name,customer_phone,total_amount,subtotal_amount,shipping_amount,shipping_address,shipping_name,currency,status,delivery_status)
 VALUES(p_session,p_payment,p_customer->>'email',p_customer->>'name',p_customer->>'phone',p_total/100.0,r.subtotal_cents/100.0,r.shipping_cents/100.0,p_customer->'address',p_customer->>'shipping_name','ron','pending','pending') RETURNING id INTO o;
 FOR item IN SELECT value FROM jsonb_array_elements(r.items) ORDER BY value->>'designer_id',value->>'product_id' LOOP
   SELECT * INTO d FROM designers WHERE id=(item->>'designer_id')::uuid FOR UPDATE;
   fee:=CASE WHEN d.sales_total>=10000 THEN 17 WHEN d.sales_total>=1000 THEN 20 WHEN d.sales_total>=100 THEN 25 ELSE 30 END;
   line_total:=(item->>'unit_cents')::numeric*(item->>'quantity')::integer/100;
   earn:=round(line_total*(100-fee)/100,2);line_no:=line_no+1;
   INSERT INTO order_items(order_id,designer_id,product_id,product_name,product_price,quantity,unit_price,total_price,designer_earnings,baguri_fee,baguri_fee_percentage,commission_percentage,commission_tier,selected_size,selected_color,line_key)
   VALUES(o,d.id,(item->>'product_id')::uuid,item->>'name',(item->>'unit_cents')::numeric/100,(item->>'quantity')::integer,(item->>'unit_cents')::numeric/100,line_total,earn,line_total-earn,fee,100-fee,CASE fee WHEN 17 THEN 'Platinum Designer' WHEN 20 THEN 'Gold Designer' WHEN 25 THEN 'Silver Designer' ELSE 'Bronze Designer' END,item->>'size',item->>'color',line_no::text) RETURNING id INTO line_id;
   INSERT INTO designer_wallets(designer_id,balance,total_earnings,total_withdrawn,pending_balance) VALUES(d.id,earn,earn,0,0)
   ON CONFLICT(designer_id) DO UPDATE SET balance=designer_wallets.balance+earn,total_earnings=designer_wallets.total_earnings+earn,updated_at=now();
   INSERT INTO wallet_transactions(wallet_id,designer_id,type,amount,status,description,order_id,order_item_id) SELECT id,d.id,'sale',earn,'completed','Sale commission',o,line_id FROM designer_wallets WHERE designer_id=d.id;
   INSERT INTO commerce_ledger(owner_type,owner_id,order_id,entry_key,amount,kind,description) VALUES('designer',d.id::text,o,'sale:'||line_id,earn,'sale','Sale commission');
   UPDATE designers SET sales_total=sales_total+line_total WHERE id=d.id;
 END LOOP;
 IF r.referral_id IS NOT NULL THEN
   ref_earn:=round(r.subtotal_cents/100.0*0.10,2);
   UPDATE influencer_accounts SET balance=balance+ref_earn WHERE id=r.referral_id;
   INSERT INTO commerce_ledger(owner_type,owner_id,order_id,entry_key,amount,kind,description) VALUES('influencer',r.referral_id::text,o,'referral:'||o,ref_earn,'commission','Referral commission (excluding shipping)');
 END IF;
 UPDATE commerce_reservations SET status='paid',stripe_session_id=p_session WHERE id=p_id;
 UPDATE orders SET status='completed',updated_at=now() WHERE id=o;
 RETURN o;
END $$;

CREATE OR REPLACE FUNCTION public.request_commerce_withdrawal(p_type text,p_owner text,p_amount numeric,p_key uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE w commerce_withdrawals;available numeric;result uuid;account text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_type||p_owner,0));
 SELECT * INTO w FROM commerce_withdrawals WHERE idempotency_key=p_key;
 IF FOUND THEN
   IF w.owner_type<>p_type OR w.owner_id<>p_owner OR w.amount<>p_amount THEN RAISE EXCEPTION 'Request key mismatch'; END IF;
   RETURN w.id;
 END IF;
 IF p_amount<50 OR p_amount<>round(p_amount,2) OR p_amount>1000000 THEN RAISE EXCEPTION 'Invalid withdrawal amount'; END IF;
 IF p_type='designer' THEN
   SELECT balance INTO available FROM designer_wallets WHERE designer_id=p_owner::uuid FOR UPDATE;
   SELECT stripe_account_id INTO account FROM designers WHERE id=p_owner::uuid;
 ELSE
   SELECT balance,stripe_account_id INTO available,account FROM influencer_accounts WHERE id=p_owner::uuid AND verified FOR UPDATE;
 END IF;
 IF available IS NULL OR available<p_amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
 IF account IS NULL THEN RAISE EXCEPTION 'Connect your payout account first'; END IF;
 INSERT INTO commerce_withdrawals(owner_type,owner_id,amount,idempotency_key) VALUES(p_type,p_owner,p_amount,p_key) RETURNING id INTO result;
 IF p_type='designer' THEN
   UPDATE designer_wallets SET balance=balance-p_amount,pending_balance=pending_balance+p_amount,updated_at=now() WHERE designer_id=p_owner::uuid;
 ELSE UPDATE influencer_accounts SET balance=balance-p_amount,pending_balance=pending_balance+p_amount WHERE id=p_owner::uuid; END IF;
 RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.finish_commerce_withdrawal(p_id uuid,p_transfer text,p_rejection text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE w commerce_withdrawals;
BEGIN
 SELECT * INTO w FROM commerce_withdrawals WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal missing'; END IF;
 IF w.status IN ('completed','failed') THEN RETURN; END IF;
 IF p_transfer IS NULL AND (w.status='processing' OR p_rejection IS NULL) THEN RAISE EXCEPTION 'A processing transfer must be reconciled before rejection'; END IF;
 IF w.owner_type='designer' THEN
   UPDATE designer_wallets SET pending_balance=pending_balance-w.amount,balance=balance+CASE WHEN p_transfer IS NULL THEN w.amount ELSE 0 END,total_withdrawn=total_withdrawn+CASE WHEN p_transfer IS NOT NULL THEN w.amount ELSE 0 END,updated_at=now() WHERE designer_id=w.owner_id::uuid;
 ELSE
   UPDATE influencer_accounts SET pending_balance=pending_balance-w.amount,balance=balance+CASE WHEN p_transfer IS NULL THEN w.amount ELSE 0 END WHERE id=w.owner_id::uuid;
 END IF;
 UPDATE commerce_withdrawals SET status=CASE WHEN p_transfer IS NULL THEN 'failed' ELSE 'completed' END,stripe_transfer_id=p_transfer,rejection_reason=p_rejection,updated_at=now() WHERE id=p_id;
 INSERT INTO commerce_ledger(owner_type,owner_id,entry_key,amount,kind,description) VALUES(w.owner_type,w.owner_id,'withdrawal:'||p_id,CASE WHEN p_transfer IS NULL THEN 0 ELSE -w.amount END,'withdrawal',CASE WHEN p_transfer IS NULL THEN 'Withdrawal rejected; funds returned' ELSE 'Transferred to Stripe payout account' END);
END $$;

-- Cumulative refunds tolerate duplicate and out-of-order refund webhooks.
CREATE OR REPLACE FUNCTION public.reconcile_commerce_refund(p_payment text,p_charge text,p_refunded_cents integer)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE o orders;previous integer:=0;entry record;delta numeric;old_ratio numeric;new_ratio numeric;r commerce_reservations;
BEGIN
 SELECT * INTO o FROM orders WHERE stripe_payment_intent_id=p_payment FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order not processed yet; retry refund'; END IF;
 SELECT amount_cents INTO previous FROM commerce_refunds WHERE stripe_charge_id=p_charge;
 previous:=COALESCE(previous,0);
 IF p_refunded_cents<=previous THEN RETURN; END IF;
 IF p_refunded_cents>round(o.total_amount*100) THEN RAISE EXCEPTION 'Refund exceeds payment'; END IF;
 old_ratio:=previous/(o.total_amount*100);new_ratio:=p_refunded_cents/(o.total_amount*100);
 FOR entry IN SELECT owner_type,owner_id,sum(amount) amount FROM commerce_ledger WHERE order_id=o.id AND kind IN ('sale','commission') GROUP BY owner_type,owner_id ORDER BY owner_type,owner_id LOOP
   delta:=round(entry.amount*new_ratio,2)-round(entry.amount*old_ratio,2);
   IF entry.owner_type='designer' THEN
     UPDATE designer_wallets SET balance=balance-delta,total_earnings=total_earnings-delta,updated_at=now() WHERE designer_id=entry.owner_id::uuid;
   ELSE UPDATE influencer_accounts SET balance=balance-delta WHERE id=entry.owner_id::uuid; END IF;
   INSERT INTO commerce_ledger(owner_type,owner_id,order_id,entry_key,amount,kind,description) VALUES(entry.owner_type,entry.owner_id,o.id,'refund:'||p_charge||':'||p_refunded_cents||':'||entry.owner_id,-delta,'refund','Refund commission reversal');
 END LOOP;
 FOR entry IN SELECT designer_id,sum(total_price) amount FROM order_items WHERE order_id=o.id GROUP BY designer_id LOOP
   UPDATE designers SET sales_total=greatest(0,sales_total-(round(entry.amount*new_ratio,2)-round(entry.amount*old_ratio,2))) WHERE id=entry.designer_id;
 END LOOP;
 INSERT INTO commerce_refunds(stripe_charge_id,order_id,amount_cents) VALUES(p_charge,o.id,p_refunded_cents) ON CONFLICT(stripe_charge_id) DO UPDATE SET amount_cents=excluded.amount_cents,updated_at=now();
 UPDATE orders SET refunded_amount=p_refunded_cents/100.0,status=CASE WHEN p_refunded_cents=round(total_amount*100) THEN 'refunded' ELSE status END,updated_at=now() WHERE id=o.id;
 IF p_refunded_cents=round(o.total_amount*100) AND o.delivery_status IN ('pending','packed') THEN
   SELECT * INTO r FROM commerce_reservations WHERE stripe_session_id=o.stripe_checkout_session_id;
   IF FOUND THEN PERFORM restore_reserved_stock(r.items); END IF;
   UPDATE orders SET delivery_status='cancelled' WHERE id=o.id;
 END IF;
END $$;

-- Retire publicly callable privileged legacy functions. Keep server-only RPCs invoker-rights.
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('process_order_earnings','add_designer_earnings','add_designer_earnings_for_order_item','increment_designer_sales','process_withdrawal','reserve_checkout','restore_reserved_stock','release_checkout','complete_checkout','request_commerce_withdrawal','finish_commerce_withdrawal','reconcile_commerce_refund') LOOP
 EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
 EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.signature);
 END LOOP;
 IF to_regclass('public.designer_commission_tiers') IS NOT NULL THEN ALTER VIEW public.designer_commission_tiers SET (security_invoker=true); END IF;
END $$;
-- Sensitive designer fields cannot be self-approved or altered through browser updates.
CREATE OR REPLACE FUNCTION public.protect_designer_fields() RETURNS trigger
LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
 IF current_user IN ('anon','authenticated') THEN
   IF TG_OP='INSERT' THEN
     NEW.status:='draft';NEW.sales_total:=0;NEW.current_tier:='bronze';NEW.instagram_verified:=false;NEW.stripe_account_id:=NULL;NEW.payouts_frozen:=false;
   ELSIF NEW.status IS DISTINCT FROM OLD.status AND NOT (OLD.status IN ('draft','rejected') AND NEW.status='submitted')
     OR NEW.sales_total IS DISTINCT FROM OLD.sales_total OR NEW.current_tier IS DISTINCT FROM OLD.current_tier
     OR NEW.payouts_frozen IS DISTINCT FROM OLD.payouts_frozen OR NEW.instagram_verified IS DISTINCT FROM OLD.instagram_verified OR NEW.stripe_account_id IS DISTINCT FROM OLD.stripe_account_id THEN
     RAISE EXCEPTION 'Protected designer fields';
   END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS protect_designer_fields ON public.designers;
CREATE TRIGGER protect_designer_fields BEFORE INSERT OR UPDATE ON public.designers FOR EACH ROW EXECUTE FUNCTION public.protect_designer_fields();
-- Legacy influencer tables must never allow browser access by guessed social IDs.
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['influencers','influencers_wallets','influencers_wallet_transactions','influencer_withdrawals','influencer_addresses','influencer_item_requests'] LOOP
 IF to_regclass('public.'||t) IS NOT NULL THEN
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
 END IF;
 END LOOP;
END $$;

-- Preserve existing TikTok accounts, wallet balances, addresses and financial history.
INSERT INTO influencer_accounts(provider,provider_id,username,display_name,verified,balance,iban)
SELECT 'tiktok',i.tiktok_open_id,COALESCE(i.username,i.tiktok_open_id),COALESCE(i.display_name,i.tiktok_open_id),COALESCE(i.is_verified,false),COALESCE(w.balance,0),w.iban
FROM influencers i LEFT JOIN influencers_wallets w USING(tiktok_open_id)
ON CONFLICT(provider,provider_id) DO NOTHING;
INSERT INTO commerce_ledger(owner_type,owner_id,entry_key,amount,kind,description,created_at)
SELECT 'influencer',a.id::text,'legacy-influencer:'||t.transaction_id,t.amount,t.type,COALESCE(t.description,'Imported transaction'),t.created_at
FROM influencers_wallet_transactions t JOIN influencer_accounts a ON a.provider='tiktok' AND a.provider_id=t.tiktok_open_id
ON CONFLICT(entry_key) DO NOTHING;
INSERT INTO influencer_saved_addresses(id,influencer_id,address,label,created_at)
SELECT d.id,a.id,CASE WHEN jsonb_typeof(d.address)='string' THEN d.address#>>'{}' ELSE d.address::text END,d.label,d.created_at
FROM influencer_addresses d JOIN influencer_accounts a ON a.provider='tiktok' AND a.provider_id=d.influencer_open_id ON CONFLICT(id) DO NOTHING;
INSERT INTO influencer_product_requests(id,influencer_id,designer_id,product_id,delivery_address,status,created_at)
SELECT r.id,a.id,r.designer_id,r.product_id,CASE WHEN jsonb_typeof(r.delivery_address)='string' THEN r.delivery_address#>>'{}' ELSE r.delivery_address::text END,r.status,r.created_at
FROM influencer_item_requests r JOIN influencer_accounts a ON a.provider='tiktok' AND a.provider_id=r.influencer_open_id ON CONFLICT DO NOTHING;
-- Auth ownership is immutable; approval and role are controlled on the server.
DROP POLICY IF EXISTS "Users can update their own auth record" ON designer_auth;
DROP POLICY IF EXISTS "Users can insert their own auth record" ON designer_auth;
DROP POLICY IF EXISTS "Users can create their own designer auth" ON designer_auth;
CREATE POLICY "Users can create their own designer auth" ON designer_auth FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND role='designer' AND NOT is_approved AND EXISTS(SELECT 1 FROM designers WHERE designers.id=designer_id AND designers.email=auth.email()));
DROP POLICY IF EXISTS "Authenticated users can insert designer profiles" ON designers;
DROP POLICY IF EXISTS "Authenticated users can create draft designer profiles" ON designers;
CREATE POLICY "Authenticated users can create draft designer profiles" ON designers FOR INSERT TO authenticated WITH CHECK(status='draft' AND email=auth.email());
ALTER TABLE designer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
REVOKE INSERT,UPDATE,DELETE ON designer_wallets,wallet_transactions,orders,order_items FROM anon,authenticated;
DROP POLICY IF EXISTS "Designers can view their own wallet" ON designer_wallets;
CREATE POLICY "Designers can view their own wallet" ON designer_wallets FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM designer_auth WHERE designer_id=designer_wallets.designer_id AND user_id=auth.uid()));
DROP POLICY IF EXISTS "Designers can view their own transactions" ON wallet_transactions;
CREATE POLICY "Designers can view their own transactions" ON wallet_transactions FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM designer_auth WHERE designer_id=wallet_transactions.designer_id AND user_id=auth.uid()));

-- Private profile rows are available only to their owner; public storefront data
-- is projected by /api/catalog without bank details, emails, or provider tokens.
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved designers" ON designers;
DROP POLICY IF EXISTS "Public can view live products" ON designer_products;
REVOKE ALL ON designers,designer_auth,designer_products FROM anon;
DROP POLICY IF EXISTS "Owner can read draft profile before auth mapping" ON designers;
CREATE POLICY "Owner can read draft profile before auth mapping" ON designers FOR SELECT TO authenticated USING(status='draft' AND email=auth.email());
REVOKE ALL ON orders,order_items FROM anon,authenticated;
REVOKE ALL ON designer_wallets,wallet_transactions FROM anon;
DO $$ DECLARE t text;f record;BEGIN
 FOREACH t IN ARRAY ARRAY['sales','products','waitlist_emails'] LOOP
 IF to_regclass('public.'||t) IS NOT NULL THEN
 EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON public.%I FROM anon,authenticated',t);
 END IF;END LOOP;
 FOR f IN SELECT p.oid::regprocedure signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('increment_designer_sales','get_baguri_fee_percentage','get_designer_earnings_percentage','update_updated_at_column','add_designer_earnings','process_order_earnings','process_withdrawal') LOOP
 EXECUTE format('ALTER FUNCTION %s SET search_path=public,pg_temp',f.signature);
 END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.commerce_metrics() RETURNS jsonb LANGUAGE sql SECURITY INVOKER SET search_path=public,pg_temp AS $$
 SELECT jsonb_build_object(
 'totalOrders',(SELECT count(*) FROM orders WHERE status IN ('completed','refunded')),
 'totalVolume',(SELECT COALESCE(sum(total_amount-refunded_amount),0) FROM orders WHERE status IN ('completed','refunded')),
 'totalWithdrawn',(SELECT COALESCE(sum(amount),0) FROM commerce_withdrawals WHERE status='completed'),
 'platformRevenue',(SELECT COALESCE(sum(COALESCE(subtotal_amount,total_amount)*(1-refunded_amount/nullif(total_amount,0))),0) FROM orders WHERE status IN ('completed','refunded'))-(SELECT COALESCE(sum(amount),0) FROM commerce_ledger WHERE kind IN ('sale','commission','refund')),
 'totalDesigners',(SELECT count(*) FROM designers WHERE status='approved'),
 'totalInfluencers',(SELECT count(*) FROM influencer_accounts),
 'totalProducts',(SELECT count(*) FROM designer_products WHERE is_active),
 'designerLiabilities',(SELECT COALESCE(sum(balance+pending_balance),0) FROM designer_wallets),
 'influencerLiabilities',(SELECT COALESCE(sum(balance+pending_balance),0) FROM influencer_accounts));
$$;
REVOKE ALL ON FUNCTION commerce_metrics() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION commerce_metrics() TO service_role;
-- Keep auth approval in sync for older UI consumers.
CREATE OR REPLACE FUNCTION public.sync_designer_approval() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
BEGIN UPDATE designer_auth SET is_approved=(NEW.status='approved') WHERE designer_id=NEW.id;RETURN NEW;END $$;
DROP TRIGGER IF EXISTS sync_designer_approval ON designers;
CREATE TRIGGER sync_designer_approval AFTER UPDATE OF status ON designers FOR EACH ROW EXECUTE FUNCTION sync_designer_approval();
-- Protect reservations from product edits that would replace reserved inventory.
CREATE OR REPLACE FUNCTION public.protect_reserved_product() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF COALESCE(current_setting('baguri.inventory_write',true),'')<>'true' AND
 (TG_OP='DELETE' OR NEW.colors IS DISTINCT FROM OLD.colors OR NEW.sizes IS DISTINCT FROM OLD.sizes OR NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity)
 AND EXISTS(SELECT 1 FROM commerce_reservations r,jsonb_array_elements(r.items) i WHERE r.status='reserved' AND i->>'product_id'=OLD.id::text) THEN RAISE EXCEPTION 'Product has an active checkout; retry after it completes or expires';END IF;
 IF TG_OP='DELETE' THEN RETURN OLD;END IF;RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION protect_reserved_product() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS protect_reserved_product ON designer_products;
CREATE TRIGGER protect_reserved_product BEFORE UPDATE OR DELETE ON designer_products FOR EACH ROW EXECUTE FUNCTION protect_reserved_product();
-- Backfill historical designer ledger entries without moving existing wallet balances.
INSERT INTO commerce_ledger(owner_type,owner_id,order_id,entry_key,amount,kind,description)
SELECT 'designer',i.designer_id::text,i.order_id,'sale:'||i.id,i.designer_earnings,'sale','Historical sale commission'
FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.status='completed' ON CONFLICT(entry_key) DO NOTHING;
-- Import pending withdrawal holds; funds were already deducted by the old application.
INSERT INTO commerce_withdrawals(id,owner_type,owner_id,amount,status,idempotency_key,created_at)
SELECT t.id,'designer',COALESCE(t.designer_id,w.designer_id)::text,abs(t.amount),'pending',t.id,t.created_at
FROM wallet_transactions t JOIN designer_wallets w ON w.id=t.wallet_id WHERE t.type='withdrawal' AND t.status='pending' AND abs(t.amount)>=50 ON CONFLICT DO NOTHING;
INSERT INTO commerce_withdrawals(id,owner_type,owner_id,amount,status,idempotency_key,created_at)
SELECT w.id,'influencer',a.id::text,w.amount,'pending',w.id,w.created_at
FROM influencer_withdrawals w JOIN influencer_accounts a ON a.provider='tiktok' AND a.provider_id=w.tiktok_open_id WHERE w.status='pending' AND w.amount>=50 ON CONFLICT DO NOTHING;
UPDATE influencer_accounts a SET pending_balance=(SELECT COALESCE(sum(w.amount),0) FROM commerce_withdrawals w WHERE w.owner_type='influencer' AND w.owner_id=a.id::text AND w.status IN ('pending','processing'));
CREATE TABLE IF NOT EXISTS public.commerce_risk_events (
 id text PRIMARY KEY, event_type text NOT NULL, payment_intent text, details jsonb NOT NULL DEFAULT '{}', resolved boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE commerce_risk_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON commerce_risk_events FROM anon,authenticated;
GRANT ALL ON commerce_risk_events TO service_role;
ALTER TABLE designers ADD COLUMN IF NOT EXISTS payouts_frozen boolean NOT NULL DEFAULT false;
ALTER TABLE influencer_accounts ADD COLUMN IF NOT EXISTS payouts_frozen boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS public.api_rate_limits(bucket text PRIMARY KEY,hits integer NOT NULL,expires_at timestamptz NOT NULL);
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON api_rate_limits FROM anon,authenticated;
GRANT ALL ON api_rate_limits TO service_role;
CREATE OR REPLACE FUNCTION public.consume_rate_limit(p_bucket text,p_limit integer,p_window integer) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=public,pg_temp AS $$
DECLARE n integer;BEGIN
 INSERT INTO api_rate_limits(bucket,hits,expires_at) VALUES(p_bucket,1,now()+make_interval(secs=>p_window))
 ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN api_rate_limits.expires_at<=now() THEN 1 ELSE api_rate_limits.hits+1 END,expires_at=CASE WHEN api_rate_limits.expires_at<=now() THEN now()+make_interval(secs=>p_window) ELSE api_rate_limits.expires_at END RETURNING hits INTO n;
 DELETE FROM api_rate_limits WHERE expires_at<now()-interval '1 day';RETURN n<=p_limit;
END $$;
REVOKE ALL ON FUNCTION consume_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION consume_rate_limit(text,integer,integer) TO service_role;
CREATE TABLE IF NOT EXISTS public.referral_clicks(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),influencer_id uuid NOT NULL REFERENCES influencer_accounts(id),product_id uuid NOT NULL REFERENCES designer_products(id),created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON referral_clicks FROM anon,authenticated;
GRANT ALL ON referral_clicks TO service_role;
CREATE INDEX IF NOT EXISTS commerce_ledger_owner_idx ON commerce_ledger(owner_type,owner_id,created_at);
CREATE INDEX IF NOT EXISTS commerce_ledger_order_idx ON commerce_ledger(order_id);
CREATE INDEX IF NOT EXISTS commerce_withdrawals_owner_idx ON commerce_withdrawals(owner_type,owner_id,created_at);
CREATE INDEX IF NOT EXISTS commerce_reservations_status_idx ON commerce_reservations(status,created_at);
CREATE INDEX IF NOT EXISTS influencer_saved_addresses_owner_idx ON influencer_saved_addresses(influencer_id);
CREATE INDEX IF NOT EXISTS influencer_product_requests_designer_idx ON influencer_product_requests(designer_id);
CREATE INDEX IF NOT EXISTS referral_clicks_influencer_idx ON referral_clicks(influencer_id);
CREATE INDEX IF NOT EXISTS referral_clicks_product_idx ON referral_clicks(product_id);
CREATE INDEX IF NOT EXISTS commerce_refunds_order_idx ON commerce_refunds(order_id);
