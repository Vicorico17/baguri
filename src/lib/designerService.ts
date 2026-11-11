import {designerFetch} from './designerFetch';
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
  cui?: string; // Romanian fiscal code (CUI) - required for Silver+ tier and withdrawals
  tags?: string[]; // Product specialty tags added after approval
  currentTier?: string; // Current tier level (bronze, silver, gold, platinum)
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

// Types for influencer item requests (reuse if imported)
export type InfluencerItemRequest = {
  id: string;
  influencer_open_id: string;
  designer_id: string;
  product_id: string;
  delivery_address: any;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
  influencer?: any;
  product?: any;
};

class DesignerService {
  // Commission tier definitions
  public getCommissionTiers(): CommissionTier[] {
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
        .select('*, sales_total, current_tier')
        .eq('id', designerAuth.designer_id)
        .single();

      if (profileError || !designerProfile) {
        console.error('Error getting designer profile:', profileError);
        return null;
      }

      console.log('Fetched designerProfile from DB:', designerProfile);

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
      
      // Use the current_tier from the database directly
      const currentTier = this.getCommissionTiers().find(tier => tier.name.toLowerCase() === (designerProfile.current_tier || 'bronze').toLowerCase()) || this.getCommissionTiers()[0];
      const salesTotal = parseFloat(designerProfile.sales_total) || 0;
      const nextTier = this.getNextCommissionTier(salesTotal);
      
      console.log('Calculated currentTier object:', currentTier);

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
        cui: designerProfile.cui || '',
        tags: designerProfile.tags || [],
        currentTier: designerProfile.current_tier || 'bronze',
        fulfillment: designerProfile.fulfillment as 'baguri' | 'designer' | undefined,
        sellingAs: designerProfile.selling_as as 'PFA' | 'SRL' | 'not_registered' | undefined,
        iban: designerProfile.iban,
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

      const finalDashboardData = {
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

      console.log('Final dashboard data before returning:', finalDashboardData);
      return finalDashboardData;
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
          yearFounded: profileData.yearFounded,
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
          cui: profileData.cui,
          tags: profileData.tags,
          current_tier: profileData.currentTier,
          fulfillment: profileData.fulfillment,
          selling_as: profileData.sellingAs,
          iban: profileData.iban,
          ownsRights: profileData.ownsRights,
          acceptTerms: profileData.acceptTerms,
          wantsAiPhotos: profileData.wantsAiPhotos,
        })
        .eq('id', designerProfile.id);

      if (updateError) {
        console.error('Error updating designer profile:', updateError);
        return { success: false, error: updateError.message };
      }

      // Check for automatic tier upgrade based on sales
      await this.checkAndUpgradeTier(designerProfile.id, profileData.currentTier || 'bronze');

      return { success: true };
    } catch (error: any) {
      console.error('Error saving designer profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Automatic tier upgrade based on sales total
  async checkAndUpgradeTier(_designerId:string,_currentTier:string):Promise<void>{
    // Tier and sales mutations belong to the server's sale transaction.
  }


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
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          throw new Error('Missing auth token for notification');
        }

        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
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
  async getDesignerWallet(_designerId:string):Promise<DesignerWallet|null>{
    const response=await designerFetch('/api/wallet');const result=await response.json();if(!response.ok)throw new Error(result.error);return result.wallet;
  }


  async createDesignerWallet(designerId:string):Promise<DesignerWallet|null>{return this.getDesignerWallet(designerId);}


  async requestWithdrawal(designerId: string, amount: number): Promise<{success:boolean;error?:string}> {
    const {data}=await supabase.auth.getSession();
    const keyName=`withdrawal:${designerId}:${amount}`;
    const key=sessionStorage.getItem(keyName)||crypto.randomUUID();sessionStorage.setItem(keyName,key);
    const response=await fetch('/api/wallet',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session?.access_token}`},body:JSON.stringify({action:'withdrawal',amount,idempotencyKey:key})});
    const result=await response.json();if(response.ok)sessionStorage.removeItem(keyName);return result;
  }


  async getWalletTransactions(_designerId:string,limit=100):Promise<WalletTransaction[]> {
    const {data}=await supabase.auth.getSession();
    const response=await fetch('/api/wallet/transactions',{headers:{Authorization:`Bearer ${data.session?.access_token}`}});
    const result=await response.json();if(!response.ok)throw new Error(result.error);return result.transactions.slice(0,limit);
  }



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
  async getDesignerSalesSummary(designerId: string, currentTierName: string): Promise<{
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
      
      const response=await designerFetch('/api/designer/sales');const result=await response.json();
      if(!response.ok)throw new Error(result.error);
      const orderCount=result.orderCount;
      const averageOrderValue = orderCount > 0 ? salesTotal / orderCount : 0;
      
      // Use the provided currentTierName, and calculate next tier based on sales
      const currentTier = this.getCommissionTiers().find(tier => tier.name.toLowerCase() === currentTierName.toLowerCase()) || this.getCommissionTiers()[0];
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


  async revokeInstagramVerification(_userId:string):Promise<{success:boolean;error?:string}>{const response=await designerFetch('/api/auth/instagram/revoke',{method:'POST'});return response.json();}


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

  // Get all influencer item requests for this designer (with influencer and product info)
  async getInfluencerItemRequests(_designerId:string):Promise<InfluencerItemRequest[]>{const response=await designerFetch('/api/designer/influencer-item-requests');const data=await response.json();if(!response.ok)throw new Error(data.error);return data.requests;}


  async respondToInfluencerItemRequest(requestId:string,status:'accepted'|'rejected'):Promise<{success:boolean;error?:string}>{const response=await designerFetch('/api/designer/influencer-item-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId,status})});return response.json();}


  async getInfluencerItemRequestStats(designerId:string):Promise<{pending:number;accepted:number;rejected:number}>{const requests=await this.getInfluencerItemRequests(designerId);return {pending:requests.filter(r=>r.status==='pending').length,accepted:requests.filter(r=>r.status==='accepted').length,rejected:requests.filter(r=>r.status==='rejected').length};}


}

export const designerService = new DesignerService();
