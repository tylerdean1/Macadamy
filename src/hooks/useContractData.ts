import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '@/lib/store';
import { logError } from '@/utils/errorLogger';

/* child hooks */
import {
  type ContractWithGeo,
  useContractOperations,
} from './useContractOperations';
import { type WBSWithGeo, useWbsOperations } from './useWbsOperations';
import { type MapWithGeo, useMapOperations } from './useMapOperations';
import {
  type LineItemWithGeo,
  useLineItemOperations,
} from './useLineItemOperations';
import { useCrewOperations } from './useCrewOperations';

/* types */
import type {
  ChangeOrders,
  ContractOrganizations,
  ContractsInsert,
  ContractsUpdate,
  Crews,
  DailyLogs,
  EquipmentAssignments,
  Inspections,
  Issues,
  LineItemsInsert,
  LineItemsUpdate,
  MapsInsert,
  MapsUpdate,
  ProcessedMap,
  WBSGroup,
  WBSInsert,
  WBSUpdate,
  GeometryData,
} from '@/lib/types';

/* ──────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────── */
export function useContractData(contractId?: string) {
  const { profile } = useAuthStore();

  /* specialised hooks */
  const contractOps = useContractOperations();
  const wbsOps      = useWbsOperations();
  const mapOps      = useMapOperations();
  const lineItemOps = useLineItemOperations();
  const crewOps     = useCrewOperations();

  /* state */
  const [contract,          setContract]          = useState<ContractWithGeo | null>(null);
  const [wbsGroups,         setWbsGroups]         = useState<WBSWithGeo[]>([]);
  const [maps,              setMaps]              = useState<MapWithGeo[]>([]);
  const [lineItems,         setLineItems]         = useState<LineItemWithGeo[]>([]);
  const [contractOrgs,      setContractOrgs]      = useState<ContractOrganizations[]>([]);
  const [issues,            setIssues]            = useState<Issues[]>([]);
  const [inspections,       setInspections]       = useState<Inspections[]>([]);
  const [changeOrders,      setChangeOrders]      = useState<ChangeOrders[]>([]);
  const [dailyLogs,         setDailyLogs]         = useState<DailyLogs[]>([]);
  const [equipmentAssigned, setEquipmentAssigned] = useState<EquipmentAssignments[]>([]);
  const [crews,             setCrews]             = useState<Crews[]>([]);
  const [loading,           setLoading]           = useState<boolean>(true);
  const [error,             setError]             = useState<string | null>(null);

  /* ══════════ FETCH ALL ══════════ */
  const fetchData = useCallback(async () => {
    if (!contractId) {
      setError('No contract ID provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      /* 1) CONTRACT */
      setContract(await contractOps.fetchContract(contractId));

      /* 2) WBS */
      const wbsData = await wbsOps.fetchWbsSections(contractId);
      setWbsGroups(wbsData);

      /* 3) MAPS */
      const wbsIds  = wbsData.map(w => w.id);
      const mapsData= await mapOps.fetchMaps({ wbsIds, contractId });
      setMaps(mapsData);

      /* 4) LINE ITEMS */
      const mapIds  = mapsData.map(m => m.id);
      const liData  = await lineItemOps.fetchLineItems({ mapIds, wbsIds, contractId });
      setLineItems(liData);

      /* 5-10) RELATED tables (via contractOps) */
      setContractOrgs      (await contractOps.fetchContractOrganizations(contractId));
      setIssues            (await contractOps.fetchContractIssues(contractId));
      setInspections       (await contractOps.fetchContractInspections(contractId));
      setChangeOrders      (await contractOps.fetchChangeOrders(contractId));
      setDailyLogs         (await contractOps.fetchDailyLogs(contractId));
      setEquipmentAssigned (await contractOps.fetchEquipmentAssignments(contractId));

      /* 11) CREWS */
      if (profile?.organization_id) {
        setCrews(await crewOps.fetchCrewsByOrganization(profile.organization_id));
      }
    } catch (err) {
      logError('useContractData', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [
    contractId,
    profile?.organization_id,
    contractOps,
    wbsOps,
    mapOps,
    lineItemOps,
    crewOps,
  ]);

  /* initial load */
  useEffect(() => { fetchData(); }, [fetchData]);

  /* ══════════ DERIVED STRUCTURE ══════════ */
  const processedWbsGroups = useMemo((): WBSGroup[] => {
    /* ---------- build nested structure ---------- */
    const wbsMap = new Map<
      string,
      {
        id: string;
        wbs_number: string;
        scope: string | null;
        location: string | null;
        coordinates: GeometryData | null;
        maps: Map<string, ProcessedMap>;
        contractTotal: number;
        amountPaid: number;
      }
    >();

    /* ①  groups */
    wbsGroups.forEach(wbs => {
      wbsMap.set(wbs.id, {
        id:            wbs.id,
        wbs_number:    wbs.wbs_number,
        scope:         wbs.scope,
        location:      wbs.location,
        coordinates:   wbs.coordinates as GeometryData | null,
        maps:          new Map(),
        contractTotal: 0,
        amountPaid:    0,
      });
    });

    /* ②  maps */
    maps.forEach(m => {
      const grp = wbsMap.get(m.wbs_id);
      if (!grp) return;
      grp.maps.set(m.id, {
        id:                   m.id,
        map_number:           m.map_number,
        location_description: m.location_description,
        coordinates:          m.coordinates as GeometryData | null,
        scope:                m.scope,
        budget:               m.budget,
        line_items:           [],
        contractTotal:        0,
        amountPaid:           0,
        progress:             0,
      });
    });

    /* ③  line-items */
    lineItems.forEach(it => {
      if (!it.map_id) return;
      const grp = wbsMap.get(it.wbs_id ?? '');
      const map = grp?.maps.get(it.map_id);
      if (!grp || !map) return;

      const total = it.quantity * it.unit_price;
      map.line_items.push({
        ...it,
        coordinates: it.coordinates as GeometryData | null,
        total_cost:  total,
        amount_paid: 0,
      });
      map.contractTotal += total;
      grp.contractTotal += total;
    });

    /* ④  orphaned items to “_unassigned” */
    lineItems
      .filter(it => !it.map_id && it.wbs_id)
      .forEach(it => {
        const grp = wbsMap.get(it.wbs_id!);
        if (!grp) return;
        if (!grp.maps.has('_unassigned')) {
          grp.maps.set('_unassigned', {
            id: '_unassigned',
            map_number: 'Unassigned',
            location_description: 'Items not assigned to a specific map',
            coordinates: null,
            scope: 'Unassigned items',
            budget: null,
            line_items: [],
            contractTotal: 0,
            amountPaid: 0,
            progress: 0,
          });
        }
        const umap = grp.maps.get('_unassigned')!;
        const total = it.quantity * it.unit_price;
        umap.line_items.push({
          ...it,
          coordinates: it.coordinates as GeometryData | null,
          map_id: null,
          total_cost: total,
          amount_paid: 0,
        });
        umap.contractTotal += total;
        grp.contractTotal  += total;
      });

    /* ⑤  progress calc & flatten */
    return Array.from(wbsMap.values())
      .map(grp => {
        const mapsArr = Array.from(grp.maps.values()).map(m => {
          m.progress = m.contractTotal
            ? Math.round((m.amountPaid / m.contractTotal) * 100)
            : 0;
          return m;
        });
        mapsArr.sort((a, b) =>
          a.map_number.localeCompare(b.map_number, undefined, { numeric: true }),
        );

        return {
          id:            grp.id,
          wbs_number:    grp.wbs_number,
          wbs:           grp.wbs_number,
          description:   grp.scope ?? 'No description',
          location:      grp.location,
          coordinates:   grp.coordinates,
          maps:          mapsArr,
          contractTotal: grp.contractTotal,
          amountPaid:    grp.amountPaid,
          progress:      grp.contractTotal
            ? Math.round((grp.amountPaid / grp.contractTotal) * 100)
            : 0,
          budget:        wbsGroups.find(w => w.id === grp.id)?.budget ?? 0,
          scope:         grp.scope ?? '',
        };
      })
      .sort((a, b) => a.wbs.localeCompare(b.wbs, undefined, { numeric: true }));
  }, [wbsGroups, maps, lineItems]);

  /* ══════════ CRUD wrappers (refresh afterwards) ══════════ */
  const createContract = useCallback(
    async (d: ContractsInsert) => {
      const id = await contractOps.createContract(
        d as ContractsInsert & { coordinates?: GeometryData },
      );
      await fetchData();
      return id;
    },
    [contractOps, fetchData],
  );

  const updateContract = useCallback(
    async (u: ContractsUpdate) => {
      if (!contractId) throw new Error('No contract ID provided');
      await contractOps.updateContract(
        contractId,
        u as ContractsUpdate & { coordinates?: GeometryData },
      );
      await fetchData();
    },
    [contractId, contractOps, fetchData],
  );

  const createWBS = useCallback(
    async (d: WBSInsert) => {
      const id = await wbsOps.createWBS(
        d as WBSInsert & { coordinates?: GeometryData },
      );
      await fetchData();
      return id;
    },
    [wbsOps, fetchData],
  );

  const updateWBS = useCallback(
    async (id: string, u: WBSUpdate) => {
      await wbsOps.updateWBS(
        id,
        u as WBSUpdate & { coordinates?: GeometryData },
      );
      await fetchData();
    },
    [wbsOps, fetchData],
  );

  const deleteWBS = useCallback(
    async (id: string) => {
      await wbsOps.deleteWBS(id);
      await fetchData();
    },
    [wbsOps, fetchData],
  );

  const createMap = useCallback(
    async (d: MapsInsert) => {
      const id = await mapOps.createMap(
        d as MapsInsert & { coordinates?: GeometryData },
      );
      await fetchData();
      return id;
    },
    [mapOps, fetchData],
  );

  const updateMap = useCallback(
    async (id: string, u: MapsUpdate) => {
      await mapOps.updateMap(
        id,
        u as MapsUpdate & { coordinates?: GeometryData },
      );
      await fetchData();
    },
    [mapOps, fetchData],
  );

  const deleteMap = useCallback(
    async (id: string) => {
      await mapOps.deleteMap(id);
      await fetchData();
    },
    [mapOps, fetchData],
  );

  const createLineItem = useCallback(
    async (d: LineItemsInsert) => {
      const id = await lineItemOps.createLineItem(
        d as LineItemsInsert & { coordinates?: GeometryData },
      );
      await fetchData();
      return id;
    },
    [lineItemOps, fetchData],
  );

  const updateLineItem = useCallback(
    async (id: string, u: LineItemsUpdate) => {
      await lineItemOps.updateLineItem(
        id,
        u as LineItemsUpdate & { coordinates?: GeometryData },
      );
      await fetchData();
    },
    [lineItemOps, fetchData],
  );

  const deleteLineItem = useCallback(
    async (id: string) => {
      await lineItemOps.deleteLineItem(id);
      await fetchData();
    },
    [lineItemOps, fetchData],
  );

  /* ══════════ API ══════════ */
  return {
    contract,
    wbsGroups: processedWbsGroups,
    maps,
    lineItems,
    contractOrgs,
    issues,
    inspections,
    changeOrders,
    dailyLogs,
    equipmentAssigned,
    crews,
    loading,
    error,
    refresh:           fetchData,
    /* contract */
    createContract,
    updateContract,
    /* wbs */
    createWBS,
    updateWBS,
    deleteWBS,
    /* maps */
    createMap,
    updateMap,
    deleteMap,
    /* line items */
    createLineItem,
    updateLineItem,
    deleteLineItem,
  };
}