import { supabase } from './supabase';

export type InfluencerWallet = {
  tiktok_open_id: string;
  tiktok_display_name: string;
  balance: number;
  created_at: string;
  updated_at?: string;
  iban?: string;
};

export type InfluencerWalletTransaction = {
  transaction_id: string;
  tiktok_open_id: string;
  tiktok_display_name: string;
  type: 'commission' | 'withdrawal' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  created_at: string;
  iban?: string;
};

// Types for new feature
export type InfluencerAddress = {
  id: string;
  influencer_open_id: string;
  address: any;
  label?: string;
  created_at: string;
  updated_at?: string;
};

export type InfluencerItemRequest = {
  id: string;
  influencer_open_id: string;
  designer_id: string;
  product_id: string;
  delivery_address: any;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
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
        iban: wallet.iban || undefined,
      };
    } catch (error) {
      console.error('Error getting influencer wallet:', error);
      return null;
    }
  }

  // Create influencer wallet
  async createInfluencerWallet(tiktokOpenId: string, tiktokDisplayName: string): Promise<InfluencerWallet | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('influencers_wallets')
        .insert({
          tiktok_open_id: tiktokOpenId,
          tiktok_display_name: tiktokDisplayName,
          balance: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating influencer wallet:', error);
        return null;
      }

      return {
        tiktok_open_id: wallet.tiktok_open_id,
        tiktok_display_name: wallet.tiktok_display_name,
        balance: parseFloat(wallet.balance) || 0,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at,
        iban: wallet.iban || '',
      };
    } catch (error) {
      console.error('Error creating influencer wallet:', error);
      return null;
    }
  }

  // Add earnings to influencer wallet (called when a product is sold)
  async addEarnings(tiktokOpenId: string, tiktokDisplayName: string, amount: number, orderId: string, description: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get or create wallet
      let wallet = await this.getInfluencerWallet(tiktokOpenId);
      if (!wallet) {
        wallet = await this.createInfluencerWallet(tiktokOpenId, tiktokDisplayName);
        if (!wallet) {
          return { success: false, error: 'Failed to create wallet' };
        }
      }

      // Add earnings to wallet
      const { error: updateError } = await supabase
        .from('influencers_wallets')
        .update({
          balance: (wallet.balance + amount).toFixed(2),
          updated_at: new Date().toISOString(),
        })
        .eq('tiktok_open_id', tiktokOpenId);

      if (updateError) {
        console.error('Error updating influencer wallet:', updateError);
        return { success: false, error: updateError.message };
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('influencers_wallet_transactions')
        .insert({
          tiktok_open_id: tiktokOpenId,
          tiktok_display_name: tiktokDisplayName,
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

  // Request withdrawal (with IBAN logic)
  async requestWithdrawal(tiktokOpenId: string, tiktokDisplayName: string, amount: number, iban: string): Promise<{ success: boolean; error?: string }> {
    try {
      const wallet = await this.getInfluencerWallet(tiktokOpenId);
      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }
      if (amount > wallet.balance) {
        return { success: false, error: 'Insufficient balance' };
      }
      if (amount < 50) {
        return { success: false, error: 'Minimum withdrawal amount is 50 RON' };
      }
      if (!iban || iban.trim() === '') {
        return { success: false, error: 'IBAN is required for withdrawal' };
      }
      // Save IBAN to wallet if changed
      if (wallet.iban !== iban) {
        const { error: ibanUpdateError } = await supabase
          .from('influencers_wallets')
          .update({ iban: iban.trim() })
          .eq('tiktok_open_id', tiktokOpenId);
        if (ibanUpdateError) {
          console.error('Error updating IBAN:', ibanUpdateError);
          return { success: false, error: 'Failed to update IBAN' };
        }
      }
      // Create withdrawal transaction (for history)
      const { error: transactionError } = await supabase
        .from('influencers_wallet_transactions')
        .insert({
          tiktok_open_id: tiktokOpenId,
          tiktok_display_name: tiktokDisplayName,
          type: 'withdrawal',
          amount: -amount, // Negative for withdrawal
          status: 'pending',
          description: `Withdrawal request of ${amount} RON to IBAN ${iban.slice(-4)}`,
          iban: iban.trim(),
        });
      if (transactionError) {
        console.error('Error creating withdrawal request:', transactionError);
        return { success: false, error: transactionError.message };
      }
      // Insert into influencer_withdrawals (for admin display)
      const { error: withdrawalError } = await supabase
        .from('influencer_withdrawals')
        .insert({
          tiktok_open_id: tiktokOpenId,
          tiktok_display_name: tiktokDisplayName,
          iban: iban.trim(),
          amount: amount,
          status: 'pending',
        });
      if (withdrawalError) {
        console.error('Error creating influencer withdrawal record:', withdrawalError);
        return { success: false, error: withdrawalError.message };
      }
      // Update wallet balance (deduct immediately)
      const { error: walletUpdateError } = await supabase
        .from('influencers_wallets')
        .update({
          balance: (wallet.balance - amount).toFixed(2),
          updated_at: new Date().toISOString(),
        })
        .eq('tiktok_open_id', tiktokOpenId);
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
        iban: t.iban || undefined,
      }));
    } catch (error) {
      console.error('Error getting influencer wallet transactions:', error);
      return [];
    }
  }

  // Create a new item request
  async createItemRequest(productId: string, designerId: string, deliveryAddress: any, tiktokOpenId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('influencer_item_requests')
        .insert({
          influencer_open_id: tiktokOpenId,
          designer_id: designerId,
          product_id: productId,
          delivery_address: deliveryAddress,
          status: 'pending',
        });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Get all item requests for the current influencer
  async getItemRequests(tiktokOpenId: string): Promise<InfluencerItemRequest[]> {
    try {
      const { data, error } = await supabase
        .from('influencer_item_requests')
        .select('*')
        .eq('influencer_open_id', tiktokOpenId)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  // Get all saved addresses for the current influencer
  async getSavedAddresses(tiktokOpenId: string): Promise<InfluencerAddress[]> {
    try {
      const { data, error } = await supabase
        .from('influencer_addresses')
        .select('*')
        .eq('influencer_open_id', tiktokOpenId)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  // Save a new address
  async saveAddress(address: any, label: string, tiktokOpenId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('influencer_addresses')
        .insert({
          influencer_open_id: tiktokOpenId,
          address,
          label,
        });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Delete a saved address
  async deleteAddress(addressId: string, tiktokOpenId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('influencer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('influencer_open_id', tiktokOpenId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Cancel an item request
  async cancelItemRequest(requestId: string, tiktokOpenId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('influencer_item_requests')
        .delete()
        .eq('id', requestId)
        .eq('influencer_open_id', tiktokOpenId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // Optionally: get status for a specific product request
  async getItemRequestStatus(productId: string, tiktokOpenId: string): Promise<'pending' | 'accepted' | 'rejected' | null> {
    try {
      const { data, error } = await supabase
        .from('influencer_item_requests')
        .select('status')
        .eq('product_id', productId)
        .eq('influencer_open_id', tiktokOpenId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) return null;
      return data.status;
    } catch {
      return null;
    }
  }
}

export const influencerService = new InfluencerService();
 