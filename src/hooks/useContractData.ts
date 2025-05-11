import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/utils/errorLogger';
import { parseWKT } from '@/lib/utils/parseWKT';
import type { GeometryData } from '@/lib/types';
import type { Database } from '@/lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];
type UnitMeasure = Database['public']['Enums']['unit_measure_type'];

export interface LineItem {
  id: string;
  line_code: string;
  description: string;
  unit_measure: UnitMeasure;
  quantity: number;
  unit_price: number;
  total_cost: number;
  amount_paid: number;
  reference_doc: string | null;
  map_id: string | null;
  wbs_id: string;
  contract_id: string | null;
  coordinates: GeometryData | null;
}

export interface ProcessedMap {
  id: string;
  map_number: string;
  location_description: string | null;
  scope: string | null;
  coordinates: GeometryData | null;
  line_items: LineItem[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

export interface WBSGroup {
  id: string;
  wbs: string;
  scope: string | null;
  location: string | null;
  coordinates: GeometryData | null;
  budget: number | null;
  maps: ProcessedMap[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

export function useContractData(contractId?: string) {
  const [contract, setContract] = useState<(Contract & { coordinates: GeometryData | null }) | null>(null);
  const [wbsGroups, setWbsGroups] = useState<WBSGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!contractId) {
      setError('No Contract ID provided.');
      setLoading(false);
      return;
    }

    try {
      const { data: contractData, error: contractError } = await supabase
        .rpc('get_contract_with_wkt', { contract_id: contractId });

      if (contractError) throw new Error(contractError.message);
      const contractRow = contractData?.[0];
      if (!contractRow) throw new Error('Contract not found');

      setContract({
        ...contractRow,
        coordinates: parseWKT(contractRow.coordinates_wkt ?? null),
      });

      const { data: wbsData, error: wbsError } = await supabase
        .rpc('get_wbs_with_wkt', { _contract_id: contractId });

      if (wbsError) throw new Error(wbsError.message);

      const { data: mapData, error: mapError } = await supabase
        .rpc('get_maps_with_wkt', { _contract_id: contractId });

      if (mapError) throw new Error(mapError.message);

      const { data: lineItemsData, error: lineItemError } = await supabase
        .rpc('get_line_items_with_wkt', { _contract_id: contractId });

      if (lineItemError) throw new Error(lineItemError.message);

      const lineItemsByMap: Record<string, LineItem[]> = {};
      for (const item of lineItemsData || []) {
        const parsedItem: LineItem = {
          ...item,
          unit_measure: item.unit_measure as UnitMeasure,
          total_cost: item.quantity * item.unit_price,
          amount_paid: item.quantity * item.unit_price,
          coordinates: parseWKT(item.coordinates_wkt ?? null),
        };
        if (!lineItemsByMap[item.map_id]) lineItemsByMap[item.map_id] = [];
        lineItemsByMap[item.map_id].push(parsedItem);
      }

      const mapsByWbs: Record<string, ProcessedMap[]> = {};
      for (const map of mapData || []) {
        const mapLineItems = lineItemsByMap[map.id] || [];
        const mapTotal = mapLineItems.reduce((sum, li) => sum + li.total_cost, 0);
        const mapPaid = mapLineItems.reduce((sum, li) => sum + li.amount_paid, 0);

        const processedMap: ProcessedMap = {
          id: map.id,
          map_number: map.map_number,
          location_description: map.location_description,
          scope: map.scope,
          coordinates: parseWKT(map.coordinates_wkt ?? null),
          line_items: mapLineItems,
          contractTotal: mapTotal,
          amountPaid: mapPaid,
          progress: mapTotal > 0 ? Math.round((mapPaid / mapTotal) * 100) : 0,
        };

        if (!mapsByWbs[map.wbs_id]) mapsByWbs[map.wbs_id] = [];
        mapsByWbs[map.wbs_id].push(processedMap);
      }

      const processedGroups: WBSGroup[] = (wbsData || []).map((wbs) => {
        const maps = mapsByWbs[wbs.id] || [];
        const wbsTotal = maps.reduce((sum, m) => sum + m.contractTotal, 0);
        const wbsPaid = maps.reduce((sum, m) => sum + m.amountPaid, 0);

        return {
          id: wbs.id,
          wbs: wbs.wbs_number,
          scope: wbs.scope ?? null,
          location: wbs.location ?? null,
          coordinates: parseWKT(wbs.coordinates_wkt ?? null),
          budget: wbs.budget ?? null,
          maps,
          contractTotal: wbsTotal,
          amountPaid: wbsPaid,
          progress: wbsTotal > 0 ? Math.round((wbsPaid / wbsTotal) * 100) : 0,
        };
      });

      setWbsGroups(processedGroups);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logError('useContractData', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    contract,
    wbsGroups,
    loading,
    error,
    refresh: fetchData,
  };
}
