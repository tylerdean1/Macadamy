import { Page } from '@/components/Layout';

const features = [
  'Timecards and production quantity tracking',
  'Equipment assignments and usage logs',
  'Safety inspections and incident reporting',
];

export default function FieldOperations() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Field Operations</h1>
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
