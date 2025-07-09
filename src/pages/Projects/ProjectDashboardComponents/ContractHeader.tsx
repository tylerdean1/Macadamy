import { useState, useEffect } from 'react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { ContractStatusBadge } from '../SharedComponents/ContractStatusBadge';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import type { ContractWithWktRow } from '@/lib/rpc.types';
import { ErrorBoundary } from 'react-error-boundary';
import { CalendarRange, MapPin } from 'lucide-react';

interface ContractHeaderProps {
  /**
   * Contract data
   */
  contract: ContractWithWktRow;
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
  /**
   * Error message
   */
  error?: Error | string | null;
}

/**
 * ErrorFallback component to display when the ContractHeader encounters an error
 */
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <Card className="mb-6">
    <div className="p-4 md:p-6 text-center">
      <ErrorState
        error={error}
        onRetry={resetErrorBoundary}
        title="Error Loading Contract Header"
      />
    </div>
  </Card>
);

/**
 * ContractHeader Component
 * 
 * Displays the contract header information including title, status, location,
 * description, map button, and contract period.
 */
export function ContractHeader({
  contract,
  isLoading = false,
  error = null
}: ContractHeaderProps) {
  const [contractData, setContractData] = useState<ContractWithWktRow>(contract);

  // Update local state when contract prop changes
  useEffect(() => {
    setContractData(contract);
  }, [contract]);

  // Format a date string for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'; try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <LoadingState message="Loading contract information..." />
      </Card>
    );
  }

  // error: use direct check for error (error !== null && error !== undefined && error !== '')
  if (error !== null && error !== undefined && error !== '') {
    return (
      <Card className="mb-6">
        <ErrorState
          error={error instanceof Error ? error : String(error)}
          title="Error Loading Contract Header"
        />
      </Card>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} >
      <Card className="mb-6">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title and status */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                {contractData.title}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                {/* ContractStatusBadge: fallback to 'Draft' if status is null */}
                <ContractStatusBadge status={contractData.status ?? 'Draft'} />
                <span className="text-sm text-gray-400 flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {/* location: handle null/empty */}
                  {typeof contractData.location === 'string' && contractData.location.trim() !== '' ? contractData.location : 'No location specified'}
                </span>
                <span className="text-sm text-gray-400 flex items-center">
                  <CalendarRange size={14} className="mr-1" />
                  {/* formatDate: pass empty string if date is null */}
                  {formatDate(contractData.start_date ?? '')} - {formatDate(contractData.end_date ?? '')}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* coordinates_wkt: handle null/empty */}
              {typeof contractData.coordinates_wkt === 'string' && contractData.coordinates_wkt.trim() !== '' && (
                <button
                  onClick={() => window.alert('Map view not implemented')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-700 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="View contract on map"
                >
                  <MapPin size={14} className="mr-1" />
                  View Map
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {typeof contractData.description === 'string' && contractData.description.trim() !== '' && (
            <div className="mt-4">
              <p className="text-gray-300 whitespace-pre-line">
                {contractData.description}
              </p>
            </div>
          )}
        </div>
      </Card>
    </ErrorBoundary>
  );
}
