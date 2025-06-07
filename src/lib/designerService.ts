import { supabase } from './supabase';
import type { Designer, DesignerAuth, DesignerProfile } from './supabase';

// Extended types for the dashboard
export type DesignerProfileForm = {
  brandName: string;
  shortDescription: string;
  longDescription: string;
  city: string;
  yearFounded: number;
  email: string;
  logoUrl: string;
  secondaryLogoUrl: string;
  instagramHandle: string;
  instagramVerified: boolean;
  instagramUserId?: string;
  instagramAccessToken?: string;
  tiktokHandle: string;
  website: string;
  specialties: string[];
  fulfillment?: 'baguri' | 'designer';
  sellingAs?: 'PFA' | 'SRL' | 'not_registered';
  iban?: string;
  ownsRights?: boolean;
  acceptTerms?: boolean;
  wantsAiPhotos?: boolean;
};

export type ProductColor = {
  name: string;
  images: string[];
};

export type DesignerProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stockStatus: 'in_stock' | 'made_to_order' | 'coming_soon';
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
};

export type DesignerWallet = {
  id: string;
  designerId: string;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingBalance: number;
  createdAt: string;
  updatedAt: string;
};

export type WalletTransaction = {
  id: string;
  walletId: string;
  type: 'sale' | 'withdrawal' | 'refund' | 'adjustment';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  orderId?: string;
  stripeTransferId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CommissionTier = {
  name: string;
  baguriFeePct: number;
  designerEarningsPct: number;
  minSales: number;
  maxSales?: number;
  salesNeeded?: number;
};

export type DesignerDashboardData = {
  profile: DesignerProfileForm;
  products: DesignerProduct[];
  wallet: DesignerWallet | null;
  salesTotal: number;
  currentTier: CommissionTier;
  nextTier: CommissionTier | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt: string | null;
  completionPercentage: number;
};

class DesignerService {
  // Commission tier definitions
  private getCommissionTiers(): CommissionTier[] {
    return [
      {
        name: 'Bronze',
        baguriFeePct: 30,
        designerEarningsPct: 70,
        minSales: 0,
        maxSales: 99.99
      },
      {
        name: 'Silver', 
        baguriFeePct: 25,
        designerEarningsPct: 75,
        minSales: 100,
        maxSales: 999.99
      },
      {
        name: 'Gold',
        baguriFeePct: 20,
        designerEarningsPct: 80,
        minSales: 1000,
        maxSales: 9999.99
      },
      {
        name: 'Platinum',
        baguriFeePct: 17,
        designerEarningsPct: 83,
        minSales: 10000
      }
    ];
  }

  // Get current commission tier based on sales total
  getCurrentCommissionTier(salesTotal: number): CommissionTier {
    const tiers = this.getCommissionTiers();
    
    for (const tier of tiers) {
      if (salesTotal >= tier.minSales && (!tier.maxSales || salesTotal <= tier.maxSales)) {
        return tier;
      }
    }
    
    // Default to highest tier if sales exceed all thresholds
    return tiers[tiers.length - 1];
  }

  // Get next commission tier
  getNextCommissionTier(salesTotal: number): CommissionTier | null {
    const tiers = this.getCommissionTiers();
    const currentTier = this.getCurrentCommissionTier(salesTotal);
    
    const currentIndex = tiers.findIndex(t => t.name === currentTier.name);
    if (currentIndex < tiers.length - 1) {
      const nextTier = tiers[currentIndex + 1];
      return {
        ...nextTier,
        salesNeeded: nextTier.minSales - salesTotal
      };
    }
    
    return null; // Already at highest tier
  }

  // Get designer profile by user ID (from auth)
  async getDesignerByUserId(userId: string): Promise<DesignerProfile | null> {
    try {
      const { data: authData, error: authError } = await supabase
        .from('designer_auth')
        .select(`
          *,
          designers (*)
        `)
        .eq('user_id', userId)
        .single();

      if (authError || !authData || !authData.designers) {
        return null;
      }

      return {
        ...authData.designers,
        auth: authData
      } as DesignerProfile;
    } catch (error) {
      console.error('Error fetching designer by user ID:', error);
      return null;
    }
  }

  // Get complete dashboard data for a designer
  async getDashboardData(userId: string): Promise<DesignerDashboardData | null> {
    try {
      // Get user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return null;
      }

      // Get designer auth record
      const { data: designerAuth, error: authError } = await supabase
        .from('designer_auth')
        .select('designer_id')
        .eq('user_id', userId)
        .single();

      if (authError || !designerAuth) {
        console.error('Error getting designer auth:', authError);
        return null;
      }

      // Get designer profile with sales total
      const { data: designerProfile, error: profileError } = await supabase
        .from('designers')
        .select('*, sales_total')
        .eq('id', designerAuth.designer_id)
        .single();

      if (profileError || !designerProfile) {
        console.error('Error getting designer profile:', profileError);
        return null;
      }

      // Get designer products
      const { data: products, error: productsError } = await supabase
        .from('designer_products')
        .select('*')
        .eq('designer_id', designerAuth.designer_id);

      if (productsError) {
        console.error('Error getting designer products:', productsError);
      }

      // Get wallet data
      const wallet = await this.getDesignerWallet(designerAuth.designer_id);
      
      // Calculate commission tiers
      const salesTotal = parseFloat(designerProfile.sales_total) || 0;
      const currentTier = this.getCurrentCommissionTier(salesTotal);
      const nextTier = this.getNextCommissionTier(salesTotal);
      
      // Convert database data to form format
      const profile: DesignerProfileForm = {
        brandName: designerProfile.brand_name || '',
        shortDescription: designerProfile.short_description || '',
        longDescription: designerProfile.long_description || designerProfile.description || '',
        city: designerProfile.city || '',
        yearFounded: designerProfile.year_founded || new Date().getFullYear(),
        email: user?.email || designerProfile.email || '', // Always use auth user's email as source of truth
        logoUrl: designerProfile.logo_url || '',
        secondaryLogoUrl: designerProfile.secondary_logo_url || '',
        instagramHandle: designerProfile.instagram || '',
        instagramVerified: designerProfile.instagram_verified || false,
        instagramUserId: designerProfile.instagram_user_id,
        instagramAccessToken: designerProfile.instagram_access_token,
        tiktokHandle: designerProfile.tiktok || '',
        website: designerProfile.website || '',
        specialties: designerProfile.specialties || [],
        fulfillment: designerProfile.fulfillment as 'baguri' | 'designer' | undefined,
        sellingAs: designerProfile.selling_as as 'PFA' | 'SRL' | 'not_registered' | undefined,
        iban: designerProfile.iban || '',
        ownsRights: designerProfile.owns_rights || false,
        acceptTerms: designerProfile.accept_terms || false,
        wantsAiPhotos: designerProfile.wants_ai_photos || false,
      };

      // Convert products
      const dashboardProducts: DesignerProduct[] = (products || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: parseFloat(p.price) || 0,
        images: p.images || [],
        sizes: p.sizes || [],
        colors: p.colors || [{ name: '', images: [] }],
        stockStatus: p.stock_status as 'in_stock' | 'made_to_order' | 'coming_soon',
        stockQuantity: parseFloat(p.stock_quantity) || 0,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      // Calculate completion percentage
      const completionPercentage = this.calculateCompletionPercentage(profile, dashboardProducts);

      return {
        profile,
        products: dashboardProducts,
        wallet,
        salesTotal,
        currentTier,
        nextTier,
        status: designerProfile.status as 'draft' | 'submitted' | 'approved' | 'rejected',
        submittedAt: designerProfile.submitted_at,
        completionPercentage,
      };
    } catch (error: any) {
      console.error('Error getting dashboard data:', error);
      return null;
    }
  }

  // Save designer profile
  async saveDesignerProfile(userId: string, profileData: DesignerProfileForm): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the current auth user to ensure email sync
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      let designerProfile = await this.getDesignerByUserId(userId);
      
      // If no designer profile exists, create one
      if (!designerProfile) {
        // Use the auth user's email as the source of truth
        const createResult = await this.createDesignerProfile(userId, user.email || profileData.email, profileData.brandName || 'New Brand');
        if (!createResult.success) {
          return { success: false, error: createResult.error };
        }
        // Fetch the newly created profile
        designerProfile = await this.getDesignerByUserId(userId);
        if (!designerProfile) {
          return { success: false, error: 'Failed to create designer profile' };
        }
      }

      // Update designers table - always sync email with auth user
      const { error: updateError } = await supabase
        .from('designers')
        .update({
          brand_name: profileData.brandName,
          short_description: profileData.shortDescription,
          long_description: profileData.longDescription,
          description: profileData.longDescription, // Keep for backward compatibility
          city: profileData.city,
          year_founded: profileData.yearFounded,
          email: user.email, // Always sync with auth user's email
          logo_url: profileData.logoUrl,
          secondary_logo_url: profileData.secondaryLogoUrl,
          instagram: profileData.instagramHandle,
          instagram_verified: profileData.instagramVerified,
          instagram_user_id: profileData.instagramUserId,
          instagram_access_token: profileData.instagramAccessToken,
          tiktok: profileData.tiktokHandle,
          website: profileData.website,
          specialties: profileData.specialties,
          fulfillment: profileData.fulfillment,
          selling_as: profileData.sellingAs,
          iban: profileData.iban,
          owns_rights: profileData.ownsRights,
          accept_terms: profileData.acceptTerms,
          wants_ai_photos: profileData.wantsAiPhotos,
        })
        .eq('id', designerProfile.id);

      if (updateError) {
        console.error('Error updating designer profile:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error saving designer profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Save designer products
  async saveDesignerProducts(userId: string, products: DesignerProduct[]): Promise<{ success: boolean; error?: string }> {
    try {
      const designerProfile = await this.getDesignerByUserId(userId);
      if (!designerProfile) {
        return { success: false, error: 'Designer profile not found' };
      }

      // Get existing products to determine which to update/insert/delete
      const { data: existingProducts } = await supabase
        .from('designer_products')
        .select('id')
        .eq('designer_id', designerProfile.id);

      const existingIds = new Set(existingProducts?.map(p => p.id) || []);

      // Process each product
      for (const product of products) {
        const productData = {
          designer_id: designerProfile.id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          stock_status: product.stockStatus,
          stock_quantity: product.stockQuantity.toString(),
        };

        // Check if this is an existing product (has a valid UUID that exists in DB)
        const isExistingProduct = existingIds.has(product.id);

        if (isExistingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('designer_products')
            .update(productData)
            .eq('id', product.id);

          if (updateError) {
            console.error('Error updating product:', updateError);
            return { success: false, error: updateError.message };
          }
        } else {
          // Insert new product (let database generate UUID)
          const { error: insertError } = await supabase
            .from('designer_products')
            .insert(productData);

          if (insertError) {
            console.error('Error inserting product:', insertError);
            return { success: false, error: insertError.message };
          }
        }
      }

      // Delete products that are no longer in the list (only check against valid existing IDs)
      const currentValidIds = products
        .map(p => p.id)
        .filter(id => existingIds.has(id));
      
      const toDelete = Array.from(existingIds).filter(id => !currentValidIds.includes(id));
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('designer_products')
          .delete()
          .in('id', toDelete);

        if (deleteError) {
          console.error('Error deleting products:', deleteError);
          return { success: false, error: deleteError.message };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error saving designer products:', error);
      return { success: false, error: error.message };
    }
  }

  // Submit designer profile for review
  async submitForReview(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const designerProfile = await this.getDesignerByUserId(userId);
      if (!designerProfile) {
        return { success: false, error: 'Designer profile not found' };
      }

      // Get the current auth user to get the email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('designers')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', designerProfile.id);

      if (error) {
        console.error('Error submitting for review:', error);
        return { success: false, error: error.message };
      }

      // Send email notification
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template: 'designer-review-submitted',
            email: user.email,
            brandName: designerProfile.brand_name || 'Your Brand',
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email notification');
          // Don't fail the submission if email fails
        } else {
          console.log('Email notification sent successfully');
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the submission if email fails
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting for review:', error);
      return { success: false, error: error.message };
    }
  }

  // Create designer profile for new user
  async createDesignerProfile(userId: string, email: string, brandName: string): Promise<{ success: boolean; error?: string; designerId?: string }> {
    try {
      // Get the current auth user to ensure we use the correct email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // First create the designer record - always use auth user's email
      const { data: designerData, error: designerError } = await supabase
        .from('designers')
        .insert({
          brand_name: brandName,
          email: user.email, // Always use auth user's email as source of truth
          status: 'draft',
          sales_total: 0.00, // Initialize with 0 sales
        })
        .select()
        .single();

      if (designerError || !designerData) {
        console.error('Error creating designer:', designerError);
        return { success: false, error: designerError?.message || 'Failed to create designer' };
      }

      // Then create the auth link
      const { error: authError } = await supabase
        .from('designer_auth')
        .insert({
          user_id: userId,
          designer_id: designerData.id,
          role: 'designer',
          is_approved: false,
        });

      if (authError) {
        console.error('Error creating designer auth:', authError);
        // Clean up the designer record if auth creation fails
        await supabase.from('designers').delete().eq('id', designerData.id);
        return { success: false, error: authError.message };
      }

      return { success: true, designerId: designerData.id };
    } catch (error: any) {
      console.error('Error creating designer profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate completion percentage
  private calculateCompletionPercentage(profile: DesignerProfileForm, products: DesignerProduct[]): number {
    let completed = 0;
    const coreFields = 6; // 6 required fields for submission
    const totalFields = 8; // 8 total fields for 100%

    // Core required fields (6 fields = 75% total, need 5 for submission)
    if (profile.brandName.trim()) completed++;
    if (profile.shortDescription.trim()) completed++;
    if (profile.logoUrl.trim()) completed++;
    if (profile.city.trim()) completed++;
    if (profile.yearFounded && profile.yearFounded > 1900) completed++;
    if (profile.instagramHandle.trim()) completed++;

    // Optional fields for 100% completion (2 additional fields = 25%)
    if (profile.secondaryLogoUrl.trim()) completed++;
    if (profile.tiktokHandle?.trim()) completed++;

    // Calculate percentage: 8 fields = 100%, 6 fields = 75%
    return Math.round((completed / totalFields) * 100);
  }

  // Upload file to Supabase storage
  async uploadFile(file: File, bucket: 'logos' | 'product-images', userId: string, fileName?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${userId}/${finalFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { success: true, url: data.publicUrl };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  }

  // Get designer wallet
  async getDesignerWallet(designerId: string): Promise<DesignerWallet | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('designer_wallets')
        .select('*')
        .eq('designer_id', designerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No wallet found, create one
          return await this.createDesignerWallet(designerId);
        }
        console.error('Error fetching designer wallet:', error);
        return null;
      }

      return {
        id: wallet.id,
        designerId: wallet.designer_id,
        balance: parseFloat(wallet.balance) || 0,
        totalEarnings: parseFloat(wallet.total_earnings) || 0,
        totalWithdrawn: parseFloat(wallet.total_withdrawn) || 0,
        pendingBalance: parseFloat(wallet.pending_balance) || 0,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      };
    } catch (error) {
      console.error('Error getting designer wallet:', error);
      return null;
    }
  }

  // Create designer wallet
  async createDesignerWallet(designerId: string): Promise<DesignerWallet | null> {
    try {
      const { data: wallet, error } = await supabase
        .from('designer_wallets')
        .insert({
          designer_id: designerId,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
          pending_balance: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating designer wallet:', error);
        return null;
      }

      return {
        id: wallet.id,
        designerId: wallet.designer_id,
        balance: parseFloat(wallet.balance) || 0,
        totalEarnings: parseFloat(wallet.total_earnings) || 0,
        totalWithdrawn: parseFloat(wallet.total_withdrawn) || 0,
        pendingBalance: parseFloat(wallet.pending_balance) || 0,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      };
    } catch (error) {
      console.error('Error creating designer wallet:', error);
      return null;
    }
  }

  // Add earnings to designer wallet (called when a product is sold)
  async addEarnings(designerId: string, amount: number, orderId: string, description: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get or create wallet
      let wallet = await this.getDesignerWallet(designerId);
      if (!wallet) {
        wallet = await this.createDesignerWallet(designerId);
        if (!wallet) {
          return { success: false, error: 'Failed to create wallet' };
        }
      }

      // Start a transaction
      const { data, error } = await supabase.rpc('add_designer_earnings', {
        p_designer_id: designerId,
        p_amount: amount,
        p_order_id: orderId,
        p_description: description
      });

      if (error) {
        console.error('Error adding earnings:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error adding earnings:', error);
      return { success: false, error: error.message };
    }
  }

  // Request withdrawal with IBAN information
  async requestWithdrawal(designerId: string, amount: number): Promise<{ success: boolean; error?: string }> {
    try {
      const wallet = await this.getDesignerWallet(designerId);
      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      if (amount > wallet.balance) {
        return { success: false, error: 'Insufficient balance' };
      }

      if (amount < 50) {
        return { success: false, error: 'Minimum withdrawal amount is 50 RON' };
      }

      // Get designer info for IBAN
      const { data: designer, error: designerError } = await supabase
        .from('designers')
        .select('brand_name, email, iban')
        .eq('id', designerId)
        .single();

      if (designerError || !designer) {
        return { success: false, error: 'Designer information not found' };
      }

      if (!designer.iban) {
        return { success: false, error: 'IBAN not found. Please add your IBAN before requesting withdrawal.' };
      }

      // Create withdrawal transaction with metadata
      const { error } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          designer_id: designerId,
          type: 'withdrawal',
          amount: -amount, // Negative for withdrawal
          status: 'pending',
          description: `Withdrawal request of ${amount} RON to ${designer.iban.slice(-4)}`,
        });

      if (error) {
        console.error('Error creating withdrawal request:', error);
        return { success: false, error: error.message };
      }

      // Update wallet balance - move money from balance to pending_balance
      const { error: walletUpdateError } = await supabase
        .from('designer_wallets')
        .update({
          balance: (wallet.balance - amount).toFixed(2),
          pending_balance: (wallet.pendingBalance + amount).toFixed(2),
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (walletUpdateError) {
        console.error('Error updating wallet for withdrawal:', walletUpdateError);
        return { success: false, error: 'Failed to update wallet balance' };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      return { success: false, error: error.message };
    }
  }

  // Get wallet transactions
  async getWalletTransactions(designerId: string, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      const wallet = await this.getDesignerWallet(designerId);
      if (!wallet) {
        return [];
      }

      const { data: transactions, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        return [];
      }

      return (transactions || []).map(t => ({
        id: t.id,
        walletId: t.wallet_id,
        type: t.type as 'sale' | 'withdrawal' | 'refund' | 'adjustment',
        amount: parseFloat(t.amount) || 0,
        status: t.status as 'pending' | 'completed' | 'failed',
        description: t.description || '',
        orderId: t.order_id,
        stripeTransferId: t.stripe_transfer_id,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return [];
    }
  }

  // Process withdrawal
  async processWithdrawal(designerId: string, amount: number, stripeTransferId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('process_withdrawal', {
        p_designer_id: designerId,
        p_amount: amount,
        p_stripe_transfer_id: stripeTransferId
      });

      if (error) {
        console.error('Error processing withdrawal:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      return { success: false, error: error.message };
    }
  }

  // Get designer sales total
  async getDesignerSalesTotal(designerId: string): Promise<number> {
    try {
      const { data: designer, error } = await supabase
        .from('designers')
        .select('sales_total')
        .eq('id', designerId)
        .single();

      if (error) {
        console.error('Error fetching sales total:', error);
        return 0;
      }

      return parseFloat(designer.sales_total) || 0;
    } catch (error) {
      console.error('Error getting sales total:', error);
      return 0;
    }
  }

  // Get designer sales and earnings summary
  async getDesignerSalesSummary(designerId: string): Promise<{
    totalSales: number;
    totalEarnings: number;
    orderCount: number;
    averageOrderValue: number;
    currentTier: CommissionTier;
    nextTier: CommissionTier | null;
  }> {
    try {
      // Get sales total
      const salesTotal = await this.getDesignerSalesTotal(designerId);
      
      // Get wallet data
      const wallet = await this.getDesignerWallet(designerId);
      
      // Get order count from order_items
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select('total_price')
        .eq('designer_id', designerId);

      if (orderError) {
        console.error('Error fetching order items:', orderError);
        throw orderError;
      }

      const orderCount = orderItems?.length || 0;
      const averageOrderValue = orderCount > 0 ? salesTotal / orderCount : 0;
      
      // Get commission tiers
      const currentTier = this.getCurrentCommissionTier(salesTotal);
      const nextTier = this.getNextCommissionTier(salesTotal);

      return {
        totalSales: salesTotal,
        totalEarnings: wallet?.totalEarnings || 0,
        orderCount,
        averageOrderValue,
        currentTier,
        nextTier
      };
    } catch (error) {
      console.error('Error getting designer sales summary:', error);
      throw error;
    }
  }

  // Instagram OAuth verification methods
  async initiateInstagramOAuth(userId: string): Promise<{ success: boolean; authUrl?: string; error?: string }> {
    try {
      const instagramAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
      const instagramAppSecret = process.env.INSTAGRAM_APP_SECRET;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      // Check if Instagram OAuth is properly configured
      if (!instagramAppId || !instagramAppSecret || !appUrl) {
        console.error('Instagram OAuth not configured. Missing environment variables:', {
          hasAppId: !!instagramAppId,
          hasAppSecret: !!instagramAppSecret,
          hasAppUrl: !!appUrl
        });
        
        return { 
          success: false, 
          error: 'Instagram verification is not currently available. Please contact support for assistance.' 
        };
      }

      const redirectUri = `${appUrl}/api/auth/instagram/callback`;
      
      // Store user ID in session/state for callback verification
      const state = btoa(JSON.stringify({ userId, timestamp: Date.now() }));
      
      const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${instagramAppId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=user_profile,user_media&` +
        `response_type=code&` +
        `state=${state}`;

      return { success: true, authUrl };
    } catch (error) {
      console.error('Error initiating Instagram OAuth:', error);
      return { 
        success: false, 
        error: 'Failed to initiate Instagram verification. Please try again later.' 
      };
    }
  }

  async verifyInstagramCallback(code: string, state: string): Promise<{ success: boolean; error?: string; instagramData?: any }> {
    try {
      // Decode and verify state
      const stateData = JSON.parse(atob(state));
      const { userId } = stateData;

      // Exchange code for access token
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!,
          client_secret: process.env.INSTAGRAM_APP_SECRET!,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
          code
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      const { access_token, user_id } = tokenData;

      // Get user profile from Instagram
      const profileResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
      );

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch Instagram profile');
      }

      const profileData = await profileResponse.json();

      // Update designer profile with verified Instagram data
      const { error: updateError } = await supabase
        .from('designers')
        .update({
          instagram: `@${profileData.username}`,
          instagram_verified: true,
          instagram_user_id: user_id.toString(),
          instagram_access_token: access_token,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await this.getDesignerByUserId(userId))?.id);

      if (updateError) {
        throw updateError;
      }

      return {
        success: true,
        instagramData: {
          username: profileData.username,
          userId: user_id,
          verified: true
        }
      };
    } catch (error) {
      console.error('Error verifying Instagram callback:', error);
      return { success: false, error: 'Failed to verify Instagram account' };
    }
  }

  async revokeInstagramVerification(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const designer = await this.getDesignerByUserId(userId);
      if (!designer) {
        return { success: false, error: 'Designer not found' };
      }

      // Clear Instagram verification data
      const { error: updateError } = await supabase
        .from('designers')
        .update({
          instagram_verified: false,
          instagram_user_id: null,
          instagram_access_token: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', designer.id);

      if (updateError) {
        throw updateError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error revoking Instagram verification:', error);
      return { success: false, error: 'Failed to revoke Instagram verification' };
    }
  }

  async checkInstagramVerification(userId: string, instagramHandle: string): Promise<{ success: boolean; verified: boolean; error?: string }> {
    try {
      const designer = await this.getDesignerByUserId(userId);
      if (!designer) {
        return { success: false, verified: false, error: 'Designer not found' };
      }

      // Check if the Instagram handle matches the verified account
      const normalizedHandle = instagramHandle.replace('@', '');
      const verifiedHandle = designer.instagram?.replace('@', '');

      if (designer.instagram_verified && verifiedHandle === normalizedHandle) {
        return { success: true, verified: true };
      }

      return { success: true, verified: false };
    } catch (error) {
      console.error('Error checking Instagram verification:', error);
      return { success: false, verified: false, error: 'Failed to check verification status' };
    }
  }
}

export const designerService = new DesignerService(); 