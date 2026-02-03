import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

type EstimateRow = Database['public']['Functions']['filter_estimates']['Returns'][number];

export default function Estimates() {
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await rpcClient.filter_estimates({});
      setEstimates(Array.isArray(data) ? data : []);
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
            <span className="font-medium">{e.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              ({e.status ?? 'N/A'})
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
