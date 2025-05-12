import { Card } from './card';
import { FileText, AlertTriangle, ClipboardList } from 'lucide-react';

interface DashboardMetricsProps {
  activeContracts: number;
  openIssues: number;
  pendingInspections: number;
}

export function DashboardMetrics({
  activeContracts,
  openIssues,
  pendingInspections,
}: DashboardMetricsProps) {
  const metrics = [
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      label: 'Active Contracts',
      value: activeContracts,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      label: 'Open Issues',
      value: openIssues,
    },
    {
      icon: <ClipboardList className="w-5 h-5 text-primary" />,
      label: 'Pending Inspections',
      value: pendingInspections,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {metrics.map(({ label, value, icon }) => (
        <Card
          key={label}
          className="flex flex-col items-center justify-center p-6 text-center bg-card rounded-lg border border-border"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {icon}
            <span className="text-sm font-medium text-white">{label}</span>
          </div>
          <span className="text-3xl font-bold text-white">{value}</span>
        </Card>
      ))}
    </div>
  );
}
