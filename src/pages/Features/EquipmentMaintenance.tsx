import { useEffect, useState } from 'react';
import { Page } from '@/components/Layout';
import { supabase } from '@/lib/supabase';

interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  description: string;
  service_date: string;
  service_provider: string | null;
  notes: string | null;
}

export default function EquipmentMaintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase.from('equipment_maintenance').select('*');
      if (!error && Array.isArray(data)) setRecords(data as unknown as MaintenanceRecord[]);
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
            <span className="font-medium">{r.description}</span>
            <span className="ml-2 text-sm text-gray-500">{r.service_date}</span>
            {r.service_provider && (
              <span className="ml-2 text-sm text-gray-500">{r.service_provider}</span>
            )}
          </li>
        ))}
      </ul>
    </Page>
  );
}
