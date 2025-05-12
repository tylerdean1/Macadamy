import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface FeatureSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

export function FeatureSection({
  title,
  description,
  icon,
  features,
}: FeatureSectionProps) {
  return (
    <div className="bg-background-light p-6 rounded-lg border border-background-lighter hover:border-primary transition-colors">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center text-gray-300">
            <ChevronRight className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}