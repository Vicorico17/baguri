import { useEffect, useState } from 'react';
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { User, Package, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InfluencerRequestsPage() {
  const { user, initialized } = useDesignerAuth();
  const [influencerRequests, setInfluencerRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
    const fetchRequests = async () => {
      setLoadingRequests(true);
      setRequestError(null);
      try {
        const res = await fetch(`/api/designer/influencer-item-requests?designerId=${user.id}`);
        const data = await res.json();
        setInfluencerRequests(data.requests || []);
      } catch (err) {
        setRequestError('Failed to load influencer requests');
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [user?.id]);

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!user?.id) return;
    setActionLoading(requestId + status);
    setRequestError(null);
    try {
      const res = await fetch('/api/designer/influencer-item-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh requests
        const res2 = await fetch(`/api/designer/influencer-item-requests?designerId=${user.id}`);
        const data2 = await res2.json();
        setInfluencerRequests(data2.requests || []);
      } else {
        setRequestError(data.error || 'Failed to update request');
      }
    } catch (err) {
      setRequestError('Failed to update request');
    } finally {
      setActionLoading(null);
    }
  };

  if (!initialized) {
    return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    router.replace('/designer-auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <User size={28} className="text-green-400" /> Influencer Item Requests
        </h1>
        {loadingRequests ? (
          <div className="text-zinc-400">Loading requests...</div>
        ) : influencerRequests.length === 0 ? (
          <div className="text-zinc-500">No influencer item requests at the moment.</div>
        ) : (
          <div className="space-y-4">
            {influencerRequests.map((req: any) => (
              <div key={req.id} className="border border-zinc-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-950/60">
                <div className="flex items-center gap-4 flex-1">
                  <User size={20} className="text-green-400" />
                  <div>
                    <div className="font-semibold text-white">{req.influencer?.display_name || req.influencer_open_id}</div>
                    <div className="text-zinc-400 text-xs">{req.influencer_open_id}</div>
                  </div>
                  <div className="ml-6 flex items-center gap-2">
                    <Package size={18} className="text-blue-400" />
                    <span className="font-medium text-white">{req.product?.name || 'Product'}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-zinc-400 text-sm">Delivery Address:</div>
                  <div className="text-white text-sm font-mono break-words">{req.delivery_address?.text || JSON.stringify(req.delivery_address)}</div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  {req.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestAction(req.id, 'accepted')}
                        disabled={actionLoading === req.id + 'accepted'}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                      >
                        {actionLoading === req.id + 'accepted' ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, 'rejected')}
                        disabled={actionLoading === req.id + 'rejected'}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                      >
                        {actionLoading === req.id + 'rejected' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  ) : req.status === 'accepted' ? (
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <CheckCircle size={16} /> Accepted
                    </div>
                  ) : req.status === 'rejected' ? (
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <XCircle size={16} /> Rejected
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
        {requestError && <div className="text-red-400 text-sm mt-2">{requestError}</div>}
      </div>
    </div>
  );
} 