import { useCallback, useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type AccountsReceivableRow = Database['public']['Tables']['accounts_receivable']['Row'];
type LoadTrigger = 'user' | 'background';

export default function AccountsReceivable() {
  const [rows, setRows] = useState<AccountsReceivableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccountsReceivable = useCallback(async (trigger: LoadTrigger = 'user') => {
    setLoading(true);
    setError(null);

    try {
      const data = await rpcClient.filter_accounts_receivable({ _filters: {} });
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      logBackendError({
        module: 'AccountsReceivable',
        operation: 'load accounts receivable',
        trigger,
        error,
      });
      setRows([]);
      setError(getBackendErrorMessage(error));
      if (trigger === 'user') {
        toast.error('Unable to load accounts receivable.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccountsReceivable('user');
  }, [loadAccountsReceivable]);

  if (loading) {
    return (
      <Page>
        <LoadingState message="Loading accounts receivable..." />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <h1 className="text-2xl font-bold mb-4">Accounts Receivable</h1>
        <ErrorState
          error={error}
          onRetry={() => { void loadAccountsReceivable('user'); }}
          title="Unable to load accounts receivable"
        />
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Accounts Receivable</h1>
      {rows.length === 0 ? (
        <EmptyState
          message="No accounts receivable"
          description="Accounts receivable will appear here once customer invoices are recorded."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.id} className="border p-2 rounded">
              <span className="font-medium">{r.amount_due ?? 0}</span>
              <span className="ml-2 text-sm text-gray-500">{r.status ?? ''}</span>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
