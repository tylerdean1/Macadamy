import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
type EstimateRow = {
  id: string;
  project_id: string | null;
  name: string;
  status: string | null;
  created_at: string | null;
  updated_at: string;
};

export default function Estimates() {
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const raw = await rpcClient.rpc_estimates_payload();
      const payload = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};
      const data = Array.isArray(payload.estimates) ? payload.estimates : [];
      const normalized: EstimateRow[] = data
        .map((item) => ({
          id: typeof item.id === 'string' ? item.id : '',
          project_id: typeof item.project_id === 'string' ? item.project_id : null,
          name: typeof item.name === 'string' ? item.name : 'Unnamed',
          status: typeof item.status === 'string' ? item.status : null,
          created_at: typeof item.created_at === 'string' ? item.created_at : null,
          updated_at: typeof item.updated_at === 'string' ? item.updated_at : '',
        }))
        .filter((item) => item.id !== '');
      setEstimates(normalized);
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
