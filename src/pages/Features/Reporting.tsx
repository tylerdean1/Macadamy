import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Custom dashboards and analytics',
  'Mobile access to tasks and documents',
  'Centralized contact directory and communications',
];

export default function Reporting() {
  return <FeatureListPage title="Reporting & Collaboration" features={features} />;
}
