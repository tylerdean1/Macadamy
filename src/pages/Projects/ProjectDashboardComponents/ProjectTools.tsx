import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProjectToolsProps {
  contractId: string;
  issuesCount?: number; // Added to receive as prop
  changeOrdersCount?: number; // Added to receive as prop
  inspectionsCount?: number; // Added to receive as prop
}

export interface ToolButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  // requiresPermission?: boolean; // Removed permission logic
  // permissionRoles?: UserRole[]; // Removed permission logic
  badgeCount?: number; // Kept badge count as it might be derived from props or static
}

/**
 * ProjectToolbar Component - Now View-Only
 * 
 * Provides quick access to various contract management features.
 * All tools are navigational and do not perform write operations directly.
 * Badge counts are for display purposes only.
 */
export const ProjectTools: React.FC<ProjectToolsProps> = ({
  contractId,
  issuesCount = 0, // Default to 0 if not provided
  changeOrdersCount = 0, // Default to 0
  inspectionsCount = 0 // Default to 0
}) => {
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState<boolean>(false);

  // Handle scroll event to make toolbar sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100); // Make sticky after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Example tool buttons (replace with actual navigation logic as needed)
  const tools: ToolButton[] = [
    {
      icon: <span role="img" aria-label="Issues">⚠️</span>,
      label: 'Issues',
      onClick: () => navigate(`/contract/${contractId}/issues`),
      color: 'bg-yellow-600',
      badgeCount: issuesCount,
    },
    {
      icon: <span role="img" aria-label="Change Orders">📝</span>,
      label: 'Change Orders',
      onClick: () => navigate(`/contract/${contractId}/change-orders`),
      color: 'bg-blue-600',
      badgeCount: changeOrdersCount,
    },
    {
      icon: <span role="img" aria-label="Inspections">🔍</span>,
      label: 'Inspections',
      onClick: () => navigate(`/contract/${contractId}/inspections`),
      color: 'bg-green-600',
      badgeCount: inspectionsCount,
    },
  ];

  return (
    <div className={`flex gap-4 p-2 bg-background-light rounded shadow ${isSticky ? 'sticky top-0 z-10' : ''}`}>
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={tool.onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white ${tool.color} relative`}
        >
          {tool.icon}
          <span>{tool.label}</span>
          {typeof tool.badgeCount === 'number' && tool.badgeCount > 0 && (
            <span className="ml-2 bg-red-600 text-xs rounded-full px-2 py-0.5 absolute -top-2 -right-2">
              {tool.badgeCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
