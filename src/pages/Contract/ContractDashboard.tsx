import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { geometryToWKT } from '@/lib/utils/wktUtils';
import type { GeometryData, ProcessedMap, WBSGroup } from '@/lib/types';
import {
  useContractData,
  type LineItem,
} from '@/hooks/contractHooks';
import type { ContractStatusValue } from '@/lib/enums';

import { ContractHeader } from '@/pages/Contract/ContractDasboardComponents/ContractHeader';
import { ContractToolbar } from '@/pages/Contract/ContractDasboardComponents/ContractToolBar';
import { ContractTotalsPanel } from '@/pages/Contract/ContractDasboardComponents/ContractTotalsPanel';
import { WbsSection } from '@/pages/Contract/ContractDasboardComponents/WbsSection';
import { Page } from '@/pages/StandardPages/StandardPageComponents/Page';
import { PageContainer } from '@/pages/StandardPages/StandardPageComponents/PageContainer';
import { CardSection } from '@/pages/StandardPages/StandardPageComponents/CardSection';
import { MapModal } from '@/pages/Contract/SharedComponents/GoogleMaps/MapModal';

export function ContractDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, wbsGroups, loading, error, refresh } = useContractData(id);

  const [openMapModal, setOpenMapModal] = useState(false);
  const [mapTargetId, setMapTargetId] = useState<string | null>(null);
  const [tableTarget, setTableTarget] = useState<'contracts' | 'wbs' | 'maps' | 'line_items'>('contracts');
  const [existingWKT, setExistingWKT] = useState<string | null>(null);
  const [expandedWBS, setExpandedWBS] = useState<string[]>([]);
  const [expandedMaps, setExpandedMaps] = useState<string[]>([]);

  const handleMapLevelClick = (map: ProcessedMap) => {
    setMapTargetId(map.id);
    setExistingWKT(geometryToWKT(map.coordinates ?? null));
    setTableTarget('maps');
    setOpenMapModal(true);
  };

  const handleWbsClick = (wbsId: string, coordinates: GeometryData | null) => {
    setMapTargetId(wbsId);
    setExistingWKT(geometryToWKT(coordinates ?? null));
    setTableTarget('wbs');
    setOpenMapModal(true);
  };

  const handleLineItemClick = (item: LineItem) => {
    setMapTargetId(item.id);
    setExistingWKT(geometryToWKT(item.coordinates ?? null));
    setTableTarget('line_items');
    setOpenMapModal(true);
  };

  const toggleWBS = (wbs: string) => {
    setExpandedWBS((prev) =>
      prev.includes(wbs) ? prev.filter((w) => w !== wbs) : [...prev, wbs]
    );
  };

  const toggleMap = (mapId: string) => {
    setExpandedMaps((prev) =>
      prev.includes(mapId) ? prev.filter((id) => id !== mapId) : [...prev, mapId]
    );
  };

  const totals = useMemo(() => {
    return wbsGroups.reduce(
      (acc, group) => ({
        contractTotal: acc.contractTotal + (group.contractTotal || 0),
        amountPaid: acc.amountPaid + (group.amountPaid || 0),
        progress: 0,
      }),
      { contractTotal: 0, amountPaid: 0, progress: 0 }
    );
  }, [wbsGroups]);

  const overallProgress = totals.contractTotal
    ? Math.round((totals.amountPaid / totals.contractTotal) * 100)
    : 0;

  const handleStatusChange = async (newStatus: ContractStatusValue) => {
    if (!contract?.id) return;

    if (newStatus === 'Cancelled') {
      const { error } = await supabase.from('contracts').delete().eq('id', contract.id);
      if (!error) {
        navigate('/pages/StandardPages/Dashboard');
        return;
      }
    }

    const { error } = await supabase
      .from('contracts')
      .update({ status: newStatus })
      .eq('id', contract.id);

    if (!error) refresh();
  };

  if (loading) {
    return (
      <Page>
        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
      </Page>
    );
  }

  if (error || !contract) {
    return (
      <Page>
        <div className="p-4 text-center text-red-600">
          <h2 className="text-lg font-semibold">Contract Not Found</h2>
          <p>{error ?? 'Could not load contract.'}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageContainer>
        <CardSection>
          <ContractHeader contract={contract} onStatusChange={handleStatusChange} />
          <ContractToolbar contractId={contract.id} />

          <div className="space-y-4">
            {wbsGroups.length > 0 ? (
              wbsGroups.map((group: WBSGroup) => (
                <WbsSection
                  key={group.wbs_number}
                  group={group}
                  isExpanded={expandedWBS.includes(group.wbs_number)}
                  onToggle={toggleWBS}
                  onMapClick={handleMapLevelClick}
                  onWbsClick={handleWbsClick}
                  onLineItemClick={handleLineItemClick}
                  expandedMaps={expandedMaps}
                  onToggleMap={toggleMap}
                />
              ))
            ) : (
              <div className="text-center text-gray-400 py-12">No WBS Sections Available</div>
            )}
          </div>

          <ContractTotalsPanel
            totalContractValue={totals.contractTotal}
            amountPaid={totals.amountPaid}
            progressPercent={overallProgress}
          />

          <MapModal
            open={openMapModal}
            onClose={() => setOpenMapModal(false)}
            existingWKT={existingWKT}
            table={tableTarget}
            targetId={mapTargetId || ''}
            onSaveSuccess={refresh}
          />
        </CardSection>
      </PageContainer>
    </Page>
  );
}