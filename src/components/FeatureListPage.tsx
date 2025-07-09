import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Page, PageContainer } from './Layout';

interface FeatureListPageProps {
  title: string;
  features: string[];
}

export default function FeatureListPage({ title, features }: FeatureListPageProps) {
  return (
    <Page>
      <PageContainer>
        <Link to="/dashboard" className="text-primary hover:underline block mb-2">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="border p-2 rounded flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </PageContainer>
    </Page>
  );
}
