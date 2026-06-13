import { useCallback, useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type CostCodeRow = Database['public']['Tables']['cost_codes']['Row'];
type LoadTrigger = 'user' | 'background';

export default function CostCodes() {
  const [codes, setCodes] = useState<CostCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCostCodes = useCallback(async (trigger: LoadTrigger = 'user') => {
    setLoading(true);
    setError(null);

    try {
      const data = await rpcClient.filter_cost_codes({ _filters: {} });
      setCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      logBackendError({
        module: 'CostCodes',
        operation: 'load cost codes',
        trigger,
        error,
      });
      setCodes([]);
      setError(getBackendErrorMessage(error));
      if (trigger === 'user') {
        toast.error('Unable to load cost codes.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCostCodes('user');
  }, [loadCostCodes]);

  if (loading) {
    return (
      <Page>
        <LoadingState message="Loading cost codes..." />
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <h1 className="text-2xl font-bold mb-4">Cost Codes</h1>
        <ErrorState
          error={error}
          onRetry={() => { void loadCostCodes('user'); }}
          title="Unable to load cost codes"
        />
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Cost Codes</h1>
      {codes.length === 0 ? (
        <EmptyState
          message="No cost codes"
          description="Cost codes will appear here once they are configured."
        />
      ) : (
        <ul className="space-y-2">
          {codes.map((c) => (
            <li key={c.id} className="border p-2 rounded">
              <span className="font-medium">{c.code}</span>
              <span className="ml-2 text-sm text-gray-500">{c.description}</span>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
