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
}

export const adminService = new AdminService(); 