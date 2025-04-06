import { useMemo } from 'react';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';

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
    <Card
      title="Budget Tracker"
      icon={<DollarSign className="w-5 h-5 text-primary" />}
      className={className}
    >
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
            <div
              className={`budgetBar ${getStatusColor()}`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              data-width={Math.min(percentageUsed, 100)}
            />
          </div>

        {percentageUsed > 100 && (
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Budget exceeded by {(percentageUsed - 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
}