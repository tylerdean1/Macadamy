import { Page } from '@/components/Layout';

const features = [
  'Custom dashboards and analytics',
  'Mobile access to tasks and documents',
  'Centralized contact directory and communications',
];

export default function ReportingCollaboration() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Reporting & Collaboration</h1>
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
