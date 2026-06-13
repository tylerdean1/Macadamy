import { useCallback, useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { toast } from 'sonner';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type LoadTrigger = 'user' | 'background';

export default function ScheduleTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async (trigger: LoadTrigger = 'user'): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await rpcClient.filter_tasks({ _filters: {} });
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      logBackendError({
        module: 'ScheduleTasks',
        operation: 'load tasks',
        trigger,
        error,
      });
      setTasks([]);
      setError(getBackendErrorMessage(error));
      if (trigger === 'user') {
        toast.error('Unable to load schedule tasks.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks('user');
  }, [loadTasks]);

  if (loading) {
    return (
      <Page>
        <LoadingState message="Loading schedule tasks..." />
      </Page>
    );
  }

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Schedule Tasks</h1>
      {error ? (
        <ErrorState
          error={error}
          title="Unable to load schedule tasks"
          onRetry={() => { void loadTasks('user'); }}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          message="No schedule tasks"
          description="Schedule tasks will appear here after they are created."
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="border p-2 rounded">
              <span className="font-medium">{t.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {t.start_date ?? 'N/A'} – {t.end_date ?? 'N/A'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
