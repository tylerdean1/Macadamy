import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Detailed estimating with resource-based pricing',
  'Bid package creation and vendor tracking',
  'Qualification and procurement workflows',
];

export default function PreconstructionBidding() {
  return <FeatureListPage title="Preconstruction & Bidding" features={features} />;
}
