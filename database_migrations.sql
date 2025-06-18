-- Database Migrations for Wallet System and Tiered Commission Structure
-- Run these migrations in your Supabase SQL editor

-- 1. Add stock_quantity column to designer_products table
ALTER TABLE designer_products 
ADD COLUMN IF NOT EXISTS stock_quantity TEXT DEFAULT '0';

-- 1.1. Add is_live column to designer_products table (for Go Live functionality)
ALTER TABLE designer_products 
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;

-- 1.2. Add is_active column to designer_products table (for active/inactive status)
ALTER TABLE designer_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Remove affiliate_fee_percentage and add sales_total to designers table
ALTER TABLE designers 
DROP COLUMN IF EXISTS affiliate_fee_percentage;

ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS sales_total DECIMAL(10,2) DEFAULT 0.00 NOT NULL;

-- 3. Add Instagram verification columns to designers table
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS instagram_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS instagram_user_id TEXT;

ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;

-- 4. Create orders table to track sales and calculate earnings
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT,
    customer_email TEXT,
    customer_name TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ron',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create order_items table to track individual products in orders
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES designer_products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    designer_earnings DECIMAL(10,2) NOT NULL, -- Calculated based on current tier
    baguri_fee DECIMAL(10,2) NOT NULL, -- Platform fee taken
    baguri_fee_percentage DECIMAL(5,2) NOT NULL, -- Fee percentage at time of sale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create designer_wallets table
CREATE TABLE IF NOT EXISTS designer_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    total_earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    pending_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(designer_id)
);

-- 7. Create wallet_transactions table
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

-- 8. Create function to calculate Baguri fee percentage based on sales total
CREATE OR REPLACE FUNCTION get_baguri_fee_percentage(p_sales_total DECIMAL(10,2))
RETURNS DECIMAL(5,2) AS $$
BEGIN
    -- Tiered commission structure:
    -- 50% until 1000 RON
    -- 40% until 10000 RON  
    -- 30% after 10000 RON
    
    IF p_sales_total < 1000 THEN
        RETURN 50.00;
    ELSIF p_sales_total < 10000 THEN
        RETURN 40.00;
    ELSE
        RETURN 30.00;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Create function to get designer earnings percentage (100% - Baguri fee)
CREATE OR REPLACE FUNCTION get_designer_earnings_percentage(p_sales_total DECIMAL(10,2))
RETURNS DECIMAL(5,2) AS $$
BEGIN
    RETURN 100.00 - get_baguri_fee_percentage(p_sales_total);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_designer_id ON order_items(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_wallets_designer_id ON designer_wallets(designer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_designers_sales_total ON designers(sales_total);

-- 11. Create RLS (Row Level Security) policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for orders: only admins can see all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM designer_auth da
            WHERE da.user_id = auth.uid() AND da.role = 'admin'
        )
    );

-- Policy for order_items: designers can see their own order items
CREATE POLICY "Designers can view their own order items" ON order_items
    FOR SELECT USING (
        designer_id IN (
            SELECT d.id FROM designers d
            JOIN designer_auth da ON d.id = da.designer_id
            WHERE da.user_id = auth.uid()
        )
    );

-- Policy for designer_wallets: designers can only see their own wallet
CREATE POLICY "Designers can view their own wallet" ON designer_wallets
    FOR SELECT USING (
        designer_id IN (
            SELECT d.id FROM designers d
            JOIN designer_auth da ON d.id = da.designer_id
            WHERE da.user_id = auth.uid()
        )
    );

-- Policy for wallet_transactions: designers can only see their own transactions
CREATE POLICY "Designers can view their own transactions" ON wallet_transactions
    FOR SELECT USING (
        wallet_id IN (
            SELECT dw.id FROM designer_wallets dw
            JOIN designers d ON dw.designer_id = d.id
            JOIN designer_auth da ON d.id = da.designer_id
            WHERE da.user_id = auth.uid()
        )
    );

-- 12. Create stored procedure for processing order and calculating earnings with tiered fees
CREATE OR REPLACE FUNCTION process_order_earnings(
    p_designer_id UUID,
    p_order_id UUID,
    p_earnings_amount DECIMAL(10,2),
    p_sales_amount DECIMAL(10,2)
) RETURNS VOID AS $$
BEGIN
    -- Update designer's sales total
    UPDATE designers 
    SET sales_total = COALESCE(sales_total, 0) + p_sales_amount,
        updated_at = NOW()
    WHERE id = p_designer_id;
    
    -- Update designer's wallet balance
    UPDATE designer_wallets 
    SET balance = COALESCE(balance, 0) + p_earnings_amount,
        total_earnings = COALESCE(total_earnings, 0) + p_earnings_amount,
        updated_at = NOW()
    WHERE designer_id = p_designer_id;
    
    -- Create wallet transaction record
    INSERT INTO wallet_transactions (
        designer_id,
        order_id,
        type,
        amount,
        description,
        status
    ) VALUES (
        p_designer_id,
        p_order_id,
        'earning',
        p_earnings_amount,
        'Commission from product sale',
        'completed'
    );
    
    -- Log the transaction
    RAISE NOTICE 'Processed earnings for designer %: % RON from order %', 
        p_designer_id, p_earnings_amount, p_order_id;
END;
$$ LANGUAGE plpgsql;

-- 13. Create stored procedure for adding earnings (updated version)
CREATE OR REPLACE FUNCTION add_designer_earnings(
    p_designer_id UUID,
    p_amount DECIMAL(10,2),
    p_order_id TEXT,
    p_description TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Get or create wallet
    SELECT id INTO v_wallet_id 
    FROM designer_wallets 
    WHERE designer_id = p_designer_id;
    
    IF v_wallet_id IS NULL THEN
        INSERT INTO designer_wallets (designer_id, balance, total_earnings, total_withdrawn, pending_balance)
        VALUES (p_designer_id, 0, 0, 0, 0)
        RETURNING id INTO v_wallet_id;
    END IF;
    
    -- Add earnings to wallet
    UPDATE designer_wallets 
    SET 
        balance = balance + p_amount,
        total_earnings = total_earnings + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Create transaction record
    INSERT INTO wallet_transactions (
        wallet_id, 
        type, 
        amount, 
        status, 
        description, 
        order_id
    ) VALUES (
        v_wallet_id, 
        'sale', 
        p_amount, 
        'completed', 
        p_description, 
        p_order_id
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create stored procedure for processing withdrawals
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_designer_id UUID,
    p_amount DECIMAL(10,2),
    p_stripe_transfer_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
    v_current_balance DECIMAL(10,2);
BEGIN
    -- Get wallet and current balance
    SELECT id, balance INTO v_wallet_id, v_current_balance
    FROM designer_wallets 
    WHERE designer_id = p_designer_id;
    
    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet not found for designer %', p_designer_id;
    END IF;
    
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', v_current_balance, p_amount;
    END IF;
    
    -- Deduct from wallet
    UPDATE designer_wallets 
    SET 
        balance = balance - p_amount,
        total_withdrawn = total_withdrawn + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Update transaction status
    UPDATE wallet_transactions 
    SET 
        status = 'completed',
        stripe_transfer_id = p_stripe_transfer_id,
        updated_at = NOW()
    WHERE wallet_id = v_wallet_id 
        AND type = 'withdrawal' 
        AND amount = -p_amount 
        AND status = 'pending'
        AND stripe_transfer_id IS NULL;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designer_wallets_updated_at 
    BEFORE UPDATE ON designer_wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallet_transactions_updated_at 
    BEFORE UPDATE ON wallet_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Initialize existing designers with default sales total (0)
UPDATE designers 
SET sales_total = 0.00 
WHERE sales_total IS NULL;

-- 17. Create view for designer commission tiers (helpful for analytics)
CREATE OR REPLACE VIEW designer_commission_tiers AS
SELECT 
    d.id,
    d.brand_name,
    d.sales_total,
    get_baguri_fee_percentage(d.sales_total) as current_baguri_fee_percentage,
    get_designer_earnings_percentage(d.sales_total) as current_designer_percentage,
    CASE 
        WHEN d.sales_total < 1000 THEN 'Bronze (50% fee)'
        WHEN d.sales_total < 10000 THEN 'Silver (40% fee)'
        ELSE 'Gold (30% fee)'
    END as tier_name,
    CASE 
        WHEN d.sales_total < 1000 THEN 1000 - d.sales_total
        WHEN d.sales_total < 10000 THEN 10000 - d.sales_total
        ELSE 0
    END as sales_to_next_tier
FROM designers d
WHERE d.status = 'approved';

-- 18. Insert sample data for testing (optional)
-- Uncomment the following lines if you want to add test data

/*
-- Add sample earnings for existing designers with different tiers
INSERT INTO designer_wallets (designer_id, balance, total_earnings, total_withdrawn, pending_balance)
SELECT 
    id as designer_id,
    CASE 
        WHEN sales_total < 1000 THEN 150.00
        WHEN sales_total < 10000 THEN 600.00
        ELSE 1400.00
    END as balance,
    CASE 
        WHEN sales_total < 1000 THEN 300.00
        WHEN sales_total < 10000 THEN 1200.00
        ELSE 2800.00
    END as total_earnings,
    CASE 
        WHEN sales_total < 1000 THEN 150.00
        WHEN sales_total < 10000 THEN 600.00
        ELSE 1400.00
    END as total_withdrawn,
    0.00 as pending_balance
FROM designers 
WHERE status = 'approved'
ON CONFLICT (designer_id) DO NOTHING;

-- Update some designers to different sales tiers for testing
UPDATE designers SET sales_total = 500.00 WHERE id = (SELECT id FROM designers WHERE status = 'approved' LIMIT 1);
UPDATE designers SET sales_total = 5000.00 WHERE id = (SELECT id FROM designers WHERE status = 'approved' OFFSET 1 LIMIT 1);
UPDATE designers SET sales_total = 15000.00 WHERE id = (SELECT id FROM designers WHERE status = 'approved' OFFSET 2 LIMIT 1);
*/

-- 17. Create influencer_addresses table (for saved delivery addresses)
CREATE TABLE IF NOT EXISTS influencer_addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    influencer_open_id TEXT NOT NULL REFERENCES influencers(tiktok_open_id) ON DELETE CASCADE,
    address JSONB NOT NULL,
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Create influencer_item_requests table (for influencers requesting free items from designers)
CREATE TABLE IF NOT EXISTS influencer_item_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    influencer_open_id TEXT NOT NULL REFERENCES influencers(tiktok_open_id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES designer_products(id) ON DELETE CASCADE,
    delivery_address JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_influencer_item_requests_influencer ON influencer_item_requests(influencer_open_id);
CREATE INDEX IF NOT EXISTS idx_influencer_item_requests_designer ON influencer_item_requests(designer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_item_requests_product ON influencer_item_requests(product_id); 