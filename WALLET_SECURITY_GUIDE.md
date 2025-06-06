# 🔐 **Wallet Security & Funding System**

This document outlines the secure, automated wallet funding system that credits designer earnings when purchases are completed.

---

## **🎯 System Overview**

When a customer purchases a product, the system automatically:

1. **Validates the payment** via Stripe webhook signature verification
2. **Calculates commission** based on designer's current tier (Bronze/Silver/Gold/Platinum)
3. **Credits designer wallet** with their earnings portion
4. **Records transaction** with full audit trail
5. **Updates sales totals** for tier progression tracking

---

## **🛡️ Security Features**

### **Webhook Security**
- ✅ **Stripe signature verification** - Only authentic Stripe events are processed
- ✅ **Idempotency protection** - Prevents duplicate processing of same order
- ✅ **Amount validation** - Verifies calculated totals match Stripe amounts
- ✅ **Error logging** - Critical errors logged for manual review

### **Database Security**
- ✅ **Atomic transactions** - Uses PostgreSQL stored procedures for consistency
- ✅ **Decimal precision** - Proper financial calculations (no floating point errors)
- ✅ **Audit trail** - Every wallet change is logged with metadata
- ✅ **Balance verification** - Automatic consistency checks

### **Access Control**
- ✅ **Designer approval required** - Only approved designers can earn
- ✅ **Product validation** - Only products with proper metadata are processed
- ✅ **Commission tier validation** - Earnings calculated based on verified sales history

---

## **💰 Commission Structure**

| Tier | Sales Threshold | Designer Keeps | Baguri Fee |
|------|----------------|---------------|------------|
| 🥉 **Bronze** | RON 0+ | **70%** | 30% |
| 🥈 **Silver** | RON 100+ | **75%** | 25% |
| 🥇 **Gold** | RON 1,000+ | **80%** | 20% |
| 💎 **Platinum** | RON 10,000+ | **83%** | 17% |

---

## **🔄 Payment Flow**

```
Customer Purchase
       ↓
Stripe Checkout Session
       ↓
Payment Confirmed
       ↓
Webhook Triggered (Secure)
       ↓
Order Created in Database
       ↓
For each product:
  - Get designer info
  - Calculate commission tier
  - Compute earnings
  - Credit designer wallet
  - Log transaction
       ↓
Designer can withdraw funds
```

---

## **📊 Testing & Monitoring**

### **Security Test Endpoint**
Run comprehensive security tests:
```bash
GET /api/test-wallet-security
```

Tests include:
- Database schema integrity
- Stored procedure availability  
- Commission calculation accuracy
- Wallet balance consistency
- Duplicate transaction detection
- Access permissions

### **Simulation Endpoint**
Test wallet funding without real money:
```bash
POST /api/test-wallet-security
{
  "designer_id": "uuid-here",
  "amount": 100,
  "test_mode": true
}
```

---

## **🚨 Error Handling**

### **Automatic Recovery**
- **Stored procedure failure** → Falls back to manual wallet update
- **Wallet creation error** → Creates wallet then processes earnings
- **Transaction logging failure** → Logs critical error for manual review

### **Monitoring**
- All wallet operations are logged with detailed metadata
- Failed operations trigger error logging for admin review
- Balance inconsistencies are detected and reported

---

## **📋 Database Schema**

### **Designer Wallets**
```sql
designer_wallets:
  - id (UUID, Primary Key)
  - designer_id (UUID, Foreign Key)
  - balance (DECIMAL) - Available for withdrawal
  - total_earnings (DECIMAL) - Lifetime earnings
  - total_withdrawn (DECIMAL) - Total withdrawn
  - pending_balance (DECIMAL) - Withdrawal requests in progress
```

### **Wallet Transactions**
```sql
wallet_transactions:
  - id (UUID, Primary Key)
  - wallet_id (UUID, Foreign Key)
  - type ('sale' | 'withdrawal' | 'refund' | 'adjustment')
  - amount (DECIMAL)
  - status ('pending' | 'completed' | 'failed')
  - description (TEXT)
  - order_id (TEXT) - Links to purchase order
  - metadata (JSONB) - Additional context
```

---

## **🎮 Live Testing**

### **Test with Real Stripe Checkout**
1. Find a test product with Stripe integration
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout process
4. Check designer wallet for automatic credit
5. Verify transaction appears in wallet history

### **Monitor Webhook Processing**
- Check server logs for `💰 Processing earnings for designer...`
- Verify `✅ Successfully added X RON to designer Y wallet`
- Confirm transaction verification logs

---

## **🔧 Configuration**

### **Required Environment Variables**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### **Stripe Webhook Events**
Configure Stripe to send these events to `/api/webhooks/stripe`:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## **✅ System Status**

The wallet funding system is **FULLY OPERATIONAL** and includes:

- ✅ Secure Stripe webhook processing
- ✅ Automatic wallet funding on purchase
- ✅ Tiered commission calculation
- ✅ Duplicate payment prevention
- ✅ Comprehensive error handling
- ✅ Full audit trail
- ✅ Withdrawal functionality
- ✅ Security testing suite

**Result**: Designers automatically receive funds in their wallets when customers purchase their products, with full security and audit capabilities. 