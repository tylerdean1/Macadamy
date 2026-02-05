import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

type AccountsReceivableRow = Database['public']['Tables']['accounts_receivable']['Row'];

export default function AccountsReceivable() {
  const [rows, setRows] = useState<AccountsReceivableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await rpcClient.filter_accounts_receivable({ _filters: {} });
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching accounts receivable', error);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Accounts Receivable</h1>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="border p-2 rounded">
            <span className='font-medium'>{r.amount_due ?? 0}</span>
            <span className="ml-2 text-sm text-gray-500">{r.status ?? ''}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
