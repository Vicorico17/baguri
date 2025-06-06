# 🧪 **Wallet Balance Flow Testing Guide**

This guide helps you test the complete money flow from product purchase to designer wallet balance.

## **🎯 What We're Testing**

1. **Product Purchase** → Money correctly distributed
2. **Commission Calculation** → Proper tier-based percentages  
3. **Designer Wallet** → Balance increases automatically
4. **Transaction Recording** → All records created properly
5. **Sales Tracking** → Total sales updated for tier progression

---

## **📋 Pre-Testing Checklist**

### **1. Required Setup**
- ✅ Development server running (`npm run dev`)
- ✅ Approved designer account with live products
- ✅ Stripe webhook configured and working
- ✅ Test payment environment enabled

### **2. Get Test Data**
Visit: `http://localhost:3000/api/test-wallet-flow`

This will show you:
- Approved designers and their current wallet balances
- Live products available for testing
- Recent orders and transactions
- Commission tier structure

---

## **🚀 Testing Methods**

### **Method 1: Real Stripe Test Purchase**

#### **Step 1: Choose a Test Product**
From the API response, find a product with:
- `hasStripeIntegration: true`  
- `stripeProductId` and `stripePriceId` present

#### **Step 2: Record Starting State**
Note the designer's:
- Current wallet `balance`
- Current `salesTotal`
- Current `commissionTier`

#### **Step 3: Make Test Purchase**
1. Go to the product on the shop or designer page
2. Add to cart and proceed to checkout
3. Use Stripe test card: `4242424242424242`
4. Expiry: `12/34`, CVC: `123`
5. Complete the purchase

#### **Step 4: Verify Results**
Check these logs and data:
- **Webhook logs**: Look for processing confirmation
- **Designer wallet**: Balance should increase by commission amount
- **Sales total**: Should increase by full purchase amount
- **Transaction record**: New "sale" transaction created

---

### **Method 2: Simulated Sale (For Quick Testing)**

Use the simulation API for instant testing without Stripe:

```bash
# Simulate a 100 RON sale for a specific designer
curl -X POST http://localhost:3000/api/test-wallet-flow \
  -H "Content-Type: application/json" \
  -d '{
    "action": "simulate_sale",
    "designerId": "DESIGNER_ID_HERE",
    "amount": 100
  }'
```

This will:
- Calculate proper commission based on designer's tier
- Update wallet balance immediately  
- Create order and transaction records
- Update sales total for tier progression

---

## **💰 Commission Structure**

| Tier | Sales Threshold | Platform Fee | Designer Earnings |
|------|----------------|-------------|------------------|
| **Bronze** | 0+ RON | 30% | **70%** |
| **Silver** | 100+ RON | 25% | **75%** |
| **Gold** | 1,000+ RON | 20% | **80%** |  
| **Platinum** | 10,000+ RON | 17% | **83%** |

### **Example Calculations**
- **100 RON sale (Bronze tier)**: Designer gets 70 RON, Platform gets 30 RON
- **100 RON sale (Silver tier)**: Designer gets 75 RON, Platform gets 25 RON

---

## **🔍 Verification Points**

### **Database Records to Check**

#### **1. Designer Wallet (`designer_wallets`)**
```sql
SELECT * FROM designer_wallets WHERE designer_id = 'DESIGNER_ID';
```
- `balance` should increase by commission amount
- `total_earnings` should increase by commission amount
- `updated_at` should be recent

#### **2. Wallet Transactions (`wallet_transactions`)**
```sql
SELECT * FROM wallet_transactions 
WHERE wallet_id = 'WALLET_ID' 
ORDER BY created_at DESC;
```
- New record with `type = 'sale'`
- `amount` = commission earned
- `status = 'completed'`
- `description` mentions the order

#### **3. Orders (`orders` + `order_items`)**
```sql
SELECT o.*, oi.* FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.stripe_session_id = 'SESSION_ID';
```
- Order record with customer details
- Order item with commission breakdown
- `designer_earnings` + `platform_fee` = `total_price`

#### **4. Designer Sales Total (`designers`)**
```sql
SELECT sales_total FROM designers WHERE id = 'DESIGNER_ID';
```
- Should increase by full purchase amount
- Used for commission tier calculation

---

## **⚠️ Troubleshooting**

### **Common Issues**

#### **❌ Webhook Not Processing**
- Check Stripe webhook configuration
- Verify `STRIPE_WEBHOOK_SECRET` environment variable
- Look for webhook logs in terminal

#### **❌ Missing Product Metadata**
Products created before metadata fix won't have `designer_id`:
```javascript
// Check if product has required metadata
console.log(stripeProduct.metadata.designer_id);
console.log(stripeProduct.metadata.product_id);
```

#### **❌ Wallet Balance Not Updating**
- Check webhook processing logs
- Verify Supabase connection
- Check for database constraint errors

#### **❌ Wrong Commission Calculation**
- Verify current `sales_total` in database
- Check commission tier logic matches commission-levels page
- Ensure tier calculation happens before earnings addition

---

## **✅ Success Criteria**

A successful test should show:

1. **✅ Purchase Completed**
   - Stripe checkout successful
   - No payment errors

2. **✅ Webhook Processed**  
   - Console logs show processing
   - No webhook errors

3. **✅ Money Flow Correct**
   - Designer balance increased by exact commission amount
   - Platform fee + designer earnings = total price
   - Correct tier used for calculation

4. **✅ Records Created**
   - Order record exists
   - Order item with commission breakdown
   - Wallet transaction recorded
   - Sales total updated

5. **✅ Tier Progression**
   - If sales cross threshold, next tier applies to future sales
   - Commission percentage updates correctly

---

## **🎮 Test Scenarios**

### **Scenario 1: First Sale (Bronze → Silver)**
- Designer at 0 RON total sales
- Make 150 RON purchase
- Verify: 70% commission (Bronze tier)
- Next sale should use Silver tier (75%)

### **Scenario 2: Tier Crossing (Silver → Gold)**  
- Designer at 950 RON total sales
- Make 100 RON purchase  
- Verify: 75% commission (Silver tier)
- Sales total becomes 1,050 RON (Gold tier)

### **Scenario 3: Multiple Products**
- Add multiple products to cart
- Each product should create separate order item
- Each gets commission based on designer's current tier

### **Scenario 4: Different Designers**
- Purchase from multiple designers
- Each gets their appropriate tier commission
- No cross-contamination of earnings

---

## **📊 Monitoring Dashboard**

Use the test API endpoint to monitor:
```bash
# Get current state
curl http://localhost:3000/api/test-wallet-flow

# Simulate sales for testing
curl -X POST http://localhost:3000/api/test-wallet-flow \
  -H "Content-Type: application/json" \
  -d '{
    "action": "simulate_sale", 
    "designerId": "ID",
    "amount": 250
  }'
```

---

## **🎯 Ready to Test!**

1. **Start**: Visit the test API endpoint to get current state
2. **Choose**: Pick a method (real purchase or simulation)  
3. **Execute**: Make the purchase or run simulation
4. **Verify**: Check all the verification points
5. **Celebrate**: Money flow is working! 🎉

The wallet balance system is now ready for production with proper commission distribution, tier progression, and complete transaction tracking. 