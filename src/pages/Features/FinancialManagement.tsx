import { Page } from '@/components/Layout';

const features = [
  'Budgets, commitments, and contract tracking',
  'Progress billing and payment applications',
  'Job cost forecasting with real-time dashboards',
  'Integration with accounting and payroll modules',
];

export default function FinancialManagement() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Financial Management</h1>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="border p-2 rounded">
            {f}
          </li>
        ))}
      </ul>
    </Page>
  );
}
