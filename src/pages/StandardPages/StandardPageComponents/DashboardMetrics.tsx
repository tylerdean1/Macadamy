import { Card } from './card';

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
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Dashboard Metrics</h2>      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Active Contracts" value={activeContracts} icon="📝" />
        <MetricCard title="Open Issues" value={openIssues} icon="⚠️" />
        <MetricCard
          title="Inspections"
          value={pendingInspections}
          icon="🔍"
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
}

const MetricCard = ({ title, value, icon }: MetricCardProps) => {
  return (
    <Card className="flex items-center p-4">
      <div className="text-3xl mr-4">{icon}</div>
      <div>
        <h3 className="text-sm text-gray-400">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
};
