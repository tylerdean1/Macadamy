import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];

export default function ScheduleTasks() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await rpcClient.filter_tasks({ _filters: {} });
        setTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching tasks', error);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Schedule Tasks</h1>
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
    </Page>
  );
}
