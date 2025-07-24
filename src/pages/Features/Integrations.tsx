import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Connect accounting and scheduling software',
  'Import and export data via common formats',
  'Webhook support for custom workflows',
];

export default function Integrations() {
  return <FeatureListPage title="3rd-Party Integrations" features={features} />;
}
