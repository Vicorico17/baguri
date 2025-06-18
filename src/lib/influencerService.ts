import { supabase } from './supabase';

export type InfluencerWallet = {
  tiktok_open_id: string;
  tiktok_display_name: string;
  balance: number;
  created_at: string;
  updated_at?: string;
};

export type InfluencerWalletTransaction = {
  transaction_id: string;
  tiktok_open_id: string;
  tiktok_display_name: string;
  type: 'commission' | 'withdrawal' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  created_at: string;
};

class InfluencerService {
  // Get influencer wallet
  async getInfluencerWallet(tiktokOpenId: string): Promise<InfluencerWallet | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('influencers_wallets')
        .select('*')
        .eq('tiktok_open_id', tiktokOpenId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching influencer wallet:', error);
        return null;
      }
      return {
        tiktok_open_id: wallet.tiktok_open_id,
        tiktok_display_name: wallet.tiktok_display_name,
        balance: parseFloat(wallet.balance) || 0,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at,
      };
    } catch (error) {
      console.error('Error getting influencer wallet:', error);
      return null;
    }
  }

  // Create influencer wallet
  async createInfluencerWallet(influencerId: string): Promise<InfluencerWallet | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('influencer_wallets')
        .insert({
          influencer_id: influencerId,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
          pending_balance: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating influencer wallet:', error);
        return null;
      }

      return {
        id: wallet.id,
        influencerId: wallet.influencer_id,
        balance: parseFloat(wallet.balance) || 0,
        totalEarnings: parseFloat(wallet.total_earnings) || 0,
        totalWithdrawn: parseFloat(wallet.total_withdrawn) || 0,
        pendingBalance: parseFloat(wallet.pending_balance) || 0,
        iban: wallet.iban,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      };
    } catch (error) {
      console.error('Error creating influencer wallet:', error);
      return null;
    }
  }

  // Add earnings to influencer wallet (called when a product is sold)
  async addEarnings(influencerId: string, amount: number, orderId: string, description: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get or create wallet
      let wallet = await this.getInfluencerWallet(influencerId);
      if (!wallet) {
        wallet = await this.createInfluencerWallet(influencerId);
        if (!wallet) {
          return { success: false, error: 'Failed to create wallet' };
        }
      }

      // Add earnings to wallet
      const { error: updateError } = await supabase
        .from('influencer_wallets')
        .update({
          balance: (wallet.balance + amount).toFixed(2),
          total_earnings: (wallet.totalEarnings + amount).toFixed(2),
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (updateError) {
        console.error('Error updating influencer wallet:', updateError);
        return { success: false, error: updateError.message };
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('influencer_wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          influencer_id: influencerId,
          type: 'commission',
          amount: amount,
          status: 'completed',
          description,
          order_id: orderId,
        });

      if (transactionError) {
        console.error('Error creating influencer wallet transaction:', transactionError);
        return { success: false, error: transactionError.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error adding influencer earnings:', error);
      return { success: false, error: error.message };
    }
  }

  // Request withdrawal with IBAN information
  async requestWithdrawal(influencerId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const wallet = await this.getInfluencerWallet(influencerId);
      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      if (amount > wallet.balance) {
        return { success: false, error: 'Insufficient balance' };
      }

      if (amount < 50) {
        return { success: false, error: 'Minimum withdrawal amount is 50 RON' };
      }

      if (!wallet.iban) {
        return { success: false, error: 'IBAN not found. Please add your IBAN before requesting withdrawal.' };
      }

      // Create withdrawal transaction
      const { error: transactionError } = await supabase
        .from('influencer_wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          influencer_id: influencerId,
          type: 'withdrawal',
          amount: -amount, // Negative for withdrawal
          status: 'pending',
          description: `Withdrawal request of ${amount} RON to ${wallet.iban.slice(-4)}`,
        });

      if (transactionError) {
        console.error('Error creating withdrawal request:', transactionError);
        return { success: false, error: transactionError.message };
      }

      // Update wallet balance - move money from balance to pending_balance
      const { error: walletUpdateError } = await supabase
        .from('influencer_wallets')
        .update({
          balance: (wallet.balance - amount).toFixed(2),
          pending_balance: (wallet.pendingBalance + amount).toFixed(2),
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id);

      if (walletUpdateError) {
        console.error('Error updating influencer wallet:', walletUpdateError);
        return { success: false, error: walletUpdateError.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error requesting influencer withdrawal:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet transactions
  async getWalletTransactions(tiktokOpenId: string, limit: number = 50): Promise<InfluencerWalletTransaction[]> {
    try {
      const { data: transactions, error } = await supabase
        .from('influencers_wallet_transactions')
        .select('*')
        .eq('tiktok_open_id', tiktokOpenId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.error('Error fetching influencer wallet transactions:', error);
        return [];
      }
      return (transactions || []).map((t: any) => ({
        transaction_id: t.transaction_id,
        tiktok_open_id: t.tiktok_open_id,
        tiktok_display_name: t.tiktok_display_name,
        type: t.type,
        amount: parseFloat(t.amount) || 0,
        description: t.description || '',
        created_at: t.created_at,
      }));
    } catch (error) {
      console.error('Error getting influencer wallet transactions:', error);
      return [];
    }
  }
}

export const influencerService = new InfluencerService();
 