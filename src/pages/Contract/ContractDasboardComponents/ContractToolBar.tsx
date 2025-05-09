import React from 'react';
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

interface ContractToolbarProps {
  contractId: string;
}

export interface ToolButton {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color: string;
  }
  
export const ContractToolbar: React.FC<ContractToolbarProps> = ({ contractId }) => {
  const navigate = useNavigate();

  const buttons = [
    {
      icon: <Clipboard className="w-5 h-5" />,
      label: 'Daily Reports',
      onClick: () => navigate(`/contracts/${contractId}/daily-reports`),
      color: 'bg-blue-500/30 text-blue-500 hover:bg-blue-500/40',
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: 'Equipment Log',
      onClick: () => navigate(`/contracts/${contractId}/equipment`),
      color: 'bg-green-500/30 text-green-500 hover:bg-green-500/40',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Labor Records',
      onClick: () => navigate(`/contracts/${contractId}/labor`),
      color: 'bg-purple-500/30 text-purple-500 hover:bg-purple-500/40',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Issues',
      onClick: () => navigate(`/contracts/${contractId}/issues`),
      color: 'bg-amber-500/30 text-amber-500 hover:bg-amber-500/40',
    },
    {
      icon: <FileWarning className="w-5 h-5" />,
      label: 'Change Orders',
      onClick: () => navigate(`/contracts/${contractId}/change-orders`),
      color: 'bg-red-500/30 text-red-500 hover:bg-red-500/40',
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: 'Inspections',
      onClick: () => navigate(`/contracts/${contractId}/inspections`),
      color: 'bg-cyan-500/30 text-cyan-500 hover:bg-cyan-500/40',
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
    },
  ];

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className={`flex flex-col sm:flex-row items-center sm:justify-center gap-1 sm:gap-2 text-xs sm:text-sm rounded-md transition-colors ${btn.color} p-2`}
        >
          {btn.icon}
          <span className="sm:inline hidden">{btn.label}</span>
        </button>
      ))}
    </div>
  );
};
