import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

type PaymentRow = Database['public']['Tables']['payments']['Row'];

export default function Payments() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await rpcClient.filter_payments({ _filters: {} });
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching payments', error);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Payments</h1>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="border p-2 rounded">
            <span className='font-medium'>{r.amount ?? 0}</span>
            <span className="ml-2 text-sm text-gray-500">{r.paid_at ?? ''}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
