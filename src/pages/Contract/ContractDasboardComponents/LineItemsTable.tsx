import React, { useState, useMemo } from 'react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { BudgetTracker } from '../SharedComponents/BudgetProgressBar';
import type { 
  LineItemsWithWktRow, 
  WbsWithWktRow
} from '@/lib/rpc.types';

// Define sorting options
type SortableColumn = 'line_code' | 'description' | 'wbs_id' | 'map_id' | 'quantity' | 'unit_price' | 'total' | 'budget_percent';
type SortDirection = 'asc' | 'desc';

/**
 * LineItemsTable Component
 * 
 * Displays line items for a contract in a read-only table format.
 * Each line item includes a budget progress visualization.
 */
interface LineItemsTableProps {
  lineItems: LineItemsWithWktRow[];
  wbsItems: WbsWithWktRow[];
  contractId: string;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lineItems,
  wbsItems
}) => {  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<SortableColumn>('line_code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filtering/search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWbs, setSelectedWbs] = useState<string>('');

  // Get unique WBS and Map IDs for filter dropdowns
  const uniqueWbsItems = useMemo(() => {
    return Array.from(new Set(lineItems.map(item => item.wbs_id)))
      .map(wbsId => wbsItems.find(wbs => wbs.id === wbsId))
      .filter(Boolean) as WbsWithWktRow[];
  }, [lineItems, wbsItems]);

  const getWbsLabel = React.useCallback((wbsId: string) => {
    const wbs = wbsItems.find(item => item.id === wbsId);
    return wbs ? wbs.wbs_number : 'Unknown WBS';
  }, [wbsItems]);

  // Calculate the budget utilization for a line item
  const calculateBudgetPercent = (quantity: number, unitPrice: number, budget: number) => {
    if (budget <= 0) return 0;
    const lineTotal = quantity * unitPrice;
    return (lineTotal / budget) * 100;
  };

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  // Filtered and sorted line items
  const filteredLineItems = useMemo(() => {
    return lineItems
      .filter(item => {
        return (
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedWbs ? item.wbs_id === selectedWbs : true)
        );
      })      .sort((a, b) => {
        let aValue: string | number | null | undefined; // Allow for null/undefined
        let bValue: string | number | null | undefined; // Allow for null/undefined
        
        // Handle special calculated values
        if (sortBy === 'total') {
          aValue = (a.quantity ?? 0) * (a.unit_price ?? 0);
          bValue = (b.quantity ?? 0) * (b.unit_price ?? 0);
        } else if (sortBy === 'budget_percent') {
          const aWbs = wbsItems.find(w => w.id === a.wbs_id);
          const bWbs = wbsItems.find(w => w.id === b.wbs_id);
          const aWbsBudget = aWbs?.budget ?? 0;
          const bWbsBudget = bWbs?.budget ?? 0;
          aValue = calculateBudgetPercent(a.quantity ?? 0, a.unit_price ?? 0, aWbsBudget);
          bValue = calculateBudgetPercent(b.quantity ?? 0, b.unit_price ?? 0, bWbsBudget);
        } else if (sortBy === 'wbs_id') {
          aValue = getWbsLabel(a.wbs_id);
          bValue = getWbsLabel(b.wbs_id);
        } else if (sortBy === 'map_id') {
          // Since mapItems is removed, direct map_id sorting or remove this sort option
          aValue = a.map_id ?? '';
          bValue = b.map_id ?? '';
        } else {          
          aValue = a[sortBy];
          bValue = b[sortBy];
        }
        
        // Ensure consistent comparison for potentially null/undefined values
        if (aValue == null && bValue != null) return sortDirection === 'asc' ? -1 : 1;
        if (aValue != null && bValue == null) return sortDirection === 'asc' ? 1 : -1;
        if (aValue == null && bValue == null) return 0;

        if (aValue! < bValue!) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue! > bValue!) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [lineItems, searchTerm, selectedWbs, sortBy, sortDirection, getWbsLabel, wbsItems]); // getMapLabel removed, wbsItems added

  // Paginated line items
  const paginatedLineItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLineItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLineItems, currentPage, itemsPerPage]);

  return (
    <Card>
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Line Items</h2>
        </div>

        {/* Search and filter controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-500"
            />
          </div>          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <select
              value={selectedWbs}
              onChange={e => setSelectedWbs(e.target.value)}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
              aria-label="Filter by WBS"
            >
              <option value="">All WBS</option>
              {uniqueWbsItems.map(wbs => (
                <option key={wbs.id} value={wbs.id}>
                  {wbs.wbs_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items per page selector - restored per request */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <label htmlFor="itemsPerPageSelect" className="mr-2">Show:</label>
            <select
              id="itemsPerPageSelect"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:text-white"
              aria-label="Number of items to show per page"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="ml-2">entries</span>
          </div>
        </div>

        {paginatedLineItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No line items available for this contract</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('line_code');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Code
                      {sortBy === 'line_code' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('description');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Description
                      {sortBy === 'description' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('wbs_id');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      WBS
                      {sortBy === 'wbs_id' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('map_id');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Map
                      {/* Display logic for map sort indicator might need adjustment */}
                      {sortBy === 'map_id' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('quantity');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Quantity
                      {sortBy === 'quantity' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('unit_price');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Price
                      {sortBy === 'unit_price' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('total');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Total
                      {sortBy === 'total' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        setSortBy('budget_percent');
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1"
                    >
                      Budget
                      {sortBy === 'budget_percent' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedLineItems.map(item => {
                  const lineTotal = item.quantity * item.unit_price;
                  const wbs = wbsItems.find(w => w.id === item.wbs_id);
                  const wbsBudget = wbs ? wbs.budget : 0;
                  const percentUsed = calculateBudgetPercent(item.quantity, item.unit_price, wbsBudget);
                  const isOverBudget = percentUsed > 100;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-800">
                      <td className="px-3 py-3 text-sm">{item.line_code}</td>
                      <td className="px-3 py-3 text-sm">{item.description}</td>
                      <td className="px-3 py-3 text-sm">{getWbsLabel(item.wbs_id)}</td>
                      {/* Display for map_id will now show the ID directly or 'N/A' */}
                      <td className="px-3 py-3 text-sm">{item.map_id || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-right">
                        {(item.quantity ?? 0).toFixed(2)} {item.unit_measure}
                      </td>
                      <td className="px-3 py-3 text-sm text-right">{formatCurrency(item.unit_price ?? 0)}</td>
                      <td className="px-3 py-3 text-sm text-right">{formatCurrency(lineTotal)}</td>                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24">
                            <BudgetTracker 
                              percentUsed={percentUsed} 
                              isOverBudget={isOverBudget}
                              className="scale-90"
                            />
                          </div>
                          <span className="text-xs">{percentUsed.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="px-3 py-3 text-right text-sm font-medium">Total:</td>
                  <td className="px-3 py-3 text-right text-sm font-medium">
                    {formatCurrency(
                      lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLineItems.length)} of {filteredLineItems.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredLineItems.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredLineItems.length / itemsPerPage)}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
