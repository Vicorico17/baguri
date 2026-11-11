import { createClient } from '@supabase/supabase-js'

import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;
// Delay configuration checks until use so compilation does not need production secrets.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    if (!client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) throw new Error('Supabase is not configured. See .env.example.');
      client = createClient(url, key);
    }
    const value = Reflect.get(client, property);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Types for our database
export type Designer = {
  id: string
  brand_name: string
  description?: string
  short_description?: string
  long_description?: string
  city?: string
  year_founded?: number
  username?: string
  specialties?: string[]
  cui?: string // Romanian fiscal code for withdrawals and Silver+ tier
  tags?: string[] // Product specialty tags
  current_tier?: string // Current commission tier (bronze, silver, gold, platinum)
  email: string
  logo_url?: string
  secondary_logo_url?: string
  instagram?: string
  instagram_verified?: boolean
  instagram_user_id?: string
  instagram_access_token?: string
  tiktok?: string
  website?: string
  fulfillment?: 'baguri' | 'designer'
  selling_as?: 'PFA' | 'SRL' | 'not_registered'
  iban?: string
  owns_rights?: boolean
  accept_terms?: boolean
  wants_ai_photos?: boolean
  status?: 'draft' | 'submitted' | 'approved' | 'rejected'
  submitted_at?: string
  reviewed_at?: string
  rejection_reason?: string
  created_at?: string
  updated_at?: string
  sales_total?: number
}

export type DesignerAuth = {
  id: string
  user_id: string
  designer_id: string
  role: 'designer' | 'admin'
  is_approved: boolean
  created_at: string
  updated_at: string
}

export type DesignerProduct = {
  id: string
  designer_id: string
  name: string
  description?: string
  price: string
  images?: string[]
  sizes?: string[]
  colors?: any[] // JSON field for color objects
  stock_status: 'in_stock' | 'made_to_order' | 'coming_soon'
  is_active: boolean
  is_live: boolean
  created_at: string
  updated_at: string
}

export type DesignerProfile = Designer & {
  auth: DesignerAuth
} 
