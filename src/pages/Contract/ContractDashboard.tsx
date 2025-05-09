import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ContractHeader } from '@/components/contract/ContractDasboard/ContractHeader';
import { MapModal } from '@/components/contract/MapModal';
import { Page } from '@/components/ui/Page';
import { PageContainer } from '@/components/ui/PageContainer';
import { CardSection } from '@/components/ui/CardSection';
import { ContractToolbar } from '@/components/contract/ContractDasboard/ContractToolBar';
import { WbsSection } from '@/components/contract/WbsSection';
import { ContractTotalsPanel } from '@/components/contract/ContractDasboard/ContractTotalsPanel';
import { parseGeometryToPins } from '@/lib/utils/mapUtils';
import { useContractData } from '@/hooks/useContractData';
import type { GeometryData } from '@/lib/types';

interface MapLocation {
  id: string;
  map_number: string;
  location_description: string | null;
  coordinates?: GeometryData | null;
  line_items: { id: string; description: string; quantity: number; unitPrice: number }[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

interface WBSGroup {
  wbs: string;
  description: string;
  maps: MapLocation[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

export function ContractDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contract, wbsGroups, loading, error, refresh } = useContractData(id);

  const [openMapModal, setOpenMapModal] = useState(false);
  const [modalPins, setModalPins] = useState<{ lat: number; lng: number; label?: string }[]>([]);
  const [expandedWBS, setExpandedWBS] = useState<string[]>([]);
  const [expandedMaps, setExpandedMaps] = useState<string[]>([]);

  const handleMapLevelClick = (map: MapLocation) => {
    const parsed = map.coordinates ?? null;
    setModalPins(parseGeometryToPins(parsed, map.location_description || undefined));
    setOpenMapModal(true);
  };

  const handleWbsLevelClick = (group: WBSGroup) => {
    const pins = group.maps.flatMap((map) =>
      parseGeometryToPins(map.coordinates ?? null, map.location_description || undefined)
    );
    setModalPins(pins);
    setOpenMapModal(true);
  };

  const toggleWBS = (wbs: string) => {
    setExpandedWBS((prev) =>
      prev.includes(wbs) ? prev.filter((item) => item !== wbs) : [...prev, wbs]
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
        contractTotal: acc.contractTotal + group.contractTotal,
        amountPaid: acc.amountPaid + group.amountPaid,
        progress: 0,
      }),
      { contractTotal: 0, amountPaid: 0, progress: 0 }
    );
  }, [wbsGroups]);

  const overallProgress = totals.contractTotal
    ? Math.round((totals.amountPaid / totals.contractTotal) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="h-10 bg-background-lighter rounded-md animate-pulse w-1/2"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-background-lighter rounded-md animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-24 bg-background-lighter rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">{error || 'Contract not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <Page>
      <PageContainer>
        <CardSection>
          <ContractHeader
            contract={contract}
            onStatusChange={async (newStatus) => {
              const { error } = await supabase
                .from('contracts')
                .update({ status: newStatus })
                .eq('id', contract.id);
              if (!error) refresh();
            }}
          />

          <ContractToolbar contractId={contract.id} />

          <div className="space-y-4">
            {wbsGroups.length > 0 ? (
              wbsGroups.map((group) => (
                <WbsSection
                  key={group.wbs}
                  group={group}
                  isExpanded={expandedWBS.includes(group.wbs)}
                  onToggle={toggleWBS}
                  onMapClick={(map) =>
                    handleMapLevelClick({
                      ...map,
                      line_items: map.line_items.map((item) => ({
                        id: item.id,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unit_price,
                      })),
                    })
                  }
                  onViewWbsMap={() =>
                    handleWbsLevelClick({
                      ...group,
                      maps: group.maps.map((map) => ({
                        ...map,
                        line_items: map.line_items.map((item) => ({
                          id: item.id,
                          description: item.description,
                          quantity: item.quantity,
                          unitPrice: item.unit_price,
                        })),
                      })),
                    })
                  }
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
            mapLocations={modalPins}
            onConfirm={() => {}}
            targetId={contract.id}
            level="contract"
          />
        </CardSection>
      </PageContainer>
    </Page>
  );
}
