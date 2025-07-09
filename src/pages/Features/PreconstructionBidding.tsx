import { Page } from '@/components/Layout';

const features = [
  'Detailed estimating with resource-based pricing',
  'Bid package creation and vendor tracking',
  'Qualification and procurement workflows',
];

export default function PreconstructionBidding() {
  return (
    <Page>
      <h1 className="text-2xl font-bold mb-4">Preconstruction & Bidding</h1>
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
