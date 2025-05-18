import React from 'react';
import { AlertTriangle } from 'lucide-react';
import '@/styles/progress.css';

interface BudgetTrackerProps {
  percentUsed: number;
  isOverBudget: boolean;
  className?: string;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  percentUsed,
  isOverBudget,
  className = '',
}) => {  // Determine the status color based on budget utilization
  const getStatusColor = () => {
    if (isOverBudget || percentUsed > 100) return 'bg-red-500'; // Over budget
    if (percentUsed > 90) return 'bg-yellow-500'; // Nearing budget
    return 'bg-green-500'; // Under budget
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Budget Utilization</span>
          <span className="text-sm font-medium">{percentUsed.toFixed(1)}%</span>
        </div>        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`budgetBar ${getStatusColor()}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
            data-width={Math.min(percentUsed, 100)}
          />
        </div>
      </div>

      {percentUsed > 100 && (
        <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Budget exceeded by {(percentUsed - 100).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};
