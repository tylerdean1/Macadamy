import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Quality checklists and inspections',
  'Safety meetings and hazard tracking',
  'Corrective action management',
  'Compliance documentation storage',
];

export default function QualitySafety() {
  return <FeatureListPage title="Quality & Safety" features={features} />;
}
