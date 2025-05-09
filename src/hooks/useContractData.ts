import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/utils/errorLogger';
import type { GeometryData } from '@/lib/types';
import type { Database } from '@/lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];

export interface LineItem {
  id: string;
  line_code: string;
  description: string;
  unit_measure: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  amount_paid: number;
  reference_doc: string | null;
  map_id: string | null;
}

export interface ProcessedMap {
  id: string;
  map_number: string;
  location_description: string | null;
  coordinates: GeometryData | null;
  line_items: LineItem[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

export interface WBSGroup {
  wbs: string;
  description: string;
  maps: ProcessedMap[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

interface RawMap {
  id: string;
  wbs_id: string;
  map_number: string;
  location_description: string | null;
  geojson: string | null;
}

export function useContractData(contractId?: string) {
  const [contract, setContract] = useState<Contract | null>(null);
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
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (contractError) throw new Error(contractError.message);
      if (!contractData) throw new Error('Contract not found');

      setContract(contractData);

      const { data: wbsData, error: wbsError } = await supabase
        .from('wbs')
        .select('id, wbs_number, description')
        .eq('contract_id', contractId)
        .order('wbs_number');

      if (wbsError) throw new Error(wbsError.message);

      const { data: allMaps, error: mapError } = await supabase
        .rpc('get_maps_with_geojson', { contract_id: contractId });

      if (mapError) throw new Error(mapError.message);

      const mapsByWbs: Record<string, RawMap[]> = {};
      (allMaps || []).forEach((map) => {
        if (!mapsByWbs[map.wbs_id]) mapsByWbs[map.wbs_id] = [];
        mapsByWbs[map.wbs_id].push(map);
      });

      const processedGroups: WBSGroup[] = await Promise.all(
        (wbsData || []).map(async (wbs) => {
          const mapLocations = mapsByWbs[wbs.id] || [];

          const processedMaps = await Promise.all(
            mapLocations.map(async (map) => {
              const { data: lineItems, error: lineError } = await supabase
                .from('line_items')
                .select(`
                  id,
                  line_code,
                  description,
                  unit_measure,
                  quantity,
                  unit_price,
                  reference_doc,
                  map_id,
                  line_item_entries (
                    computed_output
                  )
                `)
                .eq('map_id', map.id)
                .order('line_code');

              if (lineError) throw new Error(lineError.message);

              const processedLineItems = (lineItems || []).map((item) => {
                const computed = (item.line_item_entries || []).reduce(
                  (sum, entry) => sum + (entry.computed_output ?? 0),
                  0
                );
                return {
                  ...item,
                  total_cost: item.quantity * item.unit_price,
                  amount_paid: computed * item.unit_price,
                };
              });

              const mapTotal = processedLineItems.reduce((sum, li) => sum + li.total_cost, 0);
              const mapPaid = processedLineItems.reduce((sum, li) => sum + li.amount_paid, 0);

              return {
                id: map.id,
                map_number: map.map_number,
                location_description: map.location_description,
                coordinates: map.geojson ? (JSON.parse(map.geojson) as GeometryData) : null,
                line_items: processedLineItems,
                contractTotal: mapTotal,
                amountPaid: mapPaid,
                progress: mapTotal > 0 ? Math.round((mapPaid / mapTotal) * 100) : 0,
              };
            })
          );

          const wbsTotal = processedMaps.reduce((sum, m) => sum + m.contractTotal, 0);
          const wbsPaid = processedMaps.reduce((sum, m) => sum + m.amountPaid, 0);

          return {
            wbs: wbs.wbs_number,
            description: wbs.description ?? '',
            maps: processedMaps,
            contractTotal: wbsTotal,
            amountPaid: wbsPaid,
            progress: wbsTotal > 0 ? Math.round((wbsPaid / wbsTotal) * 100) : 0,
          };
        })
      );

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
