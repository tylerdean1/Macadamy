import { Page } from '@/components/Layout';

const features = [
  'Accounts payable/receivable and general ledger',
  'Payroll processing with certified payroll support',
  'HR onboarding and equipment cost tracking',
  'Inventory management and purchase orders',
];

export default function AccountingPayroll() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Accounting & Payroll</h1>
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
