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

interface MaintenancePayload {
  records: Array<Record<string, unknown>>;
}

export default function EquipmentMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const raw = await rpcClient.rpc_equipment_maintenance_payload();
      const payload = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as unknown as MaintenancePayload)
        : { records: [] };
      const normalized = Array.isArray(payload.records)
        ? payload.records.map((record) => ({
          id: typeof record.id === 'string' ? record.id : '',
          equipment_id: typeof record.equipment_id === 'string' ? record.equipment_id : null,
          description: typeof record.description === 'string' ? record.description : null,
          maintenance_date: typeof record.maintenance_date === 'string' ? record.maintenance_date : null,
          performed_by: typeof record.performed_by === 'string' ? record.performed_by : null,
          type: typeof record.type === 'string' ? record.type : null,
          notes: null
        })).filter((record) => record.id !== '')
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
