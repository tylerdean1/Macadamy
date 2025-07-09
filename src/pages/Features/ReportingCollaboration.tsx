import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Custom dashboards and analytics',
  'Mobile access to tasks and documents',
  'Centralized contact directory and communications',
];

export default function ReportingCollaboration() {
  return <FeatureListPage title="Reporting & Collaboration" features={features} />;
}
