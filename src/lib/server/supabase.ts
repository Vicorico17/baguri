import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
let client: SupabaseClient | undefined;
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    if (!client) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) throw new Error('Server database configuration missing');
      client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    }
    const value = Reflect.get(client, property);
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
