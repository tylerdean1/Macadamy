import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Accounts payable/receivable and general ledger',
  'Payroll processing with certified payroll support',
  'HR onboarding and equipment cost tracking',
  'Inventory management and purchase orders',
];

export default function AccountingPayroll() {
  return <FeatureListPage title="Accounting & Payroll" features={features} />;
}
