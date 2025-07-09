import { Page } from '@/components/Layout';

const features = [
  'Gantt-style schedules with dependencies',
  'Resource allocation across projects',
  'Baselines and percent-complete reporting',
  'Portfolio-level dashboards',
];

export default function ResourcePlanning() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Scheduling & Resource Planning</h1>
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
