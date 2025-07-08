import { useEffect, useState } from 'react';
import { Page } from '@/pages/StandardPages/StandardPageComponents/Page';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type EstimateRow = Database['public']['Tables']['estimates']['Row'];

export default function Estimates() {
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .returns<EstimateRow[]>();
      if (error) {
        console.error('Error fetching estimates', error);
      } else if (data) {
        setEstimates(data);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Estimates</h1>
      <ul className="space-y-2">
        {estimates.map(e => (
          <li key={e.id} className="border p-2 rounded">
            <span className="font-medium">{e.title}</span>
            <span className="ml-2 text-sm text-gray-500">
              ${'{'}e.amount{'}'} ({e.status ?? 'N/A'})
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
