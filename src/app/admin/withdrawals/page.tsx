"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, DollarSign, User, Calendar, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { adminService } from '@/lib/adminService';

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
  updated_at: string;
  designers: {
    brand_name: string;
    email: string;
    iban: string;
  };
  designer_wallets: {
    balance: number;
  };
}

export default function WithdrawalsAdmin() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ 
    withdrawal: WithdrawalRequest; 
    isOpen: boolean; 
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const router = useRouter();

  const loadWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load pending withdrawals first
      const pendingResult = await adminService.getPendingWithdrawals();
      if (pendingResult.success) {
        setPendingWithdrawals(pendingResult.data || []);
      }

      // Load all withdrawals if showing all
      if (showAll) {
        const allResult = await adminService.getAllWithdrawals();
        if (allResult.success) {
          setWithdrawals(allResult.data || []);
        } else {
          setError(allResult.error || 'Failed to load withdrawals');
        }
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      setError('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('baguri-admin-session');
    if (adminSession !== 'authenticated') {
      router.push('/admin/login');
      return;
    }

    loadWithdrawals();
  }, [router, loadWithdrawals]);

  const handleApprove = async (withdrawalId: string) => {
    try {
      setActionLoading(withdrawalId);
      const result = await adminService.approveWithdrawal(withdrawalId);
      
      if (result.success) {
        await loadWithdrawals();
        alert('Withdrawal approved successfully!');
      } else {
        alert(`Error approving withdrawal: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Failed to approve withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (withdrawalId: string, reason?: string) => {
    try {
      setRejecting(true);
      const result = await adminService.rejectWithdrawal(withdrawalId, reason);
      
      if (result.success) {
        await loadWithdrawals();
        setRejectionModal(null);
        alert('Withdrawal rejected successfully. Funds have been returned to designer balance.');
      } else {
        alert(`Error rejecting withdrawal: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Failed to reject withdrawal');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
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
                  href="/admin"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Admin</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <DollarSign size={24} />
                  <h1 className="text-xl font-bold">Withdrawal Management</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-4 py-2 border border-zinc-700 rounded-lg hover:border-zinc-600 transition"
                >
                  {showAll ? 'Show Pending Only' : 'Show All'}
                </button>
                <button
                  onClick={loadWithdrawals}
                  className="p-2 border border-zinc-700 rounded-lg hover:border-zinc-600 transition"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {pendingWithdrawals.length}
                  </div>
                  <div className="text-sm text-zinc-400">Pending Withdrawals</div>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-900/20 border border-amber-500/20 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <DollarSign size={24} className="text-amber-400" />
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {pendingWithdrawals.reduce((sum, w) => sum + Math.abs(w.amount), 0).toFixed(2)} RON
                  </div>
                  <div className="text-sm text-zinc-400">Total Pending Amount</div>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {showAll ? withdrawals.filter(w => w.status === 'completed').length : 0}
                  </div>
                  <div className="text-sm text-zinc-400">Completed Today</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Withdrawals */}
          {pendingWithdrawals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-amber-400" />
                Pending Withdrawals ({pendingWithdrawals.length})
              </h2>
              
              <div className="grid gap-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <WithdrawalCard 
                    key={withdrawal.id} 
                    withdrawal={withdrawal}
                    onApprove={() => handleApprove(withdrawal.id)}
                    onReject={() => setRejectionModal({ withdrawal, isOpen: true })}
                    isLoading={actionLoading === withdrawal.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Withdrawals (when showing all) */}
          {showAll && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                All Withdrawals ({withdrawals.length})
              </h2>
              
              <div className="grid gap-4">
                {withdrawals.map((withdrawal) => (
                  <WithdrawalCard 
                    key={withdrawal.id} 
                    withdrawal={withdrawal}
                    onApprove={() => handleApprove(withdrawal.id)}
                    onReject={() => setRejectionModal({ withdrawal, isOpen: true })}
                    isLoading={actionLoading === withdrawal.id}
                    readOnly={withdrawal.status !== 'pending'}
                  />
                ))}
              </div>
            </div>
          )}

          {pendingWithdrawals.length === 0 && !showAll && (
            <div className="text-center py-12">
              <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-zinc-400">No pending withdrawal requests at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Withdrawal</h3>
            <p className="text-zinc-400 mb-4">
              Are you sure you want to reject this withdrawal request? 
              The funds will be returned to the designer&apos;s balance.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-purple-500"
                rows={3}
                placeholder="Enter reason for rejection..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectionModal(null)}
                className="flex-1 px-4 py-2 border border-zinc-700 rounded-lg hover:border-zinc-600 transition"
                disabled={rejecting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectionModal.withdrawal.id, rejectionReason)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center justify-center gap-2"
                disabled={rejecting}
              >
                {rejecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Withdrawal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WithdrawalCard({ 
  withdrawal, 
  onApprove, 
  onReject, 
  isLoading, 
  readOnly = false 
}: {
  withdrawal: WithdrawalRequest;
  onApprove: () => void;
  onReject: () => void;
  isLoading: boolean;
  readOnly?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-900/20 border-amber-500/20';
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-500/20';
      case 'failed': return 'text-red-400 bg-red-900/20 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-900/20 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  return (
    <div className={`border rounded-lg p-6 ${getStatusColor(withdrawal.status)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <User size={20} />
          <div>
            <h3 className="font-semibold">{withdrawal.designers.brand_name}</h3>
            <p className="text-sm opacity-75">{withdrawal.designers.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(withdrawal.status)}
          <span className="text-sm font-medium capitalize">{withdrawal.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm opacity-75">Amount</div>
          <div className="text-xl font-bold">{Math.abs(withdrawal.amount).toFixed(2)} RON</div>
        </div>
        
        <div>
          <div className="text-sm opacity-75">IBAN</div>
          <div className="font-mono text-sm">{withdrawal.designers.iban}</div>
        </div>
        
        <div>
          <div className="text-sm opacity-75">Current Balance</div>
          <div className="font-semibold">{withdrawal.designer_wallets.balance.toFixed(2)} RON</div>
        </div>
        
        <div>
          <div className="text-sm opacity-75">Requested</div>
          <div className="text-sm">{formatDate(withdrawal.created_at)}</div>
        </div>
      </div>

      <div className="text-sm opacity-75 mb-4">
        {withdrawal.description}
      </div>

      {!readOnly && withdrawal.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Approve
              </>
            )}
          </button>
          
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
} 