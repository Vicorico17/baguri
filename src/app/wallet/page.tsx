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
  EyeOff
} from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { designerService, type DesignerWallet, type WalletTransaction } from '@/lib/designerService';

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
          
          // Get designer profile to get designer ID
          const designerProfile = await designerService.getDesignerByUserId(user.id);
          if (designerProfile) {
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

  const handleWithdrawal = async () => {
    if (!user?.id || !wallet) return;
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      alert('Minimum withdrawal amount is 50 lei');
      return;
    }

    if (amount > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    try {
      setWithdrawing(true);
      
      const designerProfile = await designerService.getDesignerByUserId(user.id);
      if (!designerProfile) {
        alert('Designer profile not found');
        return;
      }

      const result = await designerService.requestWithdrawal(designerProfile.id, amount);
      if (result.success) {
        alert('Withdrawal request submitted successfully! We will process it within 2-3 business days.');
        setShowWithdrawalModal(false);
        setWithdrawalAmount('');
        
        // Reload wallet data
        const dashboardData = await designerService.getDashboardData(user.id);
        if (dashboardData?.wallet) {
          setWallet(dashboardData.wallet);
        }
        
        const walletTransactions = await designerService.getWalletTransactions(designerProfile.id);
        setTransactions(walletTransactions);
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
              
              <button
                onClick={() => setShowWithdrawalModal(true)}
                disabled={!wallet || wallet.balance < 50}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Request Withdrawal
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-white hover:text-zinc-300 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* Wallet Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-zinc-900 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-zinc-400">Available Balance</h3>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="text-zinc-400 hover:text-white transition"
                    >
                      {balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    {balanceVisible ? `${wallet?.balance || 0} lei` : '••••'}
                  </p>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Earnings</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {balanceVisible ? `${wallet?.totalEarnings || 0} lei` : '••••'}
                  </p>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Total Withdrawn</h3>
                  <p className="text-3xl font-bold text-purple-400">
                    {balanceVisible ? `${wallet?.totalWithdrawn || 0} lei` : '••••'}
                  </p>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-6">
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Pending</h3>
                  <p className="text-3xl font-bold text-amber-400">
                    {balanceVisible ? `${wallet?.pendingBalance || 0} lei` : '••••'}
                  </p>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-zinc-900 rounded-lg">
                <div className="p-6 border-b border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Transaction History</h2>
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-zinc-400" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-sm"
                      >
                        <option value="all">All Transactions</option>
                        <option value="sale">Sales</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="refund">Refunds</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet size={48} className="mx-auto text-zinc-600 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                      <p className="text-zinc-400">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            {getTransactionIcon(transaction.type, transaction.status)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <Calendar size={14} />
                                <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                                {transaction.orderId && (
                                  <>
                                    <span>•</span>
                                    <span>Order: {transaction.orderId.slice(0, 8)}...</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getTransactionColor(transaction.type, transaction.status)}`}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount} lei
                            </p>
                            <p className="text-sm text-zinc-400 capitalize">{transaction.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Request Withdrawal</h2>
            
            <div className="mb-4">
              <p className="text-sm text-zinc-400 mb-2">Available Balance</p>
              <p className="text-2xl font-bold text-green-400">{wallet?.balance || 0} lei</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Withdrawal Amount (lei)</label>
              <input
                type="number"
                min="50"
                max={wallet?.balance || 0}
                step="0.01"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="50.00"
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum withdrawal: 50 lei</p>
            </div>
            
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-sm">
                <strong>Processing Time:</strong> 2-3 business days<br />
                <strong>Fee:</strong> No withdrawal fees<br />
                <strong>Method:</strong> Bank transfer to your registered IBAN
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawalModal(false)}
                className="flex-1 py-3 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={withdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) < 50}
                className="flex-1 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return <WalletManagement />;
} 