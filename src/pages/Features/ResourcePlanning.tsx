import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Gantt-style schedules with dependencies',
  'Resource allocation across projects',
  'Baselines and percent-complete reporting',
  'Portfolio-level dashboards',
];

export default function ResourcePlanning() {
  return <FeatureListPage title="Scheduling & Resource Planning" features={features} />;
}
