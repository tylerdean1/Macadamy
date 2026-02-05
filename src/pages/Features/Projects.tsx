import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];

export default function Projects() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await rpcClient.filter_projects({ _filters: {} });
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching projects', error);
      }
      setLoading(false);
    };
    void fetchData();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <ul className="space-y-2">
        {projects.map(p => (
          <li key={p.id} className="border p-2 rounded">
            <span className="font-medium">{p.name}</span>
            <span className="ml-2 text-sm text-gray-500">
              {p.start_date ?? 'N/A'} – {p.end_date ?? 'N/A'}
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}
