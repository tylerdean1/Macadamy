import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { toast } from 'sonner';
import type { Contracts } from '@/lib/types';

interface ContractsSectionProps {
  filteredContracts: Contracts[];
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ContractsSection({
  filteredContracts,
  searchQuery,
  onSearchChange,
}: ContractsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-6">Contracts</h2>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search contracts..."
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

      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Contracts Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'No contracts match your search criteria'
                : 'Start by creating your first contract'}
            </p>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
              onClick={() => {
                if (!contract.id) {
                  toast.error('Contract ID is missing, cannot open contract.');
                  console.error('Contract ID missing for selected contract:', contract);
                  return;
                }
                navigate(`/contracts/${contract.id}`);
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {contract.title?.replace(/\s*\(Demo:.*?\)/i, '')?.trim() || 'N/A'}
                    {contract.title?.includes('(Demo:') && (
                      <span className="ml-2 text-xs text-yellow-400 font-semibold">Demo</span>
                    )}
                  </h3>
                  <p className="text-gray-400 mb-4">{contract.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {contract.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {contract.location}
                      </div>
                    )}
                    {contract.start_date && contract.end_date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(contract.start_date).toLocaleDateString()} –{' '}
                        {new Date(contract.end_date).toLocaleDateString()}
                      </div>
                    )}
                    {typeof contract.budget === 'number' && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ${contract.budget.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      contract.status === 'Active'
                        ? 'success'
                        : contract.status === 'Final Review'
                        ? 'info'
                        : contract.status === 'Closed'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {contract.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}