import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Card } from './card';

interface Issue {
  id: string;
  title: string | null;
  status: string | null;
  due_date: string | null;
}

interface Inspection {
  id: string;
  name: string;
  wbs_id: string | null;
  created_at: string | null;
}

export function ActionCenter() {
  const { profile } = useAuthStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    void (async () => {
      const { data: issueData, error: issueErr } = await supabase
        .from('issues')
        .select('id,title,status,due_date')
        .eq('assigned_to', profile.id)
        .eq('status', 'Open')
        .order('due_date', { ascending: true })
        .limit(5);
      if (issueErr) {
        console.error('Issue fetch error', issueErr);
      } else if (Array.isArray(issueData)) {
        setIssues(issueData as Issue[]);
      }

      const { data: inspData, error: inspErr } = await supabase
        .from('inspections')
        .select('id,name,wbs_id,created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (inspErr) {
        console.error('Inspection fetch error', inspErr);
      } else if (Array.isArray(inspData)) {
        setInspections(inspData as Inspection[]);
      }
    })();
  }, [profile?.id]);

  if (!issues.length && !inspections.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Action Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Open Issues</h3>
          <ul className="space-y-1 text-sm">
            {issues.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span>{i.title ?? 'Untitled'}</span>
                <span>{i.due_date?.split('T')[0] ?? ''}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Recent Inspections</h3>
          <ul className="space-y-1 text-sm">
            {inspections.map((ins) => (
              <li key={ins.id} className="flex justify-between">
                <span>{ins.name}</span>
                <span>{ins.created_at?.split('T')[0] ?? ''}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
