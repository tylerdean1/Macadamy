import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Page } from '@/pages/StandardPages/StandardPageComponents/Page';
import { PageContainer } from '@/pages/StandardPages/StandardPageComponents/PageContainer';
import { CardSection } from '@/pages/StandardPages/StandardPageComponents/CardSection';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ContractTotalsPanel } from '@/pages/Contract/ContractDasboardComponents/ContractTotalsPanel';
import { EditableContractSection } from '@/pages/Contract/EditableContractComponents/EditableContractSection';
import { EditableWbsItem } from '@/pages/Contract/EditableContractComponents/EditableWbsItem';
import { EditableMapItem } from '@/pages/Contract/EditableContractComponents/EditableMapItem';
import { EditableLineItem } from '@/pages/Contract/EditableContractComponents/EditableLineItem';
import { MapModal } from '@/pages/Contract/SharedComponents/GoogleMaps/MapModal';

import { useContractData } from '@/hooks/contractHooks';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { geometryToWKT } from '@/lib/utils/wktUtils';

import type { GeometryData } from '@/lib/types';
import type { UnitMeasureTypeValue } from '@/lib/enums';

export default function ContractSettings() {
  const { id: contractId } = useParams<{ id: string }>();
  const {
    contract,
    wbsGroups,
    maps,
    lineItems,
    loading,
    error,
    refresh,
    updateContract,
    createWBS,
    updateWBS,
    deleteWBS,
    createMap,
    updateMap,
    deleteMap,
    createLineItem,
    updateLineItem,
    deleteLineItem,
  } = useContractData(contractId);

  const unitOpts = useEnumOptions('unit_measure_type') as UnitMeasureTypeValue[];

  const [dirtyFlag, setDirtyFlag] = useState(false);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [mapTargetId, setMapTargetId] = useState<string>('');
  const [tableTarget, setTableTarget] = useState<'contract' | 'wbs' | 'map' | 'line'>('contract');
  const [existingWKT, setExistingWKT] = useState<string>('');

  const openMapModalFn = (id: string, level: 'contract' | 'wbs' | 'map' | 'line') => {
    let coordinates: GeometryData | null = null;
    if (level === 'contract' && contract) coordinates = contract.coordinates;
    if (level === 'wbs') coordinates = wbsGroups.find(w => w.id === id)?.coordinates || null;
    if (level === 'map') coordinates = maps.find(m => m.id === id)?.coordinates || null;
    if (level === 'line') coordinates = lineItems.find(l => l.id === id)?.coordinates || null;
    setExistingWKT(geometryToWKT(coordinates) ?? '');
    setMapTargetId(id);
    setTableTarget(level);
    setOpenMapModal(true);
  };

  const totals = useMemo(() => {
    return wbsGroups.reduce(
      (acc, w) => ({
        contractTotal: acc.contractTotal + (w.contractTotal || 0),
        amountPaid: acc.amountPaid + (w.amountPaid || 0),
        progress: 0,
      }),
      { contractTotal: 0, amountPaid: 0, progress: 0 }
    );
  }, [wbsGroups]);

  const addWbs = async () => {
    if (!contract) return;
    const newWbs = {
      contract_id: contract.id,
      wbs_number: `WBS-${wbsGroups.length + 1}`,
      description: 'New WBS Section',
      coordinates: null,
      budget: 0,
      scope: 'New scope of work',
    };
    const wbsId = await createWBS(newWbs);
    if (wbsId) {
      refresh();
    }
  };

  const addMap = async (wbsId: string) => {
    if (!contract) return;
    const newMap = {
      contract_id: contract.id,
      wbs_id: wbsId,
      map_number: `Map-${maps.filter(m => m.wbs_id === wbsId).length + 1}`,
      location_description: 'New Map Location',
      coordinates: null,
      budget: 0,
      scope: '',
    };
    const mapId = await createMap(newMap);
    if (mapId) {
      refresh();
    }
  };
  const addLineItem = async (mapId: string) => {
    if (!contract) return;
    const parentMap = maps.find(m => m.id === mapId);
    if (!parentMap) return;

    const newLine = {
      contract_id: contract.id,
      wbs_id: parentMap.wbs_id,
      map_id: mapId,
      line_code: `L-${lineItems.filter(l => l.map_id === mapId).length + 1}`,
      description: 'New Line Item',
      unit_measure: unitOpts[0],
      quantity: 0,
      unit_price: 0,
      coordinates: null,
      template_id: null,
      reference_doc: null,
      total_cost: 0,
      amount_paid: 0,
    };
    await createLineItem(newLine);
    refresh();
  };

  const overallProgress = totals.contractTotal
    ? Math.round((totals.amountPaid / totals.contractTotal) * 100)
    : 0;

  const saveAll = async () => {
    toast.promise(refresh(), {
      loading: 'Saving...',
      success: 'Changes saved!',
      error: 'Save failed',
    });
    setDirtyFlag(false);
  };

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyFlag) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyFlag]);

  if (loading) {
    return (
      <Page>
        <div className="p-4 text-center text-sm text-gray-500">Loading contract settings...</div>
      </Page>
    );
  }

  if (error || !contract) {
    return (
      <Page>
        <div className="p-4 text-center text-red-600">
          <h2 className="text-lg font-semibold">Contract Not Found</h2>
          <p>{error ?? 'Could not load contract details.'}</p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageContainer>
        <CardSection>
          <EditableContractSection
            contract={contract}
            onChange={(updated) => {
              updateContract(updated);
              setDirtyFlag(true);
            }}
            onSave={saveAll}
            onOpenMapModal={() => openMapModalFn(contract.id, 'contract')}
          />

          {wbsGroups.map(wbs => (
            <div key={wbs.id} className="mb-4">
              <EditableWbsItem
                wbsId={wbs.id}
                wbsNumber={wbs.wbs_number ?? ''}
                description={wbs.description ?? ''}
                onUpdate={(id, updates) => {
                  updateWBS(id, updates);
                  setDirtyFlag(true);
                }}
                onDelete={() => deleteWBS(wbs.id)}
                onViewMap={() => openMapModalFn(wbs.id, 'wbs')}
              />

              {(maps.filter(m => m.wbs_id === wbs.id)).map(map => (
                <div key={map.id} className="ml-6">
                  <EditableMapItem
                    mapId={map.id}
                    mapNumber={map.map_number ?? ''}
                    locationDescription={map.location_description ?? ''}
                    onUpdate={(id, updates) => {
                      updateMap(id, updates);
                      setDirtyFlag(true);
                    }}
                    onDelete={() => deleteMap(map.id)}
                    onViewMap={() => openMapModalFn(map.id, 'map')}
                  />

                  {(lineItems.filter(li => li.map_id === map.id)).map(li => (
                    <EditableLineItem
                      key={li.id}
                      lineId={li.id}
                      lineCode={li.line_code ?? ''}
                      description={li.description ?? ''}
                      quantity={li.quantity ?? 0}
                      unitPrice={li.unit_price ?? 0}
                      unitMeasure={li.unit_measure}
                      onUpdate={(id, updates) => {
                        updateLineItem(id, updates);
                        setDirtyFlag(true);
                      }}
                      onDelete={() => deleteLineItem(li.id)}
                    />
                  ))}

                  <div className="ml-8 mt-2">
                    <Button onClick={() => addLineItem(map.id)} size="sm">
                      + Add Line Item
                    </Button>
                  </div>
                </div>
              ))}

              <div className="ml-6 mt-2">
                <Button onClick={() => addMap(wbs.id)} size="sm">
                  + Add Map
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <Button onClick={addWbs} size="sm">
              + Add WBS
            </Button>
          </div>

          <ContractTotalsPanel
            totalContractValue={totals.contractTotal}
            amountPaid={totals.amountPaid}
            progressPercent={overallProgress}
          />

          <div className="flex justify-end mt-6">
            <Button
              variant={dirtyFlag ? 'primary' : 'ghost'}
              disabled={!dirtyFlag}
              onClick={saveAll}
            >
              Save All Changes
            </Button>
          </div>
        </CardSection>
      </PageContainer>

      <MapModal
        open={openMapModal}
        onClose={() => setOpenMapModal(false)}
        table={
          tableTarget === 'contract'
            ? 'contracts'
            : tableTarget === 'wbs'
            ? 'wbs'
            : tableTarget === 'map'
            ? 'maps'
            : 'line_items'
        }
        targetId={mapTargetId}
        existingWKT={existingWKT}
        onSaveSuccess={() => {
          setOpenMapModal(false);
          refresh();
        }}
      />
    </Page>
  );
}
