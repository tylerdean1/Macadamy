import React from 'react';

interface PageProps {
  children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ children }) => (
  <div className="min-h-screen bg-background">{children}</div>
);
