import React from 'react';

interface ContractTotalsPanelProps {
  totalContractValue: number;
  amountPaid: number;
  progressPercent: number;
}

export const ContractTotalsPanel: React.FC<ContractTotalsPanelProps> = ({
  totalContractValue,
  amountPaid,
  progressPercent,
}) => {
  return (
    <div className="bg-background-light p-4 sm:p-6 rounded-lg mt-6 border border-background-lighter">
      <h3 className="text-xl font-semibold text-white mb-4">Contract Totals</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
        <div>
          <p className="text-sm text-gray-400 mb-1">Total Contract Value</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            ${totalContractValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Total Amount Paid</p>
          <p className="text-xl sm:text-2xl font-bold text-white">
            ${amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Overall Progress</p>
          <div className="flex items-center">
            <div className="w-24 sm:w-32 bg-background-lighter rounded-full h-3 mr-3">
              <div
                className="bg-primary rounded-full h-3 progress-bar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
