import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Budgets, commitments, and contract tracking',
  'Progress billing and payment applications',
  'Job cost forecasting with real-time dashboards',
  'Integration with accounting and payroll modules',
];

export default function FinancialManagement() {
  return <FeatureListPage title="Financial Management" features={features} />;
}
