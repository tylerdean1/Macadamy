import React from 'react';

interface PageProps {
  children: React.ReactNode;
}

export const Page: React.FC<PageProps> = ({ children }) => (
  <div className="min-h-screen bg-background">{children}</div>
);

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 py-4 ${className}`}>{children}</div>
);

export const SectionContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => (
  <div className={`container mx-auto px-4 py-8 ${className}`}>{children}</div>
);

export default { Page, PageContainer, SectionContainer };
