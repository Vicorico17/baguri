# 🎮 Gamified Commission System - Baguri Platform

## Overview

Baguri implements a **gamified commission structure** where designers earn higher commission rates as they achieve greater sales milestones. This system incentivizes designers to sell more by reducing Baguri's platform fee as they progress through different tiers.

## 🏆 Commission Tiers

### 🥉 Bronze Tier (Default)
- **Sales Range**: 0 - 999.99 RON
- **Designer Commission**: 50%
- **Baguri Platform Fee**: 50%
- **Status**: Starting tier for all new designers

### 🥈 Silver Tier
- **Sales Range**: 1,000 - 9,999.99 RON
- **Designer Commission**: 60%
- **Baguri Platform Fee**: 40%
- **Upgrade Requirement**: Reach 1,000 RON in total sales

### 🥇 Gold Tier
- **Sales Range**: 10,000+ RON
- **Designer Commission**: 70%
- **Baguri Platform Fee**: 30%
- **Upgrade Requirement**: Reach 10,000 RON in total sales

## 🗄️ Database Schema

### Core Tables

#### `designers` Table (Updated)
```sql
-- Added sales_total column to track lifetime sales
ALTER TABLE designers 
ADD COLUMN sales_total DECIMAL(10,2) DEFAULT 0.00 NOT NULL;
```

#### `orders` Table
```sql
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT,
    customer_email TEXT,
    customer_name TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'ron',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `order_items` Table
```sql
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    designer_id UUID NOT NULL REFERENCES designers(id),
    product_id UUID REFERENCES designer_products(id),
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    designer_earnings DECIMAL(10,2) NOT NULL,
    baguri_earnings DECIMAL(10,2) NOT NULL,
    commission_tier VARCHAR(20),
    commission_percentage DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `designer_wallets` Table
```sql
CREATE TABLE designer_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    designer_id UUID NOT NULL REFERENCES designers(id) UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    total_earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    total_withdrawn DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    pending_balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `wallet_transactions` Table
```sql
CREATE TABLE wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES designer_wallets(id),
    designer_id UUID NOT NULL REFERENCES designers(id),
    type TEXT NOT NULL CHECK (type IN ('sale', 'withdrawal', 'refund', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    description TEXT NOT NULL,
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    stripe_transfer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions

#### Commission Calculation Functions
```sql
-- Calculate Baguri fee percentage based on sales total
CREATE OR REPLACE FUNCTION get_baguri_fee_percentage(p_sales_total DECIMAL(10,2))
RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF p_sales_total < 1000 THEN
        RETURN 50.00;
    ELSIF p_sales_total < 10000 THEN
        RETURN 40.00;
    ELSE
        RETURN 30.00;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate designer earnings percentage
CREATE OR REPLACE FUNCTION get_designer_earnings_percentage(p_sales_total DECIMAL(10,2))
RETURNS DECIMAL(5,2) AS $$
BEGIN
    RETURN 100.00 - get_baguri_fee_percentage(p_sales_total);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

#### Order Processing Function
```sql
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
        wallet_id, designer_id, order_id, type, amount, description, status
    ) VALUES (
        (SELECT id FROM designer_wallets WHERE designer_id = p_designer_id),
        p_designer_id, p_order_id, 'sale', p_earnings_amount,
        'Commission from product sale', 'completed'
    );
END;
$$ LANGUAGE plpgsql;
```

### Analytics View
```sql
CREATE OR REPLACE VIEW designer_commission_tiers AS
SELECT 
    d.id,
    d.brand_name,
    d.sales_total,
    get_baguri_fee_percentage(d.sales_total) as current_baguri_fee_percentage,
    get_designer_earnings_percentage(d.sales_total) as current_designer_percentage,
    CASE 
        WHEN d.sales_total < 1000 THEN 'Bronze'
        WHEN d.sales_total < 10000 THEN 'Silver'
        ELSE 'Gold'
    END as tier_name,
    CASE 
        WHEN d.sales_total < 1000 THEN 1000 - d.sales_total
        WHEN d.sales_total < 10000 THEN 10000 - d.sales_total
        ELSE 0
    END as sales_to_next_tier
FROM designers d
WHERE d.status = 'approved';
```

## 🔄 Workflow

### 1. Order Processing
1. Customer completes purchase via Stripe
2. Stripe webhook triggers `/api/webhooks/stripe`
3. System calculates designer's current tier based on `sales_total`
4. Earnings calculated: `earnings = price × quantity × (tier_percentage / 100)`
5. Designer's `sales_total` and wallet `balance` updated
6. Transaction recorded in `wallet_transactions`

### 2. Tier Progression
- **Automatic**: Tiers update automatically based on cumulative sales
- **Real-time**: Commission rates apply immediately to new sales
- **Transparent**: Designers see current tier and progress in dashboard

### 3. Wallet Management
- **Balance Tracking**: Real-time balance updates
- **Transaction History**: Complete audit trail
- **Withdrawal System**: Minimum 50 RON withdrawal limit
- **Bank Transfers**: Stripe Connect integration

## 🎨 Frontend Implementation

### Designer Dashboard Features
- **Tier Badge**: Visual indicator of current tier (Bronze/Silver/Gold)
- **Progress Bar**: Shows progress to next tier
- **Commission Rate**: Clear display of current earnings percentage
- **Sales Summary**: Total sales, earnings, and tier information
- **Wallet Section**: Balance, withdrawal options, transaction history

### Designer Profile Pages
- **Tier Display**: Public tier badges on designer cards
- **Commission Transparency**: Shows designer's current commission rate
- **Performance Indicators**: Visual tier progression elements

## 🚀 Deployment Instructions

### 1. Database Migrations
Run the following migrations in your Supabase SQL editor:

```sql
-- Apply all migrations from database_migrations.sql
-- (Already applied via Supabase MCP)
```

### 2. Environment Variables
Ensure these are set in your `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Stripe Webhook Configuration
Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

Events to listen for:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 4. Testing the System

#### Test Commission Calculations
```sql
-- Test tier functions
SELECT 
    500 as sales_amount,
    get_baguri_fee_percentage(500) as baguri_fee,
    get_designer_earnings_percentage(500) as designer_earnings;
    
SELECT 
    5000 as sales_amount,
    get_baguri_fee_percentage(5000) as baguri_fee,
    get_designer_earnings_percentage(5000) as designer_earnings;
    
SELECT 
    15000 as sales_amount,
    get_baguri_fee_percentage(15000) as baguri_fee,
    get_designer_earnings_percentage(15000) as designer_earnings;
```

#### View Designer Tiers
```sql
SELECT * FROM designer_commission_tiers;
```

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **Tier Distribution**: How many designers in each tier
- **Tier Progression**: Rate of tier upgrades
- **Revenue Impact**: Platform fee revenue by tier
- **Designer Retention**: Correlation between tiers and activity

### Sample Analytics Queries
```sql
-- Tier distribution
SELECT 
    tier_name,
    COUNT(*) as designer_count,
    AVG(sales_total) as avg_sales
FROM designer_commission_tiers 
GROUP BY tier_name;

-- Revenue by tier
SELECT 
    oi.commission_tier,
    COUNT(*) as order_count,
    SUM(oi.total_price) as total_sales,
    SUM(oi.baguri_earnings) as baguri_revenue,
    SUM(oi.designer_earnings) as designer_payouts
FROM order_items oi
GROUP BY oi.commission_tier;
```

## 🔮 Future Enhancements

### Planned Features
1. **Seasonal Bonuses**: Special tier bonuses during peak seasons
2. **Referral Rewards**: Additional tier benefits for referring new designers
3. **Tier Badges**: Visual achievements and social recognition
4. **Performance Analytics**: Detailed tier progression insights
5. **Custom Tier Goals**: Personalized milestones for each designer

### Advanced Gamification
- **Achievement System**: Unlock special features at each tier
- **Leaderboards**: Monthly top performers by tier
- **Tier Celebrations**: Email notifications for tier upgrades
- **Exclusive Benefits**: Early access to new features for higher tiers

## 🛡️ Security Considerations

- **Webhook Verification**: Stripe signature validation
- **Database Security**: Row Level Security (RLS) policies
- **Transaction Integrity**: Atomic operations for financial data
- **Audit Trail**: Complete transaction logging
- **Access Control**: Role-based permissions for admin functions

## 📞 Support

For technical issues or questions about the gamified commission system:
1. Check the database logs for transaction errors
2. Verify Stripe webhook delivery in Stripe Dashboard
3. Monitor Supabase logs for database issues
4. Review email delivery status in Resend dashboard

---

**Status**: ✅ Fully Implemented and Deployed
**Last Updated**: January 2025
**Version**: 1.0.0 