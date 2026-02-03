import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { rpcClient } from '@/lib/rpc.client';

interface MaintenanceRecord {
  id: string;
  equipment_id: string | null;
  description: string | null;
  maintenance_date: string | null;
  performed_by: string | null;
  type: string | null;
  notes: string | null;
}

export default function EquipmentMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const data = await rpcClient.filter_equipment_maintenance({});
      const normalized = Array.isArray(data)
        ? data.map(record => ({
          ...record,
          notes: null
        }))
        : [];
      setRecords(normalized);
      setLoading(false);
    };
    void fetchRecords();
  }, []);

  if (loading) return <Page>Loading…</Page>;

  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Equipment Maintenance</h1>
      <ul className="space-y-2">
        {records.map(r => (
          <li key={r.id} className="border p-2 rounded">
            <span className="font-medium">{r.description ?? 'No description'}</span>
            <span className="ml-2 text-sm text-gray-500">{r.maintenance_date ?? 'N/A'}</span>
            {r.performed_by && (
              <span className="ml-2 text-sm text-gray-500">{r.performed_by}</span>
            )}
          </li>
        ))}
      </ul>
    </Page>
  );
}
