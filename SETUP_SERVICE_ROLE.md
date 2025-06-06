# Fix Sales Total Update Issue - Service Role Setup

## Problem Identified
The sales total updates are failing because the webhook is using an **anonymous Supabase client** instead of the **service role client**. 

- ✅ **Wallet updates work** because they use a stored procedure with `SECURITY DEFINER`
- ❌ **Sales total updates fail** because they're blocked by Row Level Security (RLS) policies

## Root Cause
```
"clientType": "Anonymous"
"serviceRoleKeyExists": false
"upsertError": "new row violates row-level security policy for table \"designers\""
```

## Solution: Add Service Role Key

### Step 1: Get Service Role Key
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/mwbocfhdbxmfbxlrmqim
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)

### Step 2: Create Environment File
Create a `.env.local` file in your project root:

```bash
# Add this to .env.local
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY_HERE
```

### Step 3: Restart Development Server
```bash
npm run dev
# or
yarn dev
```

### Step 4: Test the Fix
After adding the service role key, test:
```bash
curl http://localhost:3000/api/debug-simple-test
```

You should see:
- `"clientType": "Service Role (Admin)"`
- `"serviceRoleKeyExists": true`
- Sales total updates should work ✅

## Why This Fixes It
The service role key bypasses Row Level Security (RLS) policies, allowing the webhook to update the `designers` table just like it can update the `designer_wallets` table.

## Current Status
- Wallet balance updates: ✅ Working (uses stored procedure)
- Sales total updates: ❌ Blocked by RLS (needs service role)

Once the service role key is added, both will work identically. 