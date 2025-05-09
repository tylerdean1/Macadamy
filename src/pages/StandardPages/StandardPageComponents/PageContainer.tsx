import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => (
  <div className="max-w-7xl mx-auto px-4 py-4">{children}</div>
);
