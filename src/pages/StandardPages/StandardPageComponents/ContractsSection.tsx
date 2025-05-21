import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';

import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import type { Variant } from '@/lib/ui.types';

import { toast } from 'sonner';

/* ---------- props ---------- */
// Define a type for a contract (customize as needed)
interface Contract {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status?: string;
}

interface ContractsSectionProps {
  filteredContracts: Contract[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export function ContractsSection({
  filteredContracts,
  searchQuery,
  onSearchChange,
}: ContractsSectionProps): JSX.Element {
  const navigate = useNavigate();

  // Use filteredContracts prop directly
  const contracts = Array.isArray(filteredContracts) ? filteredContracts : [];

  if (!contracts.length) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          No Contracts Found
        </h3>
        <p className="text-gray-400 mb-6">
          {searchQuery
            ? 'No contracts match your search criteria'
            : 'Start by creating your first contract'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-6">Contracts</h2>

      {/* search + create */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search contracts."
                value={searchQuery}
                onChange={onSearchChange}
                className="w-full sm:w-64 pl-10"
              />
            </div>
          </div>

          <Button
            onClick={() => navigate('/ContractCreation')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Contract
          </Button>
        </div>
      </div>

      {/* list */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Contracts Found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'No contracts match your search criteria'
                : 'Start by creating your first contract'}
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            if (typeof contract?.id !== 'string' || contract.id.length === 0)
              return null;

            const title =
              typeof contract.title === 'string'
                ? contract.title.replace(/\s*\(Demo:.*?\)/i, '').trim()
                : 'N/A';
            const hasDemo =
              typeof contract.title === 'string' &&
              contract.title.includes('(Demo:');
            const description = contract.description ?? '';
            const location = contract.location ?? '';
            const startDate =
              typeof contract.start_date === 'string' &&
                contract.start_date.length > 0
                ? contract.start_date
                : undefined;
            const endDate =
              typeof contract.end_date === 'string' &&
                contract.end_date.length > 0
                ? contract.end_date
                : undefined;
            const budget =
              typeof contract.budget === 'number'
                ? contract.budget.toLocaleString()
                : '';
            const status = contract.status ?? '';

            const hasStartDate = typeof startDate === 'string' && startDate.length > 0;
            const hasEndDate = typeof endDate === 'string' && endDate.length > 0;

            return (
              <div
                key={contract.id}
                className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => {
                  if (!contract.id) {
                    toast.error(
                      'Contract ID is missing, cannot open contract.',
                    );
                    console.error(
                      'Contract ID missing for selected contract:',
                      contract,
                    );
                    return;
                  }
                  navigate(`/contracts/${contract.id}`);
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* left column ------------------------------------------------ */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {title}
                      {hasDemo && (
                        <span className="ml-2 text-xs text-yellow-400 font-semibold">
                          Demo
                        </span>
                      )}
                    </h3>

                    <p className="text-gray-400 mb-4">{description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      {location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {location}
                        </span>
                      )}

                      {hasStartDate && hasEndDate && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {startDate}
                          {' – '}
                          {endDate}
                        </span>
                      )}

                      {typeof contract.budget === 'number' && (
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${budget}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* status badge ----------------------------------------------- */}
                  <Badge variant={'default' as Variant} icon={undefined}>
                    {status}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}