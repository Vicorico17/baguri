"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Wallet, 
  TrendingUp, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  Info,
  Star,
  Trophy,
  Crown,
  Target,
  Zap,
  CreditCard
} from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { designerService, type DesignerWallet, type WalletTransaction } from '@/lib/designerService';

// Commission levels structure - matches commission-levels page
const COMMISSION_LEVELS = [
  { 
    id: 'bronze',
    name: 'Bronze Designer', 
    icon: Target,
    commission: 30, 
    earnings: 70,
    threshold: 0,
    color: 'text-orange-400',
    nextAt: 100
  },
  { 
    id: 'silver',
    name: 'Silver Designer', 
    icon: Star,
    commission: 25, 
    earnings: 75,
    threshold: 100,
    color: 'text-gray-400',
    nextAt: 1000
  },
  { 
    id: 'gold',
    name: 'Gold Designer', 
    icon: Trophy,
    commission: 20, 
    earnings: 80,
    threshold: 1000,
    color: 'text-yellow-400',
    nextAt: 10000
  },
  { 
    id: 'platinum',
    name: 'Platinum Designer', 
    icon: Crown,
    commission: 17, 
    earnings: 83,
    threshold: 10000,
    color: 'text-purple-400',
    nextAt: null
  }
];

function getCurrentLevel(salesTotal: number) {
  for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
    if (salesTotal >= COMMISSION_LEVELS[i].threshold) {
      return COMMISSION_LEVELS[i];
    }
  }
  return COMMISSION_LEVELS[0];
}

function WalletManagement() {
  const [wallet, setWallet] = useState<DesignerWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'withdrawal' | 'refund'>('all');
  const [salesTotal, setSalesTotal] = useState(0);
  const [iban, setIban] = useState('');
  const [isEditingIban, setIsEditingIban] = useState(false);
  const [isUpdatingIban, setIsUpdatingIban] = useState(false);
  const router = useRouter();
  
  const { loading, user, initialized } = useDesignerAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.replace('/designer-auth');
      return;
    }
  }, [initialized, user, router]);

  // Load wallet data
  useEffect(() => {
    if (!user?.id) return;

    const loadWalletData = async () => {
      try {
        setIsLoading(true);
        
        // Get dashboard data to access wallet
        const dashboardData = await designerService.getDashboardData(user.id);
        if (dashboardData?.wallet) {
          setWallet(dashboardData.wallet);
          setSalesTotal(dashboardData.salesTotal || 0);
          
          // Get designer profile to get designer ID and IBAN
          const designerProfile = await designerService.getDesignerByUserId(user.id);
          if (designerProfile) {
            setIban(designerProfile.iban || '');
            const walletTransactions = await designerService.getWalletTransactions(designerProfile.id);
            setTransactions(walletTransactions);
          }
        }
      } catch (error) {
        console.error('Error loading wallet data:', error);
        setError('Failed to load wallet data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWalletData();
  }, [user?.id]);

  const handleUpdateIban = async () => {
    if (!user?.id) return;
    
    try {
      setIsUpdatingIban(true);
      
      // Update IBAN through the designer service
      const response = await fetch('/api/designer/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iban: iban.trim()
        }),
      });

      if (response.ok) {
        setIsEditingIban(false);
        alert('IBAN updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error updating IBAN: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating IBAN:', error);
      alert('Failed to update IBAN');
    } finally {
      setIsUpdatingIban(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!user?.id || !wallet) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      alert('Minimum withdrawal amount is 50 RON');
      return;
    }

    if (amount > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    if (!iban || iban.trim() === '') {
      alert('Please add your IBAN before requesting a withdrawal');
      return;
    }

    try {
      setWithdrawing(true);
      
      // Call withdrawal API
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          bankDetails: {
            iban: iban.trim(),
            method: 'bank_transfer'
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Withdrawal request submitted successfully! We will process it within 2-3 business days.');
        setShowWithdrawalModal(false);
        setWithdrawalAmount('');
        
        // Reload wallet data
        const dashboardData = await designerService.getDashboardData(user.id);
        if (dashboardData?.wallet) {
          setWallet(dashboardData.wallet);
        }
        
        const designerProfile = await designerService.getDesignerByUserId(user.id);
        if (designerProfile) {
          const walletTransactions = await designerService.getWalletTransactions(designerProfile.id);
          setTransactions(walletTransactions);
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      alert('Failed to request withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock size={16} className="text-amber-400" />;
    if (status === 'failed') return <XCircle size={16} className="text-red-400" />;
    
    switch (type) {
      case 'sale':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'withdrawal':
        return <Download size={16} className="text-blue-400" />;
      case 'refund':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <DollarSign size={16} className="text-zinc-400" />;
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'pending') return 'text-amber-400';
    if (status === 'failed') return 'text-red-400';
    
    switch (type) {
      case 'sale':
        return 'text-green-400';
      case 'withdrawal':
        return 'text-blue-400';
      case 'refund':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const currentLevel = getCurrentLevel(salesTotal);
  const progressToNext = currentLevel.nextAt ? Math.min((salesTotal / currentLevel.nextAt) * 100, 100) : 100;

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/designer-dashboard"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <Wallet size={24} />
                  <h1 className="text-xl font-bold">Wallet</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Wallet Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Available Balance</h2>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-zinc-400 hover:text-white transition"
                    >
                      {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      {balanceVisible ? `${wallet?.balance?.toFixed(2) || '0.00'} RON` : '••••••'}
                    </div>
                    {wallet?.pendingBalance && wallet.pendingBalance > 0 && (
                      <div className="text-sm text-amber-400">
                        {wallet.pendingBalance.toFixed(2)} RON pending withdrawal
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-zinc-400 mb-1">Total Earnings</div>
                      <div className="text-xl font-bold text-white">
                        {balanceVisible ? `${wallet?.totalEarnings?.toFixed(2) || '0.00'} RON` : '••••••'}
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-zinc-400 mb-1">Total Withdrawn</div>
                      <div className="text-xl font-bold text-white">
                        {balanceVisible ? `${wallet?.totalWithdrawn?.toFixed(2) || '0.00'} RON` : '••••••'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    disabled={!wallet?.balance || wallet.balance < 50}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Withdraw Funds
                  </button>
                  
                  {(!wallet?.balance || wallet.balance < 50) && (
                    <p className="text-sm text-zinc-400 text-center mt-2">
                      Minimum withdrawal amount is 50 RON
                    </p>
                  )}
                </div>

                {/* Commission Level Card */}
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <currentLevel.icon className={`${currentLevel.color}`} size={24} />
                    <h2 className="text-xl font-semibold">{currentLevel.name}</h2>
                    <Link 
                      href="/commission-levels"
                      className="ml-auto text-purple-400 hover:text-purple-300 transition"
                    >
                      <Info size={20} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-zinc-400 mb-1">You Keep</div>
                      <div className="text-2xl font-bold text-green-400">{currentLevel.earnings}%</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-zinc-400 mb-1">Platform Fee</div>
                      <div className="text-2xl font-bold text-red-400">{currentLevel.commission}%</div>
                    </div>
                  </div>

                  {currentLevel.nextAt && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-zinc-400">
                          {salesTotal} RON / {currentLevel.nextAt} RON to next level
                        </span>
                        <span className="text-sm text-zinc-400">
                          {Math.round(progressToNext)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressToNext}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Link
                    href="/commission-levels"
                    className="block w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition text-center"
                  >
                    View All Levels
                  </Link>
                </div>

                {/* Transactions */}
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Transaction History</h2>
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-zinc-400" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1 text-sm"
                      >
                        <option value="all">All</option>
                        <option value="sale">Sales</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="refund">Refunds</option>
                      </select>
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">
                      <DollarSign size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                        >
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type, transaction.status)}
                            <div>
                              <div className="font-medium capitalize">
                                {transaction.type === 'sale' ? 'Commission Earned' : transaction.type}
                              </div>
                              <div className="text-sm text-zinc-400">
                                {transaction.description}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${getTransactionColor(transaction.type, transaction.status)}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} RON
                            </div>
                            <div className="text-xs text-zinc-500 capitalize">
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700">
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Total Sales</span>
                      <span className="font-bold">{salesTotal.toFixed(2)} RON</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Commission Rate</span>
                      <span className="font-bold text-green-400">{currentLevel.earnings}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Sales This Month</span>
                      <span className="font-bold">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Avg. Order Value</span>
                      <span className="font-bold">-</span>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={20} className="text-blue-400" />
                    <h3 className="text-lg font-semibold">Need Help?</h3>
                  </div>
                                     <p className="text-sm text-zinc-400 mb-4">
                     Have questions about withdrawals or your earnings? We&apos;re here to help!
                   </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Withdrawal Amount (RON)
              </label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="50.00"
                min="50"
                max={wallet?.balance || 0}
                step="0.01"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-400 focus:border-green-500 focus:outline-none"
              />
              <div className="text-xs text-zinc-400 mt-1">
                Available: {wallet?.balance?.toFixed(2) || '0.00'} RON (Min: 50 RON)
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Bank Account (IBAN)
              </label>
              
              {!isEditingIban ? (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-400" />
                      <span className="text-sm font-medium">
                        {iban ? `${iban.substring(0, 4)}****${iban.substring(iban.length - 4)}` : 'No IBAN set'}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsEditingIban(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      {iban ? 'Edit' : 'Add IBAN'}
                    </button>
                  </div>
                  {iban && (
                    <p className="text-xs text-zinc-400 mt-2">
                      Funds will be transferred to this account within 2-3 business days.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    placeholder="RO49AAAA1B31007593840000"
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateIban}
                      disabled={isUpdatingIban}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      {isUpdatingIban ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        'Save IBAN'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingIban(false);
                        // Reset to original value if canceling
                      }}
                      className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 px-6 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={withdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) < 50 || !iban || iban.trim() === ''}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {withdrawing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Withdraw
                  </>
                )}
              </button>
            </div>
            
            {(!iban || iban.trim() === '') && (
              <p className="text-sm text-amber-400 text-center mt-2">
                ⚠️ Please add your IBAN to enable withdrawals
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return <WalletManagement />;
} 