import { supabase } from './supabase';
import type { Designer, DesignerProduct } from './supabase';

export type DesignerApplication = Designer & {
  products?: DesignerProduct[];
  product_count?: number;
};

export type AdminStats = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

class AdminService {
  // Get all designer applications with their status
  async getDesignerApplications(): Promise<{ success: boolean; data?: DesignerApplication[]; error?: string }> {
    try {
      const { data: designers, error } = await supabase
        .from('designers')
        .select(`
          *,
          designer_products(count)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching designer applications:', error);
        return { success: false, error: error.message };
      }

      // Transform the data to include product count
      const applicationsWithCount = designers?.map(designer => ({
        ...designer,
        product_count: designer.designer_products?.[0]?.count || 0
      })) || [];

      return { success: true, data: applicationsWithCount };
    } catch (error) {
      console.error('Error in getDesignerApplications:', error);
      return { success: false, error: 'Failed to fetch designer applications' };
    }
  }

  // Get applications by status
  async getApplicationsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<{ success: boolean; data?: DesignerApplication[]; error?: string }> {
    try {
      const { data: designers, error } = await supabase
        .from('designers')
        .select(`
          *,
          designer_products(count)
        `)
        .eq('status', status)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications by status:', error);
        return { success: false, error: error.message };
      }

      const applicationsWithCount = designers?.map(designer => ({
        ...designer,
        product_count: designer.designer_products?.[0]?.count || 0
      })) || [];

      return { success: true, data: applicationsWithCount };
    } catch (error) {
      console.error('Error in getApplicationsByStatus:', error);
      return { success: false, error: 'Failed to fetch applications by status' };
    }
  }

  // Get detailed designer application with products
  async getDesignerApplicationDetails(designerId: string): Promise<{ success: boolean; data?: DesignerApplication; error?: string }> {
    try {
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('*')
        .eq('id', designerId)
        .single();

      if (designerError) {
        console.error('Error fetching designer details:', designerError);
        return { success: false, error: designerError.message };
      }

      const { data: products, error: productsError } = await supabase
        .from('designer_products')
        .select('*')
        .eq('designer_id', designerId);

      if (productsError) {
        console.error('Error fetching designer products:', productsError);
        return { success: false, error: productsError.message };
      }

      return {
        success: true,
        data: {
          ...designer,
          products: products || [],
          product_count: products?.length || 0
        }
      };
    } catch (error) {
      console.error('Error in getDesignerApplicationDetails:', error);
      return { success: false, error: 'Failed to fetch designer details' };
    }
  }

  // Approve a designer application
  async approveDesigner(designerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('designers')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', designerId);

      if (error) {
        console.error('Error approving designer:', error);
        return { success: false, error: error.message };
      }

      // Activate all products for the approved designer
      const { error: productsError } = await supabase
        .from('designer_products')
        .update({ is_active: true })
        .eq('designer_id', designerId);

      if (productsError) {
        console.error('Error activating designer products:', productsError);
        // Don't fail the approval if product activation fails
        console.warn('Designer approved but products may not be active');
      }

      return { success: true };
    } catch (error) {
      console.error('Error in approveDesigner:', error);
      return { success: false, error: 'Failed to approve designer' };
    }
  }

  // Reject a designer application
  async rejectDesigner(designerId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      };

      if (reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('designers')
        .update(updateData)
        .eq('id', designerId);

      if (error) {
        console.error('Error rejecting designer:', error);
        return { success: false, error: error.message };
      }

      // Deactivate all products for the rejected designer
      const { error: productsError } = await supabase
        .from('designer_products')
        .update({ is_active: false })
        .eq('designer_id', designerId);

      if (productsError) {
        console.error('Error deactivating designer products:', productsError);
        // Don't fail the rejection if product deactivation fails
      }

      return { success: true };
    } catch (error) {
      console.error('Error in rejectDesigner:', error);
      return { success: false, error: 'Failed to reject designer' };
    }
  }

  // Get admin dashboard stats
  async getAdminStats(): Promise<{ success: boolean; data?: AdminStats; error?: string }> {
    try {
      const { data: designers, error } = await supabase
        .from('designers')
        .select('status');

      if (error) {
        console.error('Error fetching admin stats:', error);
        return { success: false, error: error.message };
      }

      const stats = designers?.reduce((acc, designer) => {
        acc.total++;
        switch (designer.status) {
          case 'pending':
            acc.pending++;
            break;
          case 'approved':
            acc.approved++;
            break;
          case 'rejected':
            acc.rejected++;
            break;
        }
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, total: 0 }) || { pending: 0, approved: 0, rejected: 0, total: 0 };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      return { success: false, error: 'Failed to fetch admin stats' };
    }
  }

  // Get approved designers for the shop
  async getApprovedDesigners(): Promise<{ success: boolean; data?: Designer[]; error?: string }> {
    try {
      const { data: designers, error } = await supabase
        .from('designers')
        .select('*')
        .eq('status', 'approved')
        .order('brand_name');

      if (error) {
        console.error('Error fetching approved designers:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: designers || [] };
    } catch (error) {
      console.error('Error in getApprovedDesigners:', error);
      return { success: false, error: 'Failed to fetch approved designers' };
    }
  }

  // Get active products from approved designers for the shop
  async getShopProducts(): Promise<{ success: boolean; data?: (DesignerProduct & { designer: Designer })[]; error?: string }> {
    try {
      const { data: products, error } = await supabase
        .from('designer_products')
        .select(`
          *,
          designer:designers(*)
        `)
        .eq('is_active', true)
        .eq('designers.status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shop products:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: products || [] };
    } catch (error) {
      console.error('Error in getShopProducts:', error);
      return { success: false, error: 'Failed to fetch shop products' };
    }
  }

  // Reset designer status back to draft (for resubmission)
  async resetDesignerStatus(designerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('designers')
        .update({
          status: 'draft',
          reviewed_at: null,
          rejection_reason: null
        })
        .eq('id', designerId);

      if (error) {
        console.error('Error resetting designer status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in resetDesignerStatus:', error);
      return { success: false, error: 'Failed to reset designer status' };
    }
  }

  // Withdrawal Management Methods
  async getPendingWithdrawals(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: withdrawals, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          designers!wallet_transactions_designer_id_fkey(brand_name, email, iban),
          designer_wallets!wallet_transactions_wallet_id_fkey(balance)
        `)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending withdrawals:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: withdrawals || [] };
    } catch (error) {
      console.error('Error in getPendingWithdrawals:', error);
      return { success: false, error: 'Failed to fetch pending withdrawals' };
    }
  }

  async getAllWithdrawals(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: withdrawals, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          designers!wallet_transactions_designer_id_fkey(brand_name, email, iban),
          designer_wallets!wallet_transactions_wallet_id_fkey(balance)
        `)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching all withdrawals:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: withdrawals || [] };
    } catch (error) {
      console.error('Error in getAllWithdrawals:', error);
      return { success: false, error: 'Failed to fetch withdrawals' };
    }
  }

  async approveWithdrawal(transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First get the transaction details
      const { data: transaction, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .single();

      if (fetchError || !transaction) {
        return { success: false, error: 'Withdrawal transaction not found or already processed' };
      }

      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Error approving withdrawal:', updateError);
        return { success: false, error: updateError.message };
      }

      // Update wallet - move from pending to withdrawn
      const withdrawalAmount = Math.abs(transaction.amount);
      
      // First get current wallet values
      const { data: currentWallet, error: walletFetchError } = await supabase
        .from('designer_wallets')
        .select('total_withdrawn, pending_balance')
        .eq('id', transaction.wallet_id)
        .single();

      if (walletFetchError) {
        console.error('Error fetching wallet data:', walletFetchError);
        return { success: false, error: 'Failed to fetch wallet data' };
      }

      // Update wallet with calculated values
      const { error: walletError } = await supabase
        .from('designer_wallets')
        .update({
          total_withdrawn: (parseFloat(currentWallet.total_withdrawn) + withdrawalAmount).toFixed(2),
          pending_balance: (parseFloat(currentWallet.pending_balance) - withdrawalAmount).toFixed(2),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.wallet_id);

      if (walletError) {
        console.error('Error updating wallet after withdrawal approval:', walletError);
        // Don't fail the approval, but log the error
      }

      return { success: true };
    } catch (error) {
      console.error('Error in approveWithdrawal:', error);
      return { success: false, error: 'Failed to approve withdrawal' };
    }
  }

  async rejectWithdrawal(transactionId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First get the transaction details
      const { data: transaction, error: fetchError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .single();

      if (fetchError || !transaction) {
        return { success: false, error: 'Withdrawal transaction not found or already processed' };
      }

      // Update transaction status to failed with reason
      const { error: updateError } = await supabase
        .from('wallet_transactions')
        .update({
          status: 'failed',
          description: reason ? `${transaction.description} - Rejected: ${reason}` : `${transaction.description} - Rejected`,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Error rejecting withdrawal:', updateError);
        return { success: false, error: updateError.message };
      }

      // Return money to designer's balance
      const withdrawalAmount = Math.abs(transaction.amount);
      
      // First get current wallet values
      const { data: currentWallet, error: walletFetchError } = await supabase
        .from('designer_wallets')
        .select('balance, pending_balance')
        .eq('id', transaction.wallet_id)
        .single();

      if (walletFetchError) {
        console.error('Error fetching wallet data for rejection:', walletFetchError);
        return { success: false, error: 'Failed to fetch wallet data' };
      }

      // Update wallet with calculated values
      const { error: walletError } = await supabase
        .from('designer_wallets')
        .update({
          balance: (parseFloat(currentWallet.balance) + withdrawalAmount).toFixed(2),
          pending_balance: (parseFloat(currentWallet.pending_balance) - withdrawalAmount).toFixed(2),
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.wallet_id);

      if (walletError) {
        console.error('Error updating wallet after withdrawal rejection:', walletError);
        return { success: false, error: 'Failed to return funds to designer balance' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in rejectWithdrawal:', error);
      return { success: false, error: 'Failed to reject withdrawal' };
    }
  }

  // Influencer Withdrawal Management Methods
  async getPendingInfluencerWithdrawals(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: withdrawals, error } = await supabase
        .from('influencers_wallet_transactions')
        .select(`
          *,
          influencers:tiktok_open_id (tiktok_display_name, email)
        `)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending influencer withdrawals:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: withdrawals || [] };
    } catch (error) {
      console.error('Error in getPendingInfluencerWithdrawals:', error);
      return { success: false, error: 'Failed to fetch influencer withdrawals' };
    }
  }

  async getAllInfluencerWithdrawals(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data: withdrawals, error } = await supabase
        .from('influencers_wallet_transactions')
        .select(`
          *,
          influencers:tiktok_open_id (tiktok_display_name, email)
        `)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching all influencer withdrawals:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: withdrawals || [] };
    } catch (error) {
      console.error('Error in getAllInfluencerWithdrawals:', error);
      return { success: false, error: 'Failed to fetch influencer withdrawals' };
    }
  }

  async approveInfluencerWithdrawal(transactionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('influencers_wallet_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .single();
      if (fetchError || !transaction) {
        return { success: false, error: 'Withdrawal transaction not found or already processed' };
      }
      // Update transaction status to completed
      const { error: updateError } = await supabase
        .from('influencers_wallet_transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
      if (updateError) {
        console.error('Error approving influencer withdrawal:', updateError);
        return { success: false, error: updateError.message };
      }
      // No further wallet update needed (balance already deducted on request)
      return { success: true };
    } catch (error) {
      console.error('Error in approveInfluencerWithdrawal:', error);
      return { success: false, error: 'Failed to approve influencer withdrawal' };
    }
  }

  async rejectInfluencerWithdrawal(transactionId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the transaction
      const { data: transaction, error: fetchError } = await supabase
        .from('influencers_wallet_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .single();
      if (fetchError || !transaction) {
        return { success: false, error: 'Withdrawal transaction not found or already processed' };
      }
      // Update transaction status to failed with reason
      const { error: updateError } = await supabase
        .from('influencers_wallet_transactions')
        .update({
          status: 'failed',
          description: reason ? `${transaction.description} - Rejected: ${reason}` : `${transaction.description} - Rejected`,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
      if (updateError) {
        console.error('Error rejecting influencer withdrawal:', updateError);
        return { success: false, error: updateError.message };
      }
      // Return money to influencer's balance
      const withdrawalAmount = Math.abs(transaction.amount);
      const { data: wallet, error: walletFetchError } = await supabase
        .from('influencers_wallets')
        .select('balance')
        .eq('tiktok_open_id', transaction.tiktok_open_id)
        .single();
      if (walletFetchError) {
        console.error('Error fetching influencer wallet for rejection:', walletFetchError);
        return { success: false, error: 'Failed to fetch influencer wallet' };
      }
      const { error: walletError } = await supabase
        .from('influencers_wallets')
        .update({
          balance: (parseFloat(wallet.balance) + withdrawalAmount).toFixed(2),
          updated_at: new Date().toISOString()
        })
        .eq('tiktok_open_id', transaction.tiktok_open_id);
      if (walletError) {
        console.error('Error updating influencer wallet after withdrawal rejection:', walletError);
        return { success: false, error: 'Failed to return funds to influencer balance' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error in rejectInfluencerWithdrawal:', error);
      return { success: false, error: 'Failed to reject influencer withdrawal' };
    }
  }
}

export const adminService = new AdminService(); 