import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Model viewer with 3D navigation',
  'Federate design models for coordination',
  'Issue tracking directly on the model',
];

export default function BIM() {
  return <FeatureListPage title="BIM Coordination" features={features} />;
}
