import React from 'react';

interface CardSectionProps {
  children: React.ReactNode;
}

export const CardSection: React.FC<CardSectionProps> = ({ children }) => (
  <div className="bg-background-light rounded-lg shadow-lg border border-background-lighter p-6">
    {children}
  </div>
);
