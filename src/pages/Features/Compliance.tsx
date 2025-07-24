import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Store regulatory requirements centrally',
  'Generate compliance documentation automatically',
  'Track certifications and expiration dates',
];

export default function Compliance() {
  return <FeatureListPage title="Regulatory Compliance" features={features} />;
}
