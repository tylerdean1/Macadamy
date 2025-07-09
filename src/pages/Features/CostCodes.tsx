import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type CostCodeRow = Database['public']['Tables']['cost_codes']['Row'];

export default function CostCodes() {
  const [codes, setCodes] = useState<CostCodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('cost_codes')
        .select('*')
        .returns<CostCodeRow[]>();
      if (error) {
        console.error('Error fetching cost codes', error);
      } else if (data) {
        setCodes(data);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Cost Codes</h1>
      <ul className="space-y-2">
        {codes.map(c => (
          <li key={c.id} className="border p-2 rounded">
            <span className="font-medium">{c.code}</span>
            <span className="ml-2 text-sm text-gray-500">{c.description}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
