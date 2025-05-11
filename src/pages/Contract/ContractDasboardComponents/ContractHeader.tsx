import React from 'react';
import { ContractStatusSelect } from '@/pages/Contract/SharedComponents/ContractStatusSelect';
import { GeometryButton } from '@/pages/Contract/SharedComponents/GoogleMaps/GeometryButton';
import type { GeometryData } from '@/lib/types';
import type { Database } from '@/lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'] & {
  coordinates?: GeometryData | null;
  coordinates_wkt?: string | null;
};

interface ContractHeaderProps {
  contract: Contract;
  onStatusChange: (newStatus: Contract['status']) => Promise<void>;
  refresh?: () => void;
}

export const ContractHeader: React.FC<ContractHeaderProps> = ({
  contract,
  onStatusChange,
  refresh,
}) => {
  const title = contract?.title?.replace(/\s*\(CLONE\)/i, '')?.trim() || 'N/A';
  const isClone = contract?.title?.includes('(CLONE)');
  const dateRange =
    contract?.start_date && contract?.end_date
      ? `${new Date(contract.start_date).toLocaleDateString()} - ${new Date(
          contract.end_date
        ).toLocaleDateString()}`
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
              <ContractStatusSelect value={contract.status} onChange={onStatusChange} />
            )}
          </div>

          {contract.location && (
            <p className="text-sm text-gray-400 mt-1">
              <strong>Location:</strong> {contract.location}
            </p>
          )}

          {contract.description && (
            <p className="text-sm text-gray-300 mt-1 italic">{contract.description}</p>
          )}

          {contract.coordinates && (
            <div className="mt-2">
              <GeometryButton
                geometry={contract.coordinates}
                wkt={null}
                table="contracts"
                targetId={contract.id}
                label="View Contract Map"
                onSaveSuccess={refresh}
              />
            </div>
          )}
        </div>

        <div className="w-full sm:w-auto text-left sm:text-right">
          <p className="text-sm text-gray-500">Contract Period</p>
          <p className="text-gray-300">{dateRange}</p>
        </div>
      </div>
    </div>
  );
};
