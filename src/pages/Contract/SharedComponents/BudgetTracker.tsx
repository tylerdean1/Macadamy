import { useMemo } from 'react'; // Import React hooks
import { DollarSign, AlertTriangle } from 'lucide-react'; // Import icons for display
import { Card } from '@/pages/StandardPages/StandardPageComponents/card'; // Import Card component for consistent UI

// Define props for the BudgetTracker component
interface BudgetTrackerProps {
  contractBudget: number; // Total budget for the contract
  lineItemTotal: number; // Total from line items
  className?: string; // Optional additional classes
}

// BudgetTracker component to monitor the budget of a contract
export function BudgetTracker({ contractBudget, lineItemTotal, className = '' }: BudgetTrackerProps) {
  // Calculate the remaining budget and percentage used
  const difference = useMemo(() => contractBudget - lineItemTotal, [contractBudget, lineItemTotal]);
  const percentageUsed = useMemo(() => 
    contractBudget > 0 ? (lineItemTotal / contractBudget) * 100 : 0 // Calculate percentage of budget used
  , [contractBudget, lineItemTotal]);

  // Determine the status color based on budget utilization
  const getStatusColor = () => {
    if (percentageUsed > 100) return 'bg-red-500'; // Over budget
    if (percentageUsed > 90) return 'bg-yellow-500'; // Nearing budget
    return 'bg-green-500'; // Under budget
  };

  return (
    <Card
      title="Budget Tracker" // Title for the card
      icon={<DollarSign className="w-5 h-5 text-primary" />} // Icon displayed in the card
      className={className} // Additional classes for styling
    >
      <div className="space-y-4">
        <div>
          {/* Display contract budget and line item total */}
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
              {difference < 0 ? 'Over Budget' : 'Remaining'} {/* Indicate if over budget */}
            </span>
            <span className={difference < 0 ? 'text-red-500' : 'text-green-500'}>
              ${Math.abs(difference).toLocaleString()} {/* Display remaining or exceeded amount */}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Budget Utilization</span>
            <span className="text-sm font-medium text-white">{percentageUsed.toFixed(1)}%</span> {/* Show utilization percentage */}
          </div>
          <div
            className={`budgetBar ${getStatusColor()}`} // Dynamic CSS class based on status
            style={{ width: `${Math.min(percentageUsed, 100)}%` }} // Set width of the progress bar
            data-width={Math.min(percentageUsed, 100)} // Data attribute for potential styling or scripts
          />
        </div>

        {percentageUsed > 100 && ( // Display alert if budget is exceeded
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Budget exceeded by {(percentageUsed - 100).toFixed(1)}%</span> {/* Alert message */}
          </div>
        )}
      </div>
    </Card>
  );
}