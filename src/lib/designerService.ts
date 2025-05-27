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
  username: string;
  logoUrl: string;
  secondaryLogoUrl: string;
  instagramHandle: string;
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
  createdAt?: string;
  updatedAt?: string;
};

export type DesignerDashboardData = {
  profile: DesignerProfileForm;
  products: DesignerProduct[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt: string | null;
  completionPercentage: number;
};

class DesignerService {
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
      const designerProfile = await this.getDesignerByUserId(userId);
      if (!designerProfile) {
        // Return null for new users - let the dashboard handle the empty state
        return null;
      }

      // Get products
      const { data: products, error: productsError } = await supabase
        .from('designer_products')
        .select('*')
        .eq('designer_id', designerProfile.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      // Get the current auth user to ensure email sync
      const { data: { user } } = await supabase.auth.getUser();
      
      // Convert database data to form format
      const profile: DesignerProfileForm = {
        brandName: designerProfile.brand_name || '',
        shortDescription: designerProfile.short_description || '',
        longDescription: designerProfile.long_description || designerProfile.description || '',
        city: designerProfile.city || '',
        yearFounded: designerProfile.year_founded || new Date().getFullYear(),
        email: user?.email || designerProfile.email || '', // Always use auth user's email as source of truth
        username: designerProfile.username || '',
        logoUrl: designerProfile.logo_url || '',
        secondaryLogoUrl: designerProfile.secondary_logo_url || '',
        instagramHandle: designerProfile.instagram || '',
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
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      // Calculate completion percentage
      const completionPercentage = this.calculateCompletionPercentage(profile, dashboardProducts);

      return {
        profile,
        products: dashboardProducts,
        status: designerProfile.status as 'draft' | 'submitted' | 'approved' | 'rejected',
        submittedAt: designerProfile.submitted_at || null,
        completionPercentage,
      };
    } catch (error) {
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
          username: profileData.username,
          email: user.email, // Always sync with auth user's email
          logo_url: profileData.logoUrl,
          secondary_logo_url: profileData.secondaryLogoUrl,
          instagram: profileData.instagramHandle,
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
      const newIds = new Set(products.map(p => p.id));

      // Delete products that are no longer in the list
      const toDelete = Array.from(existingIds).filter(id => !newIds.has(id));
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

      // Upsert products
      for (const product of products) {
        const productData = {
          id: product.id,
          designer_id: designerProfile.id,
          name: product.name,
          description: product.description,
          price: product.price,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          stock_status: product.stockStatus,
        };

        const { error: upsertError } = await supabase
          .from('designer_products')
          .upsert(productData, { onConflict: 'id' });

        if (upsertError) {
          console.error('Error upserting product:', upsertError);
          return { success: false, error: upsertError.message };
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
    const total = 12;

    // Profile fields (8 points)
    if (profile.brandName.trim()) completed++;
    if (profile.shortDescription.trim()) completed++;
    if (profile.longDescription.trim()) completed++;
    if (profile.logoUrl.trim()) completed++;
    if (profile.instagramHandle.trim()) completed++;
    if (profile.city.trim()) completed++;
    if (profile.yearFounded && profile.yearFounded > 1900) completed++;
    if (profile.specialties.length > 0) completed++;

    // Product fields (4 points)
    if (products.some(p => p.name.trim() && p.price > 0)) completed++;
    if (products.some(p => p.sizes.length > 0)) completed++;
    if (products.some(p => p.colors.some(c => c.name.trim()))) completed++;
    if (products.some(p => p.description.trim())) completed++;

    return Math.round((completed / total) * 100);
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
}

export const designerService = new DesignerService(); 