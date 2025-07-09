// filepath: src\pages\Contract\ProjectDashboardComponents\ContractTotalsPanel.tsx
import React, { useState } from 'react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { BudgetTracker } from '../SharedComponents/BudgetProgressBar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContractTotalsPanelProps {
  totalBudget: number;
  lineItemsTotal: number;
  budgetRemaining: number;
  percentUsed: number;
}

export const ContractTotalsPanel: React.FC<ContractTotalsPanelProps> = ({
  totalBudget,
  lineItemsTotal,
  budgetRemaining,
  percentUsed,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    // Handle NaN or undefined values
    if (isNaN(amount) || amount === undefined) amount = 0;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate safe percentUsed value to avoid NaN or Infinity
  const safePercentUsed =
    totalBudget === 0
      ? 0
      : Math.max(0, Math.min(100, isNaN(percentUsed) ? 0 : percentUsed));

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Contract Totals</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
              aria-label={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>

        <div className="mb-4">
          {/* Ensure we're passing a numeric value for percentUsed */}
          <BudgetTracker
            percentUsed={Number(safePercentUsed)}
            isOverBudget={budgetRemaining < 0}
          />
        </div>

        <div className="space-y-3">
          <TotalItem
            label="Total Budget"
            value={formatCurrency(totalBudget)}
          />

          <TotalItem
            label="Line Items Total"
            value={formatCurrency(lineItemsTotal)}
          />

          <TotalItem
            label="Budget Remaining"
            value={formatCurrency(budgetRemaining)}
            isNegative={budgetRemaining < 0}
          />

          <TotalItem
            label="Budget Utilized"
            value={`${Math.round(safePercentUsed)}%`}
            isNegative={percentUsed > 100}
          />
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="text-sm text-gray-400 italic">
                Detailed historical data and forecasts are not available in view-only mode.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

interface TotalItemProps {
  label: string;
  value: string;
  isNegative?: boolean;
}

const TotalItem = ({ label, value, isNegative }: TotalItemProps) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${isNegative === true ? 'text-red-500' : ''}`}>
        {value}
      </span>
    </div>
  );
};