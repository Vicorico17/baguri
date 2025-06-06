import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Commission tier structure - matches the webhook
const COMMISSION_LEVELS = [
  { 
    id: 'bronze',
    name: 'Bronze Designer', 
    platformFeePct: 30, 
    designerEarningsPct: 70, 
    threshold: 0 
  },
  { 
    id: 'silver',
    name: 'Silver Designer', 
    platformFeePct: 25, 
    designerEarningsPct: 75, 
    threshold: 100 
  },
  { 
    id: 'gold',
    name: 'Gold Designer', 
    platformFeePct: 20, 
    designerEarningsPct: 80, 
    threshold: 1000 
  },
  { 
    id: 'platinum',
    name: 'Platinum Designer', 
    platformFeePct: 17, 
    designerEarningsPct: 83, 
    threshold: 10000 
  }
];

function getCommissionTier(salesTotal: number) {
  for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
    if (salesTotal >= COMMISSION_LEVELS[i].threshold) {
      return COMMISSION_LEVELS[i];
    }
  }
  return COMMISSION_LEVELS[0];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Running wallet security and functionality tests...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        success_rate: 0
      }
    };

    // Test 1: Check database schema integrity
    try {
      const { data: wallets, error: walletError } = await supabase
        .from('designer_wallets')
        .select('id, designer_id, balance, total_earnings')
        .limit(1);

      const { data: transactions, error: transError } = await supabase
        .from('wallet_transactions')
        .select('id, wallet_id, type, amount, status')
        .limit(1);

      results.tests.push({
        name: 'Database Schema Integrity',
        status: !walletError && !transError ? 'PASS' : 'FAIL',
        details: {
          wallet_table: !walletError ? 'OK' : walletError.message,
          transaction_table: !transError ? 'OK' : transError.message
        }
      });
      
      if (!walletError && !transError) results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.tests.push({
        name: 'Database Schema Integrity',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 2: Check stored procedures exist
    try {
      const { data, error } = await supabase.rpc('add_designer_earnings', {
        p_designer_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_amount: 0,
        p_order_id: 'test',
        p_description: 'test'
      });

      results.tests.push({
        name: 'Stored Procedures Available',
        status: error?.code === 'PGRST116' || !error ? 'PASS' : 'FAIL',
        details: {
          add_designer_earnings: error?.code === 'PGRST116' || !error ? 'Available' : 'Missing',
          error: error?.message || 'None'
        }
      });
      
      if (error?.code === 'PGRST116' || !error) results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.tests.push({
        name: 'Stored Procedures Available',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 3: Commission calculation accuracy
    try {
      const testCases = [
        { salesTotal: 0, expectedTier: 'Bronze Designer', expectedPercent: 70 },
        { salesTotal: 100, expectedTier: 'Silver Designer', expectedPercent: 75 },
        { salesTotal: 1000, expectedTier: 'Gold Designer', expectedPercent: 80 },
        { salesTotal: 10000, expectedTier: 'Platinum Designer', expectedPercent: 83 }
      ];

      let allCorrect = true;
      const testResults: any[] = [];

      for (const testCase of testCases) {
        const tier = getCommissionTier(testCase.salesTotal);
        const correct = tier.name === testCase.expectedTier && tier.designerEarningsPct === testCase.expectedPercent;
        allCorrect = allCorrect && correct;
        
        testResults.push({
          salesTotal: testCase.salesTotal,
          expected: `${testCase.expectedTier} (${testCase.expectedPercent}%)`,
          actual: `${tier.name} (${tier.designerEarningsPct}%)`,
          correct
        });
      }

      results.tests.push({
        name: 'Commission Calculation Accuracy',
        status: allCorrect ? 'PASS' : 'FAIL',
        details: testResults
      });
      
      if (allCorrect) results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.tests.push({
        name: 'Commission Calculation Accuracy',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 4: Check wallet balances consistency
    try {
      const { data: inconsistentWallets, error } = await supabase
        .from('designer_wallets')
        .select(`
          id,
          designer_id,
          balance,
          total_earnings,
          total_withdrawn
        `)
        .limit(100);

      if (error) throw error;

      const inconsistencies: any[] = [];
      
      for (const wallet of inconsistentWallets || []) {
        // Check if balance + withdrawn = total_earnings
        const expectedBalance = parseFloat(wallet.total_earnings) - parseFloat(wallet.total_withdrawn);
        const actualBalance = parseFloat(wallet.balance);
        const difference = Math.abs(expectedBalance - actualBalance);
        
        if (difference > 0.01) { // Allow 1 cent tolerance for rounding
          inconsistencies.push({
            wallet_id: wallet.id,
            designer_id: wallet.designer_id,
            expected_balance: expectedBalance,
            actual_balance: actualBalance,
            difference: difference
          });
        }
      }

      results.tests.push({
        name: 'Wallet Balance Consistency',
        status: inconsistencies.length === 0 ? 'PASS' : 'WARN',
        details: {
          wallets_checked: inconsistentWallets?.length || 0,
          inconsistencies_found: inconsistencies.length,
          inconsistencies: inconsistencies.slice(0, 5) // Show first 5
        }
      });
      
      if (inconsistencies.length === 0) results.summary.passed++;
      else results.summary.warnings++;
    } catch (error) {
      results.tests.push({
        name: 'Wallet Balance Consistency',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 5: Check for duplicate transactions (simplified approach)
    try {
      const { data: allTransactions, error } = await supabase
        .from('wallet_transactions')
        .select('order_id, type, status')
        .eq('type', 'sale')
        .eq('status', 'completed')
        .not('order_id', 'is', null);

      if (error) throw error;

      // Count duplicates manually
      const orderCounts = new Map<string, number>();
      allTransactions?.forEach(transaction => {
        const key = transaction.order_id;
        orderCounts.set(key, (orderCounts.get(key) || 0) + 1);
      });

      const duplicates = Array.from(orderCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([order_id, count]) => ({ order_id, count }));

      results.tests.push({
        name: 'Duplicate Transaction Detection',
        status: duplicates.length === 0 ? 'PASS' : 'WARN',
        details: {
          duplicate_groups_found: duplicates.length,
          duplicates: duplicates.slice(0, 5)
        }
      });
      
      if (duplicates.length === 0) results.summary.passed++;
      else results.summary.warnings++;
    } catch (error) {
      results.tests.push({
        name: 'Duplicate Transaction Detection',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 6: Wallet security permissions
    try {
      // Try to access wallet data (should work)
      const { data: walletAccess, error: walletError } = await supabase
        .from('designer_wallets')
        .select('count()')
        .single();

      // Try to access wallet transactions (should work)
      const { data: transactionAccess, error: transactionError } = await supabase
        .from('wallet_transactions')
        .select('count()')
        .single();

      results.tests.push({
        name: 'Database Access Permissions',
        status: !walletError && !transactionError ? 'PASS' : 'FAIL',
        details: {
          wallet_access: !walletError ? 'OK' : walletError.message,
          transaction_access: !transactionError ? 'OK' : transactionError.message
        }
      });
      
      if (!walletError && !transactionError) results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.tests.push({
        name: 'Database Access Permissions',
        status: 'FAIL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }
    results.summary.total++;

    // Final summary
    results.summary.success_rate = Math.round((results.summary.passed / results.summary.total) * 100);
    
    const overallStatus = results.summary.failed === 0 ? 
      (results.summary.warnings === 0 ? 'ALL_PASS' : 'PASS_WITH_WARNINGS') : 
      'FAILED';

    console.log(`🧪 Test Summary: ${results.summary.passed}/${results.summary.total} passed, ${results.summary.warnings} warnings, ${results.summary.failed} failed`);
    
    return NextResponse.json({
      status: overallStatus,
      message: `Wallet security tests completed. ${results.summary.passed}/${results.summary.total} tests passed.`,
      ...results
    });

  } catch (error) {
    console.error('Error running wallet security tests:', error);
    return NextResponse.json(
      { 
        error: 'Failed to run security tests',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// POST endpoint for simulating a secure wallet funding test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { designer_id, amount, test_mode = true } = body;

    if (!designer_id || !amount) {
      return NextResponse.json({
        error: 'designer_id and amount are required'
      }, { status: 400 });
    }

    if (!test_mode) {
      return NextResponse.json({
        error: 'Only test mode is allowed for security'
      }, { status: 403 });
    }

    console.log(`🧪 Simulating secure wallet funding: ${amount} RON for designer ${designer_id}`);
    
    // Simulate the same security checks as the webhook
    const mockOrderId = `test-order-${Date.now()}`;
    
    // Check if designer exists
    const { data: designer, error: designerError } = await supabase
      .from('designers')
      .select('id, sales_total, status')
      .eq('id', designer_id)
      .single();

    if (designerError) {
      return NextResponse.json({
        error: 'Designer not found',
        details: designerError.message
      }, { status: 404 });
    }

    if (designer.status !== 'approved') {
      return NextResponse.json({
        error: 'Designer not approved for earnings'
      }, { status: 403 });
    }

    // Calculate commission based on current tier
    const currentTier = getCommissionTier(designer.sales_total || 0);
    const designerEarnings = amount * (currentTier.designerEarningsPct / 100);
    const platformFee = amount * (currentTier.platformFeePct / 100);

    // Test wallet funding (simulation only)
    const result = {
      test_mode: true,
      designer_id,
      original_amount: amount,
      designer_earnings: designerEarnings,
      platform_fee: platformFee,
      commission_tier: currentTier.name,
      commission_percentage: currentTier.designerEarningsPct,
      mock_order_id: mockOrderId,
      security_checks: {
        designer_exists: true,
        designer_approved: true,
        amount_valid: amount > 0,
        calculations_correct: Math.abs(designerEarnings + platformFee - amount) < 0.01
      },
      message: 'Wallet funding simulation completed successfully (no actual funds transferred)'
    };

    console.log('✅ Wallet funding simulation successful:', result);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in wallet funding simulation:', error);
    return NextResponse.json(
      { 
        error: 'Simulation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 