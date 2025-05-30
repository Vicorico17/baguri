"use client";

import { useState } from 'react';
import { X, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangeEmailModal({ isOpen, onClose, onSuccess }: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useDesignerAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get the current session token
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          newEmail,
          currentPassword
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to update email');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        // Reset form
        setNewEmail('');
        setCurrentPassword('');
        setSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error changing email:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNewEmail('');
      setCurrentPassword('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Change Email Address</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-green-400 mb-2">Email Updated!</h3>
            <p className="text-zinc-400 text-sm">
              Please check your new email for verification instructions.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Email</label>
              <div className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400">
                {user?.email || 'No email found'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition disabled:opacity-50"
                  placeholder="Enter new email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition disabled:opacity-50"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-amber-400 text-sm">
                <strong>Important:</strong> You'll need to verify your new email address before you can use it to sign in.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newEmail || !currentPassword}
                className="flex-1 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 