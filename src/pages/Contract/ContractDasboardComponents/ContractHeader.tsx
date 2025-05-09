import React from 'react';
import { ContractStatusSelect } from '@/pages/Contract/SharedComponents/ContractStatusSelect';
import type { Database } from '@/lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];

interface ContractHeaderProps {
  contract: Contract;
  onStatusChange: (newStatus: Contract['status']) => Promise<void>;
}

export const ContractHeader: React.FC<ContractHeaderProps> = ({ contract, onStatusChange }) => {
  const title = contract?.title?.replace(/\s*\(CLONE\)/i, '')?.trim() || 'N/A';
  const isClone = contract?.title?.includes('(CLONE)');
  const dateRange = contract?.start_date && contract?.end_date
    ? `${new Date(contract.start_date).toLocaleDateString()} - ${new Date(contract.end_date).toLocaleDateString()}`
    : 'N/A';

  return (
    <div className="border-b border-background-lighter pb-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">{title}</h1>
              {isClone && (
                <span className="px-2 py-0.5 text-xs rounded-md bg-yellow-500/20 text-yellow-300 font-medium border border-yellow-500">
                  Demo
                </span>
              )}
            </div>
            {contract.status && (
              <ContractStatusSelect
                value={contract.status}
                onChange={onStatusChange}
              />
            )}
          </div>
          <h2 className="text-lg sm:text-xl text-gray-400">{contract.description}</h2>
        </div>
        <div className="w-full sm:w-auto text-left sm:text-right">
          <p className="text-sm text-gray-500">Contract Period</p>
          <p className="text-gray-300">{dateRange}</p>
        </div>
      </div>
    </div>
  );
};
