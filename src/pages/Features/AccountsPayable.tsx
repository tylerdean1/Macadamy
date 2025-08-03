import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type AccountsPayableRow = Database['public']['Tables']['accounts_payable']['Row'];

export default function AccountsPayable() {
  const [rows, setRows] = useState<AccountsPayableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .returns<AccountsPayableRow[]>();
      if (error) {
        console.error('Error fetching accounts payable', error);
      } else {
        setRows(data);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Accounts Payable</h1>
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
