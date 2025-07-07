/**
 * Contract Dashboard
 * 
 * Enhanced with comprehensive improvements across all components:
 * - ContractHeader: Converted to functional component with hooks, improved error handling
 * - ContractTools: Added tooltips, permission checks, badges, and real-time updates
 * - ContractTotalsPanel: Added trend visualization, forecasting, drill-down, and export
 * - ContractInfoForm: Added compact/detailed view toggle, edit capabilities
 * - WbsSection: Added expand/collapse, sorting, filtering, and improved UI
 * - LineItemsTable: Added pagination, sorting, filtering, and improved accessibility
 */
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Page } from '@/pages/StandardPages/StandardPageComponents/Page';
import { PageContainer } from '@/pages/StandardPages/StandardPageComponents/PageContainer';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import type { ContractWithWktRow, WbsWithWktRow, LineItemsWithWktRow } from '@/lib/rpc.types';
import { UnitMeasureType } from '@/lib/enums';

import { ContractHeader } from './ContractDasboardComponents/ContractHeader';
import { ContractInfoForm } from './ContractDasboardComponents/ContractInfoForm';
import { ContractTotalsPanel } from './ContractDasboardComponents/ContractTotalsPanel';
import { WbsSection } from './ContractDasboardComponents/WbsSection';
import { LineItemsTable } from './ContractDasboardComponents/LineItemsTable';
import { ContractTools } from './ContractDasboardComponents/ContractTools';

export default function ContractDashboard() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractWithWktRow | null>(null);
  const [wbsItems, setWbsItems] = useState<WbsWithWktRow[]>([]);
  const [lineItems, setLineItems] = useState<LineItemsWithWktRow[]>([]);
  const [issuesCount, setIssuesCount] = useState<number>(0);
  const [changeOrdersCount, setChangeOrdersCount] = useState<number>(0);
  const [inspectionsCount, setInspectionsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch contract data
  const fetchContractData = useCallback(async () => {
    if (typeof contractId !== 'string' || !contractId.trim()) {
      setError(new Error('No contract ID provided.'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch contract details
      const { data: contractDetails, error: contractError } = await supabase
        .rpc('get_contract_with_wkt', { contract_id: contractId });
      if (contractError) throw contractError;
      if (!Array.isArray(contractDetails) || contractDetails.length === 0) {
        setError(new Error('Contract not found.'));
        setContract(null);
      } else {
        setContract(contractDetails[0]);
      }

      // Fetch WBS items using RPC
      const { data: wbsData, error: wbsError } = await supabase
        .rpc('get_wbs_with_wkt', { _contract_id: contractId });
      if (wbsError) throw wbsError;
      const wbsRows: WbsWithWktRow[] = Array.isArray(wbsData) ? wbsData.map(item => ({
        id: item.id,
        contract_id: item.contract_id,
        wbs_number: item.wbs_number ?? null,
        budget: item.budget ?? null,
        scope: item.scope ?? null,
        location: item.location ?? null,
        coordinates_wkt: item.coordinates_wkt ?? null,
      })) : [];
      setWbsItems(wbsRows);

      // Fetch Line Items using RPC
      const { data: lineItemsData, error: lineItemsError } = await supabase
        .rpc('get_line_items_with_wkt', { _contract_id: contractId });
      if (lineItemsError) throw lineItemsError;
      const lineItemsRows: LineItemsWithWktRow[] = Array.isArray(lineItemsData) ? lineItemsData.map(item => {
        // Validate unit_measure against enum
        const validUnitMeasures = Object.values(UnitMeasureType);
        let safeUnit: UnitMeasureType | null = null;
        if (typeof item.unit_measure === 'string' && validUnitMeasures.includes(item.unit_measure as UnitMeasureType)) {
          safeUnit = item.unit_measure as UnitMeasureType;
        }
        // Fix: Use item.line_code for legacy, otherwise item.item_code, and always assign to item_code for LineItemsWithWktRow
        return {
          id: item.id,
          contract_id: item.contract_id,
          wbs_id: item.wbs_id,
          map_id: item.map_id ?? null,
          item_code: 'item_code' in item && typeof item.item_code === 'string' ? item.item_code : ('line_code' in item && typeof item.line_code === 'string' ? item.line_code : null),
          description: item.description ?? null,
          quantity: item.quantity ?? 0,
          unit_price: item.unit_price ?? 0,
          unit_measure: safeUnit,
          reference_doc: item.reference_doc ?? null,
          template_id: item.template_id ?? null,
          coordinates_wkt: item.coordinates_wkt ?? null,
        };
      }) : [];
      setLineItems(lineItemsRows);

      // Fetch counts
      const { data: issuesCountData, error: issuesCountError } = await supabase
        .rpc('get_issues_count_for_contract', { contract_id_param: contractId });
      if (issuesCountError) throw issuesCountError;
      setIssuesCount(issuesCountData || 0);

      const { data: changeOrdersCountData, error: changeOrdersCountError } = await supabase
        .rpc('get_change_orders_count_for_contract', { contract_id_param: contractId });
      if (changeOrdersCountError) throw changeOrdersCountError;
      setChangeOrdersCount(changeOrdersCountData || 0);

      const { data: inspectionsCountData, error: inspectionsCountError } = await supabase
        .rpc('get_inspections_count_for_contract', { contract_id_param: contractId });
      if (inspectionsCountError) throw inspectionsCountError;
      setInspectionsCount(inspectionsCountData || 0);

    } catch (err) {
      console.error('Error fetching contract data:', err);
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch contract data');
      setError(fetchError);
      setContract(null);
      setWbsItems([]);
      setLineItems([]);
      setIssuesCount(0);
      setChangeOrdersCount(0);
      setInspectionsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [contractId]); // Removed navigate from dependencies as it was not used in the callback

  // Initial data fetch
  useEffect(() => {
    void fetchContractData(); // Use void for fire-and-forget
  }, [fetchContractData]);

  // Real-time subscriptions
  useEffect(() => {
    if (typeof contractId !== 'string' || !contractId.trim()) return; // Explicit null/empty check

    const changes = supabase
      .channel(`contract-dashboard-${contractId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts', filter: `id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wbs', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'line_items', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_orders', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections', filter: `contract_id=eq.${contractId}` }, () => { void fetchContractData(); })
      .subscribe();

    return () => {
      void supabase.removeChannel(changes); // Use void for fire-and-forget
    };
  }, [contractId, fetchContractData]);

  if (isLoading) {
    return (
      <Page>
        <PageContainer>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingState size="lg" message="Loading contract data..." />
          </div>
        </PageContainer>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageContainer>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-850 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-red-400">Error Loading Contract</h2>
                <p className="text-gray-300 mb-6">{error.message}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => { void fetchContractData(); }} // Wrap async in void arrow
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </Page>
    );
  }

  if (!contract) {
    return (
      <Page>
        <PageContainer>
          <div className="container mx-auto px-4 py-8">
            <EmptyState
              icon={<FileText size={48} className="opacity-50" />}
              message="Contract not found"
              description="The contract you're looking for doesn't exist or you don't have permission to view it."
              actionButton={
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                >
                  Return to Dashboard
                </button>
              }
            />
          </div>
        </PageContainer>
      </Page>
    );
  }

  return (
    <Page>
      <PageContainer>
        <div className="container mx-auto px-4 py-6">
          <ContractHeader
            contract={contract}
          />

          <ContractTools
            contractId={contract.id}
            issuesCount={issuesCount}
            changeOrdersCount={changeOrdersCount}
            inspectionsCount={inspectionsCount}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ContractInfoForm
                contractData={contract}
              />
            </div>
            <div className="lg:col-span-1">
              <ContractTotalsPanel
                totalBudget={typeof contract.budget === 'number' ? contract.budget : 0}
                lineItemsTotal={lineItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && typeof item.unit_price === 'number' ? item.quantity * item.unit_price : 0), 0)}
                budgetRemaining={(typeof contract.budget === 'number' ? contract.budget : 0) - lineItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && typeof item.unit_price === 'number' ? item.quantity * item.unit_price : 0), 0)}
                percentUsed={(() => {
                  const budget = typeof contract.budget === 'number' && contract.budget !== 0 ? contract.budget : 1;
                  const used = lineItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && typeof item.unit_price === 'number' ? item.quantity * item.unit_price : 0), 0);
                  return (used / budget) * 100;
                })()}
              />
            </div>
          </div>
          <WbsSection
            wbsItems={wbsItems}
            lineItems={lineItems}
            contractId={contract.id} // Use contract.id for a guaranteed string
            isLoading={isLoading}
            error={error}
            onRetry={() => { void fetchContractData(); }} // Wrap async in void arrow
          />
          <LineItemsTable
            lineItems={lineItems}
            wbsItems={wbsItems}
            contractId={contract.id} // Use contract.id for a guaranteed string
          />
        </div>
      </PageContainer>
    </Page>
  );
};
