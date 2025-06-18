"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Instagram, Music, Users, DollarSign, TrendingUp, Eye, Share2, CheckCircle, Heart, Video, Download, XCircle, Clock, Info } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { influencerService, type InfluencerWallet } from '@/lib/influencerService';
import { useAuth } from '@/hooks/useAuth';

function InfluencerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tiktokData, setTiktokData] = useState<{
    name: string;
    username: string;
    followers: number;
    likes: number;
    videos: number;
  } | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { designer } = useAuth();
  const [influencer, setInfluencer] = useState<any>(null);
  const [wallet, setWallet] = useState<InfluencerWallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
    
    const platformParam = searchParams.get('platform') as 'instagram' | 'tiktok' | null;
    const success = searchParams.get('success');
    
    if (platformParam && (platformParam === 'instagram' || platformParam === 'tiktok')) {
      setPlatform(platformParam);
    }

    // Get TikTok data from URL parameters
    if (platformParam === 'tiktok') {
      const name = searchParams.get('name') || 'TikTok User';
      const username = searchParams.get('username') || '';
      const followers = parseInt(searchParams.get('followers') || '0');
      const likes = parseInt(searchParams.get('likes') || '0');
      const videos = parseInt(searchParams.get('videos') || '0');

      setTiktokData({
        name,
        username,
        followers,
        likes,
        videos
      });
    }
    
    if (success === 'true') {
      setShowSuccess(true);
      // Remove URL parameters after showing success
      setTimeout(() => {
        setShowSuccess(false);
        router.replace('/influencer-dashboard');
      }, 3000);
    }

    // Fetch live products for influencer promotion
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('designer_products')
        .select('*')
        .eq('is_live', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setProducts(data);
      }
      setLoadingProducts(false);
    };
    fetchProducts();

    if (!designer?.id) return;
    // Fetch influencer record
    const fetchInfluencer = async () => {
      const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', designer.id)
        .single();
      if (!error && data) {
        setInfluencer(data);
        setWalletLoading(true);
        const w = await influencerService.getInfluencerWallet(data.id);
        setWallet(w);
        setWalletLoading(false);
        if (w) {
          const txs = await influencerService.getWalletTransactions(data.id, 50);
          setTransactions(txs);
        } else {
          setTransactions([]);
        }
      } else {
        setInfluencer(null);
        setWallet(null);
        setWalletLoading(false);
        setTransactions([]);
      }
    };
    fetchInfluencer();
  }, [searchParams, router, designer?.id]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={20} className="text-purple-400" />;
      case 'tiktok': return <Music size={20} className="text-red-400" />;
      default: return <Users size={20} className="text-blue-400" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-purple-600 to-pink-600';
      case 'tiktok': return 'from-red-600 to-blue-600';
      default: return 'from-blue-600 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10">
        {/* Info Icon for How It Works */}
        <div className="flex justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <button
            onClick={() => setShowHowItWorks(true)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-full p-2 transition shadow-md"
            aria-label="How It Works"
          >
            <Info size={28} className="text-green-400" />
          </button>
        </div>
        {/* How It Works Modal */}
        {showHowItWorks && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-lg w-full relative">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white text-xl"
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-4">How It Works</h3>
              <p className="text-zinc-400 text-base">
                Share any product on your account and get up to <span className="text-green-400 font-bold">15% commission</span> on the product sale straight to your wallet!
              </p>
            </div>
          </div>
        )}
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 border border-green-500 rounded-lg p-4 shadow-lg animate-slide-in">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-300" />
              <div>
                <p className="font-medium">Account Connected!</p>
                <p className="text-sm text-green-200">
                  Your {platform} account has been successfully linked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/main"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Main</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <Users size={24} />
                  <h1 className="text-xl font-bold">Influencer Dashboard</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome to Baguri Influencer Program!</h2>
            <p className="text-zinc-400">
              You&apos;re now part of our exclusive network promoting Romanian fashion designers.
            </p>
          </div>

          {/* Show TikTok name if connected */}
          {platform === 'tiktok' && tiktokData && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-lg font-semibold">Connected TikTok:</span>
              <span className="bg-zinc-800 px-3 py-1 rounded-lg text-white font-mono">{tiktokData.name}</span>
                  {tiktokData.username && (
                <span className="text-zinc-400 text-sm">@{tiktokData.username}</span>
              )}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={20} className="text-green-400" />
                <span className="text-sm text-zinc-400">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold">0.00 RON</p>
              <p className="text-xs text-zinc-500 mt-1">+0% from last month</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Share2 size={20} className="text-blue-400" />
                <span className="text-sm text-zinc-400">Clicks Generated</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-zinc-500 mt-1">Start promoting to see data</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-purple-400" />
                <span className="text-sm text-zinc-400">Conversions</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-zinc-500 mt-1">0% conversion rate</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Eye size={20} className="text-yellow-400" />
                <span className="text-sm text-zinc-400">Reach</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-zinc-500 mt-1">People reached this month</p>
            </div>
          </div>

          {/* Influencer Product Browser */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Promote Products & Earn Commission</h3>
            {loadingProducts ? (
              <div className="text-zinc-400">Loading products...</div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
                {products.length === 0 ? (
                  <div className="text-zinc-500">No products available for promotion.</div>
                ) : (
                  products.map(product => {
                    // Parse colors field for images (like shop page)
                    let colors = [];
                    try {
                      if (typeof product.colors === 'string') {
                        colors = JSON.parse(product.colors);
                      } else if (Array.isArray(product.colors)) {
                        colors = product.colors;
                      } else {
                        colors = [];
                      }
                    } catch (error) {
                      colors = [];
                    }
                    const firstColor = colors[0];
                    const firstImage = firstColor?.images?.[0];
                    // Calculate commission
                    const price = parseFloat(product.price);
                    const commission = price ? (price * 0.15).toFixed(2) : '0.00';
                    return (
                      <div key={product.id} className="min-w-[220px] bg-zinc-800 rounded-lg p-4 flex flex-col gap-3 items-center">
                        <div className="w-32 h-32 bg-zinc-900 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                          {firstImage ? (
                            <Image 
                              src={firstImage} 
                              alt={product.name} 
                              width={128} 
                              height={128} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-700 text-zinc-400 text-xs font-bold">IMG</div>
                          )}
                </div>
                        <div className="font-bold text-white text-base text-center line-clamp-2">{product.name}</div>
                        <div className="text-zinc-400 text-sm mb-2">{product.price} RON</div>
                        <div className="text-green-400 text-xs font-semibold mb-1">Earn {commission} RON per sale</div>
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                          onClick={() => {
                            const link = `${window.location.origin}/shop?product=${product.id}&ref=${influencer?.tiktok_open_id || 'influencer'}`;
                            navigator.clipboard.writeText(link);
                            alert('Referral link copied to clipboard!');
                          }}
                        >
                          Generate & Copy Link
                        </button>
              </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Getting Started */}
          {/* REMOVED: How It Works box (always visible) */}

          {/* Connect Additional Platforms */}
          {/* Removed Connect Instagram and Connect TikTok buttons */}
            </div>
          </div>
      {/* Wallet and Transaction History at the bottom, in the same container */}
      <div className="mt-12 max-w-3xl mx-auto">
        <div className="bg-zinc-950 border-2 border-green-700/40 rounded-lg p-6 mb-8 shadow-lg shadow-green-900/20">
          <WalletCard wallet={wallet} />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}

// WalletCard component (adapted for influencer)
function WalletCard({ wallet }: { wallet: InfluencerWallet | null }) {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [iban, setIban] = useState(wallet?.iban || '');
  const [isEditingIban, setIsEditingIban] = useState(false);
  const [isUpdatingIban, setIsUpdatingIban] = useState(false);
  const [walletState, setWalletState] = useState(wallet);

  // Update IBAN in DB
  const handleUpdateIban = async () => {
    if (!walletState) return;
    if (!iban || iban.length < 10) {
      alert('Please enter a valid IBAN');
      return;
    }
    setIsUpdatingIban(true);
    const { error } = await supabase
      .from('influencer_wallets')
      .update({ iban: iban.toUpperCase(), updated_at: new Date().toISOString() })
      .eq('id', walletState.id);
    setIsUpdatingIban(false);
    if (!error) {
      setIsEditingIban(false);
      setWalletState({ ...walletState, iban: iban.toUpperCase() });
      alert('IBAN updated successfully!');
    } else {
      alert('Failed to update IBAN');
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    if (!walletState) return;
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount < 50) {
      alert('Minimum withdrawal amount is 50 RON');
      return;
    }
    if (amount > walletState.balance) {
      alert('Insufficient balance');
      return;
    }
    if (!walletState.iban || walletState.iban.length < 10) {
      alert('Please add your IBAN before requesting a withdrawal');
      return;
    }
    setWithdrawing(true);
    const result = await influencerService.requestWithdrawal(walletState.influencerId, amount);
    setWithdrawing(false);
    if (result.success) {
      alert('Withdrawal request submitted successfully! We will process it within 2-3 business days.');
      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      // Reload wallet data
      const updated = await influencerService.getInfluencerWallet(walletState.influencerId);
      setWalletState(updated);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  // If walletState is null, show a default wallet card
  if (!walletState) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={20} className="text-green-400" />
          <h3 className="text-lg font-bold">Wallet & Earnings</h3>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center bg-zinc-900/80 rounded-lg p-6 mb-4">
            <p className="text-xs text-zinc-400 mb-1">Current Balance</p>
            <p className="text-4xl font-extrabold text-green-400">0.00 RON</p>
          </div>
          <button
            disabled
            className="w-full bg-zinc-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Download size={20} />
            Withdraw Funds
          </button>
          <p className="text-sm text-zinc-400 text-center mt-2">
            Minimum withdrawal amount is 50 RON
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={20} className="text-green-400" />
        <h3 className="text-lg font-bold">Wallet & Earnings</h3>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center bg-zinc-900/80 rounded-lg p-6 mb-4">
          <p className="text-xs text-zinc-400 mb-1">Current Balance</p>
          <p className="text-4xl font-extrabold text-green-400">{walletState.balance.toFixed(2)} RON</p>
        </div>
        {/* IBAN Management */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-2">Bank Account (IBAN)</label>
          {!isEditingIban ? (
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600 flex items-center justify-between">
              <span className="text-sm font-medium">
                {walletState.iban ? `${walletState.iban.substring(0, 4)}****${walletState.iban.substring(walletState.iban.length - 4)}` : 'No IBAN set'}
              </span>
              <button
                onClick={() => setIsEditingIban(true)}
                className="text-blue-400 hover:text-blue-300 text-sm underline ml-4"
              >
                {walletState.iban ? 'Edit' : 'Add IBAN'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={iban}
                onChange={e => setIban(e.target.value.toUpperCase())}
                placeholder="RO49AAAA1B31007593840000"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateIban}
                  disabled={isUpdatingIban}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-600 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  {isUpdatingIban ? 'Saving...' : 'Save IBAN'}
                </button>
                <button
                  onClick={() => setIsEditingIban(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Withdrawal Button */}
        <button
          onClick={() => setShowWithdrawalModal(true)}
          disabled={!walletState.balance || walletState.balance < 50}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Withdraw Funds
        </button>
        {(!walletState.balance || walletState.balance < 50) && (
          <p className="text-sm text-zinc-400 text-center mt-2">
            Minimum withdrawal amount is 50 RON
          </p>
        )}
      </div>
      {/* Withdrawal Modal */}
      {showWithdrawalModal && walletState && (
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
                onChange={e => setWithdrawalAmount(e.target.value)}
                placeholder="50.00"
                min="50"
                max={walletState.balance || 0}
                step="0.01"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-400 focus:border-green-500 focus:outline-none"
              />
              <div className="text-xs text-zinc-400 mt-1">
                Available: {walletState.balance?.toFixed(2) || '0.00'} RON (Min: 50 RON)
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Bank Account (IBAN)
              </label>
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-600">
                <span className="text-sm font-medium">
                  {walletState.iban ? `${walletState.iban.substring(0, 4)}****${walletState.iban.substring(walletState.iban.length - 4)}` : 'No IBAN set'}
                </span>
              </div>
              {(!walletState.iban || walletState.iban.length < 10) && (
                <p className="text-sm text-amber-400 text-center mt-2">
                  ⚠️ Please add your IBAN to enable withdrawals
                </p>
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
                disabled={withdrawing || !withdrawalAmount || parseFloat(withdrawalAmount) < 50 || !walletState.iban || walletState.iban.length < 10}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {withdrawing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// TransactionHistory component (influencer version)
function TransactionHistory({ transactions }: { transactions: any[] }) {
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock size={16} className="text-amber-400" />;
    if (status === 'failed') return <XCircle size={16} className="text-red-400" />;
    switch (type) {
      case 'commission':
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
      case 'commission':
        return 'text-green-400';
      case 'withdrawal':
        return 'text-blue-400';
      case 'refund':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
      </div>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          <DollarSign size={48} className="mx-auto mb-3 opacity-50" />
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
            >
              <div className="flex items-center gap-3">
                {getTransactionIcon(transaction.type, transaction.status)}
                <div>
                  <div className="font-medium capitalize">
                    {transaction.type === 'commission' ? 'Commission Earned' : transaction.type}
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
  );
}

export default function InfluencerDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InfluencerDashboardContent />
    </Suspense>
  );
}