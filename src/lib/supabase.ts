import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (webhooks, etc.).
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as unknown as ReturnType<typeof createClient>;

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
