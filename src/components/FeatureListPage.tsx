import React from 'react';
import { Page, PageContainer } from './Layout';

interface FeatureListPageProps {
  title: string;
  features: string[];
}

export default function FeatureListPage({ title, features }: FeatureListPageProps) {
  return (
    <Page>
      <PageContainer>
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <ul className="space-y-2">
          {features.map((f, i) => (
            <li key={i} className="border p-2 rounded">
              {f}
            </li>
          ))}
        </ul>
      </PageContainer>
    </Page>
  );
}
