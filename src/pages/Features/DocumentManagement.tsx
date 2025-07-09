import { Page } from '@/components/Layout';

const features = [
  'Drawing version control and centralized file storage',
  'RFI, submittal, and meeting minutes workflows',
  'Daily logs, change orders, and punch lists',
];

export default function DocumentManagement() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Project & Document Management</h1>
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
