import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Drawing version control and centralized file storage',
  'Model coordination and design review',
  'RFI, submittal, and meeting minutes workflows',
  'Daily logs, change orders, and punch lists',
];

export default function DocumentManagement() {
  return <FeatureListPage title="Project & Document Management" features={features} />;
}
