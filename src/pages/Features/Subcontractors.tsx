import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Vendor database with contact management',
  'Subcontractor onboarding and compliance tracking',
  'Bid solicitation and comparison tools',
  'Subcontract agreement generation',
];

export default function Subcontractors() {
  return <FeatureListPage title="Subcontractor Management" features={features} />;
}
