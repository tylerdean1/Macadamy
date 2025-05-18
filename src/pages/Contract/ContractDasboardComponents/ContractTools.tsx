import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clipboard,
  Truck,
  Users,
  AlertTriangle,
  FileWarning,
  ClipboardList,
  Calculator,
  Settings,
} from 'lucide-react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
// import { useAuthStore } from '@/lib/store'; // Removed useAuthStore
// import { supabase } from '@/lib/supabase'; // Removed supabase
import { Tooltip } from '../../../components/Tooltip';
// import type { Database } from '@/lib/database.types'; // Removed Database type

// type UserRole = Database['public']['Enums']['user_role']; // Removed UserRole type

interface ContractToolsProps {
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
 * ContractToolbar Component - Now View-Only
 * 
 * Provides quick access to various contract management features.
 * All tools are navigational and do not perform write operations directly.
 * Badge counts are for display purposes only.
 */
export const ContractTools: React.FC<ContractToolsProps> = ({ 
  contractId, 
  issuesCount = 0, // Default to 0 if not provided
  changeOrdersCount = 0, // Default to 0
  inspectionsCount = 0 // Default to 0
}) => {
  const navigate = useNavigate();
  // const { profile } = useAuthStore(); // Removed profile
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

  const buttons: ToolButton[] = [
    {
      icon: <Clipboard className="w-5 h-5" />,
      label: 'Daily Reports',
      onClick: () => navigate(`/contracts/${contractId}/daily-reports`),
      color: 'bg-blue-500/30 text-blue-500 hover:bg-blue-500/40',
    },
    {      icon: <Truck className="w-5 h-5" />,
      label: 'Equipment Log',
      onClick: () => navigate(`/contracts/${contractId}/equipment`),
      color: 'bg-green-500/30 text-green-500 hover:bg-green-500/40',
      // requiresPermission: true, // Removed
      // permissionRoles: ['Admin', 'Project Manager', 'Contractor'], // Removed
    },
    {      icon: <Users className="w-5 h-5" />,
      label: 'Labor Records',
      onClick: () => navigate(`/contracts/${contractId}/labor`),
      color: 'bg-purple-500/30 text-purple-500 hover:bg-purple-500/40',
      // requiresPermission: true, // Removed
      // permissionRoles: ['Admin', 'Project Manager', 'Contractor'], // Removed
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Issues',
      onClick: () => navigate(`/contracts/${contractId}/issues`),
      color: 'bg-amber-500/30 text-amber-500 hover:bg-amber-500/40',
      badgeCount: issuesCount, // Kept for display
    },
    {
      icon: <FileWarning className="w-5 h-5" />,
      label: 'Change Orders',
      onClick: () => navigate(`/contracts/${contractId}/change-orders`),
      color: 'bg-red-500/30 text-red-500 hover:bg-red-500/40',
      badgeCount: changeOrdersCount, // Kept for display
      // requiresPermission: true, // Removed
      // permissionRoles: ['Admin', 'Project Manager', 'Engineer'], // Removed
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: 'Inspections',
      onClick: () => navigate(`/contracts/${contractId}/inspections`),
      color: 'bg-cyan-500/30 text-cyan-500 hover:bg-cyan-500/40',
      badgeCount: inspectionsCount, // Kept for display
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      label: 'Calculators',
      onClick: () => navigate(`/contracts/${contractId}/calculators`),
      color: 'bg-indigo-500/30 text-indigo-500 hover:bg-indigo-500/40',
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      onClick: () => navigate(`/contracts/${contractId}/contractsettings`),
      color: 'bg-gray-500/30 text-gray-500 hover:bg-gray-500/40',
      // requiresPermission: true, // Removed
      // permissionRoles: ['Admin', 'Project Manager'], // Removed
    },
  ];  
  
  // Filter buttons based on user permissions - REMOVED (all buttons are shown in view-only)
  // const allowedButtons = buttons.filter(btn => 
  //   !btn.requiresPermission || hasPermission(btn.permissionRoles)
  // );
  const allowedButtons = buttons; // All buttons are allowed
  
  return (
    <div className={`transition-all duration-300 ${isSticky ? 'sticky top-0 z-10' : ''}`}>
      <Card 
        className={`mb-6 ${isSticky ? 'shadow-lg' : ''}`}
        title="Contract Tools"
        subtitle="Quick access to contract management features"
      >
        <div className="flex flex-wrap justify-center gap-2 p-3">
          {allowedButtons.map((btn, index) => (
            <Tooltip key={index} content={btn.label}>
              <button
                onClick={btn.onClick}
                className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm rounded-md transition-colors ${btn.color} p-2 min-w-[80px] sm:min-w-[120px]`}
                aria-label={btn.label}
              >
                <div className="relative">
                  {btn.icon}
                  {btn.badgeCount && btn.badgeCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {btn.badgeCount > 99 ? '99+' : btn.badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-center hidden sm:inline-block">{btn.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      </Card>    </div>
  );
};
