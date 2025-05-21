import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { BudgetTracker } from '../SharedComponents/BudgetProgressBar';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Search, SortAsc, SortDesc, Map, FileText, AlertTriangle } from 'lucide-react';
import type {
  WbsWithWktRow,
  LineItemsWithWktRow
} from '@/lib/rpc.types';
import { supabase } from '@/lib/supabase';

// Define sorting options
type SortOption = 'wbs_number' | 'budget' | 'utilization';

interface WbsSectionProps {
  /**
   * WBS items
   */
  wbsItems: WbsWithWktRow[];
  /**
   * Line items
   */
  lineItems: LineItemsWithWktRow[];
  /**
   * Contract ID
   */
  contractId?: string;
  /**
   * Whether the component is in a loading state
   */
  isLoading?: boolean;
  /**
   * Error state
   */
  error?: Error | string | null;
  /**
   * Retry callback for error states
   */
  onRetry?: () => void;
  /**
   * Additional class names
   */
  className?: string;
}

export function WbsSection({
  wbsItems,
  lineItems,
  contractId,
  isLoading = false,
  error = null,
  onRetry,
  className = ''
}: WbsSectionProps) {
  // Track expanded state for each WBS item
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  // Sorting state
  const [sortBy, setSortBy] = useState<SortOption>('wbs_number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Filter/search state
  const [searchTerm, setSearchTerm] = useState('');
  // Real-time update state
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

  // Subscribe to real-time updates
  useEffect(() => {
    if (typeof contractId !== 'string' || contractId.length === 0) return;

    const wbsSubscription = supabase
      .channel(`wbs-${contractId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wbs',
        filter: `contract_id=eq.${contractId}`
      }, () => {
        setRealtimeStatus('connected');
        if (onRetry) onRetry();
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('error');
        }
      });

    return () => {
      void wbsSubscription.unsubscribe();
      setRealtimeStatus('disconnected');
    };
  }, [contractId, onRetry]);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  // Calculate budget utilization for a WBS
  const calculateBudgetUtilization = useCallback((wbsId: string) => {
    const items = lineItems.filter(item => item.wbs_id === wbsId);
    const wbs = wbsItems.find(w => w.id === wbsId);

    if (!wbs || typeof wbs.budget !== 'number' || isNaN(wbs.budget) || wbs.budget <= 0) return 0;

    // Handle case where there are no line items
    if (!items.length) return 0;

    // Safely calculate total used amount, handling potential null/undefined values
    const totalUsed = items.reduce((sum, item) => {
      const quantity = item.quantity ?? 0;
      const unitPrice = item.unit_price ?? 0;
      return sum + (quantity * unitPrice);
    }, 0);

    return (totalUsed / wbs.budget) * 100;
  }, [lineItems, wbsItems]);

  // Get maps count for a WBS - MODIFIED or REMOVED
  // This function relied on mapItems. If map display is still desired without direct mapItems prop,
  // it might need to fetch this info or it might be removed if maps are not shown in WBS section anymore.
  // For now, let's assume map count is not displayed directly in WBS rows or it's derived differently.
  const getMapsCount = () => { // wbsId parameter removed
    // Placeholder: If WBS items themselves contain map-related info (e.g., a count or a boolean has_maps)
    // that could be used. Otherwise, this needs to be re-evaluated or removed.
    // const wbs = wbsItems.find(w => w.id === wbsId);
    // return wbs?.maps_count || 0; // Example if wbs item had a maps_count property
    return 0; // Defaulting to 0 as mapItems is removed
  };

  // Get line items count for a WBS
  const getLineItemsCount = (wbsId: string) => {
    return lineItems.filter(item => item.wbs_id === wbsId).length;
  };

  // Toggle expanded state for a WBS item
  const toggleExpanded = (wbsId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [wbsId]: !prev[wbsId]
    }));
  };

  // Handle sort toggle
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  // Filter and sort WBS items
  const sortedAndFilteredWbs = useMemo(() => {
    // First apply search/filter
    let filtered = wbsItems;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = wbsItems.filter(item =>
        item.wbs_number.toLowerCase().includes(search) ||
        (item.scope ?? '').toLowerCase().includes(search) ||
        (item.location ?? '').toLowerCase().includes(search)
      );
    }

    // Then apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'wbs_number') {
        return sortOrder === 'asc'
          ? a.wbs_number.localeCompare(b.wbs_number)
          : b.wbs_number.localeCompare(a.wbs_number);
      } else if (sortBy === 'budget') {
        return sortOrder === 'asc'
          ? (a.budget ?? 0) - (b.budget ?? 0)
          : (b.budget ?? 0) - (a.budget ?? 0);
      } else { // utilization
        const utilizationA = calculateBudgetUtilization(a.id);
        const utilizationB = calculateBudgetUtilization(b.id);
        return sortOrder === 'asc'
          ? utilizationA - utilizationB
          : utilizationB - utilizationA;
      }
    });
  }, [wbsItems, searchTerm, sortBy, sortOrder, calculateBudgetUtilization]);

  if (isLoading) {
    return (
      <Card className={`mt-6 ${className}`}>
        <LoadingState message="Loading WBS items..." />
      </Card>
    );
  }

  if (typeof error === 'string' ? error.length > 0 : !!error) {
    return (
      <Card className={`mt-6 ${className}`}>
        <ErrorState
          error={error instanceof Error ? error : String(error)}
          title="Error loading WBS items"
          onRetry={onRetry}
        />
      </Card>
    );
  }

  return (
    <Card className={`mt-6 ${className}`}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h2 className="text-lg font-semibold">Work Breakdown Structure</h2>

          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search WBS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 pl-8 text-sm rounded-md bg-gray-800 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary"
                aria-label="Search WBS items"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-500" />
            </div>

            {/* Sort buttons */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-md p-1">
              <button
                onClick={() => handleSort('wbs_number')}
                className={`p-1.5 rounded-md text-xs ${sortBy === 'wbs_number' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                title={`Sort by WBS Number (${sortBy === 'wbs_number' && sortOrder === 'asc' ? 'descending' : 'ascending'})`}
                aria-label={`Sort by WBS Number (${sortBy === 'wbs_number' && sortOrder === 'asc' ? 'descending' : 'ascending'})`}
              >
                <div className="flex items-center">
                  WBS#
                  {sortBy === 'wbs_number' && (sortOrder === 'asc' ? <SortAsc size={14} className="ml-1" /> : <SortDesc size={14} className="ml-1" />)}
                </div>
              </button>
              <button
                onClick={() => handleSort('budget')}
                className={`p-1.5 rounded-md text-xs ${sortBy === 'budget' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                title={`Sort by Budget (${sortBy === 'budget' && sortOrder === 'asc' ? 'descending' : 'ascending'})`}
                aria-label={`Sort by Budget (${sortBy === 'budget' && sortOrder === 'asc' ? 'descending' : 'ascending'})`}
              >
                <div className="flex items-center">
                  Budget
                  {sortBy === 'budget' && (sortOrder === 'asc' ? <SortAsc size={14} className="ml-1" /> : <SortDesc size={14} className="ml-1" />)}
                </div>
              </button>
              <button
                onClick={() => handleSort('utilization')}
                className={`p-1.5 rounded-md text-xs ${sortBy === 'utilization' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                title={`Sort by Utilization (${sortBy === 'utilization' && sortOrder === 'asc' ? 'descending' : 'ascending'})`}
                aria-label={`Sort by Utilization (${sortBy === 'utilization' && sortOrder === 'asc' ? 'descending' : 'ascending'})`}
              >
                <div className="flex items-center">
                  Usage
                  {sortBy === 'utilization' && (sortOrder === 'asc' ? <SortAsc size={14} className="ml-1" /> : <SortDesc size={14} className="ml-1" />)}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Realtime indicator */}
        {realtimeStatus === 'connected' && (
          <div className="mb-3 flex items-center text-xs text-green-500">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
            Real-time updates active
          </div>
        )}

        {/* WBS Items List */}
        {sortedAndFilteredWbs.length > 0 ? (
          <div className="space-y-3">
            {sortedAndFilteredWbs.map((wbs) => {
              const isExpanded = expandedItems[wbs.id] || false;
              const utilization = calculateBudgetUtilization(wbs.id);
              const mapsCount = getMapsCount();
              const lineItemsCount = getLineItemsCount(wbs.id);

              return (
                <div
                  key={wbs.id}
                  className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-200"
                >
                  {/* WBS Item Header - Always visible */}                  <div
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-750"
                    onClick={() => toggleExpanded(wbs.id)}
                  >
                    <div className="flex items-center mb-2 md:mb-0">
                      <div className="mr-2">
                        {isExpanded ?
                          <ChevronUp size={18} className="text-gray-400 hover:text-white focus:outline-none" /> :
                          <ChevronDown size={18} className="text-gray-400 hover:text-white focus:outline-none" />
                        }
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          <span className="text-white">{wbs.wbs_number}</span>
                          {typeof wbs.coordinates_wkt === 'string' && wbs.coordinates_wkt.length > 0 && (
                            <span className="ml-2 text-gray-400">
                              <Map size={14} />
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">{wbs.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium">{formatCurrency(wbs.budget ?? 0)}</div>
                        <div className="text-xs text-gray-400">
                          <span className="inline-flex items-center">
                            <FileText size={12} className="mr-1" />
                            {lineItemsCount} items
                          </span>
                          {mapsCount > 0 && (
                            <span className="inline-flex items-center ml-2">
                              <Map size={12} className="mr-1" />
                              {mapsCount} maps
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-24">
                        <BudgetTracker
                          percentUsed={utilization}
                          isOverBudget={utilization > 100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-gray-700">
                      <div className="text-sm text-gray-300 whitespace-pre-line mb-4">
                        {typeof wbs.scope === 'string' && wbs.scope.length > 0 ? wbs.scope : 'No scope description available.'}
                      </div>

                      {/* Maps and Line Items Summary */}
                      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                        {/* Maps section in expanded view - MODIFIED or REMOVED */}
                        {/* This section relied on mapItems. It will be simplified or removed. */}
                        {/* For now, let's hide it if mapsCount is 0 based on the modified getMapsCount */}
                        {mapsCount > 0 && (
                          <div className="bg-gray-750 p-3 rounded-md flex-1">
                            <h4 className="text-sm font-medium mb-2 flex items-center">
                              <Map size={14} className="mr-1.5" />
                              Maps ({mapsCount})
                            </h4>
                            {/* Display logic for maps would need to change if mapItems is not passed */}
                            {/* For simplicity, showing a placeholder or minimal info if mapsCount > 0 */}
                            <div className="text-xs text-gray-500 italic">Map details not available here.</div>
                          </div>
                        )}

                        <div className="bg-gray-750 p-3 rounded-md flex-1">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <FileText size={14} className="mr-1.5" />
                            Line Items ({lineItemsCount})
                          </h4>
                          {lineItemsCount > 0 ? (
                            <div className="space-y-2">
                              {lineItems
                                .filter(item => item.wbs_id === wbs.id)
                                .slice(0, 3) // Show only first 3
                                .map(item => {
                                  // Fix: Add nullish coalescing or fallback for possibly null fields
                                  return (
                                    <div key={item.id} className="text-xs p-2 bg-gray-800 rounded flex justify-between">
                                      <span className="text-gray-300">{item.line_code}</span>
                                      <span className="text-gray-400">{formatCurrency(item.quantity * item.unit_price)}</span>
                                    </div>
                                  );
                                })
                              }
                              {lineItemsCount > 3 && (
                                <div className="text-xs text-center text-blue-400 mt-1">
                                  + {lineItemsCount - 3} more items
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 italic">No line items defined</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<AlertTriangle size={32} className="text-gray-500" />}
            message={searchTerm ? "No matching WBS items found" : "No WBS items available"}
            description={searchTerm ? "Try adjusting your search criteria" : "No work breakdown structure has been defined for this contract yet."}
          />
        )}
      </div>
    </Card>
  );
}
