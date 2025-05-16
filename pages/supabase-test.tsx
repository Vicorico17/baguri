import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';

export default function SupabaseTest() {
  const [hunters, setHunters] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHunters() {
      const { data, error } = await supabase.from('design_hunters').select('*');
      if (error) setError(error.message);
      else setHunters(data || []);
    }
    fetchHunters();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Supabase Connection Test</h1>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <pre>{JSON.stringify(hunters, null, 2)}</pre>
    </div>
  );
} 