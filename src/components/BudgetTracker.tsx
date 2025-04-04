import React, { useMemo } from 'react';
import { DollarSign, AlertTriangle } from 'lucide-react';

interface BudgetTrackerProps {
  contractBudget: number;
  lineItemTotal: number;
  className?: string;
}

export function BudgetTracker({ contractBudget, lineItemTotal, className = '' }: BudgetTrackerProps) {
  const difference = useMemo(() => contractBudget - lineItemTotal, [contractBudget, lineItemTotal]);
  const percentageUsed = useMemo(() => 
    contractBudget > 0 ? (lineItemTotal / contractBudget) * 100 : 0
  , [contractBudget, lineItemTotal]);

  const getStatusColor = () => {
    if (percentageUsed > 100) return 'bg-red-500';
    if (percentageUsed > 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`bg-background-light rounded-lg border border-background-lighter p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Budget Tracker</h3>
        <DollarSign className="w-5 h-5 text-primary" />
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Contract Budget</span>
            <span>${contractBudget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Line Items Total</span>
            <span>${lineItemTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className={difference < 0 ? 'text-red-500' : 'text-green-500'}>
              {difference < 0 ? 'Over Budget' : 'Remaining'}
            </span>
            <span className={difference < 0 ? 'text-red-500' : 'text-green-500'}>
              ${Math.abs(difference).toLocaleString()}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Budget Utilization</span>
            <span className="text-sm font-medium text-white">{percentageUsed.toFixed(1)}%</span>
          </div>
          <div className="relative h-2 bg-background rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all ${getStatusColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {percentageUsed > 100 && (
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Budget exceeded by {(percentageUsed - 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}