import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Timecards and production quantity tracking',
  'Equipment assignments and usage logs',
  'Equipment maintenance scheduling and service history',
  'Safety inspections and incident reporting',
];

export default function FieldOperations() {
  return <FeatureListPage title="Field Operations" features={features} />;
}
