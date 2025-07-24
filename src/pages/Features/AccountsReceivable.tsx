import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { supabase } from '@/lib/supabase';

interface AccountsReceivableRow {
  id: string;
  project_id: string | null;
  amount_due: number | null;
  due_date: string | null;
  status: string | null;
}

export default function AccountsReceivable() {
  const [rows, setRows] = useState<AccountsReceivableRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*');
      if (error) {
        console.error('Error fetching accounts receivable', error);
      } else {
        setRows(data as AccountsReceivableRow[]);
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
