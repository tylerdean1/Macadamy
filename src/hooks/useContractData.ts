import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { logError } from '@/utils/errorLogger';
import { parseWKT } from '@/lib/utils/parseWKT';
import type { GeometryData } from '@/lib/types';
import type { Database } from '@/lib/database.types';

type ContractRow = Database['public']['Tables']['contracts']['Row'];
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
  const [contract, setContract] = useState<(ContractRow & { coordinates: GeometryData | null }) | null>(null);
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
      // 1) Fetch contract directly (GeoJSON in `coordinates`)
      const { data: raw, error: cErr } = await supabase
        .from('contracts')
        .select(`
          id,
          title,
          description,
          status,
          budget,
          start_date,
          end_date,
          location,
          created_at,
          created_by,
          updated_at,
          coordinates
        `)
        .eq('id', contractId)
        .single();
      if (cErr) throw new Error(cErr.message);
      if (!raw) throw new Error('Contract not found');

      // Detect GeoJSON vs WKT string
      const coordsField = raw.coordinates;
      const parsedContractCoords: GeometryData | null =
        typeof coordsField === 'string'
          ? parseWKT(coordsField)
          : (coordsField as GeometryData | null);

      setContract({
        ...raw,
        coordinates: parsedContractCoords,
      });

      // 2) Fetch WBS via RPC
      const { data: wbsData, error: wbsErr } = await supabase
        .rpc('get_wbs_with_wkt', { _contract_id: contractId });
      if (wbsErr) throw new Error(wbsErr.message);

      // 3) Fetch maps via RPC
      const { data: mapData, error: mapErr } = await supabase
        .rpc('get_maps_with_wkt', { _contract_id: contractId });
      if (mapErr) throw new Error(mapErr.message);

      // 4) Fetch line-items via RPC
      const { data: lineItemsData, error: liErr } = await supabase
        .rpc('get_line_items_with_wkt', { _contract_id: contractId });
      if (liErr) throw new Error(liErr.message);

      // 5) Group line-items by map
      const itemsByMap: Record<string, LineItem[]> = {};
      for (const item of lineItemsData || []) {
        const parsed: LineItem = {
          ...item,
          unit_measure: item.unit_measure as UnitMeasure,
          total_cost: item.quantity * item.unit_price,
          amount_paid: item.quantity * item.unit_price,
          coordinates: item.coordinates_wkt
            ? parseWKT(item.coordinates_wkt)
            : null,
        };
        const key = item.map_id ?? '';
        if (!itemsByMap[key]) itemsByMap[key] = [];
        itemsByMap[key].push(parsed);
      }

      // 6) Build processed maps under each WBS
      const mapsByWbs: Record<string, ProcessedMap[]> = {};
      for (const m of mapData || []) {
        const list = itemsByMap[m.id] || [];
        const total = list.reduce((sum, li) => sum + li.total_cost, 0);
        const paid = list.reduce((sum, li) => sum + li.amount_paid, 0);

        const processed: ProcessedMap = {
          id: m.id,
          map_number: m.map_number,
          location_description: m.location_description,
          scope: m.scope,
          coordinates: m.coordinates_wkt
            ? parseWKT(m.coordinates_wkt)
            : null,
          line_items: list,
          contractTotal: total,
          amountPaid: paid,
          progress: total > 0 ? Math.round((paid / total) * 100) : 0,
        };

        mapsByWbs[m.wbs_id] = mapsByWbs[m.wbs_id] || [];
        mapsByWbs[m.wbs_id].push(processed);
      }

      // 7) Assemble WBS groups
      const groups: WBSGroup[] = (wbsData || []).map(w => {
        const maps = mapsByWbs[w.id] || [];
        const wbsTotal = maps.reduce((sum, mp) => sum + mp.contractTotal, 0);
        const wbsPaid = maps.reduce((sum, mp) => sum + mp.amountPaid, 0);
        return {
          id: w.id,
          wbs: w.wbs_number,
          scope: w.scope ?? null,
          location: w.location ?? null,
          coordinates: w.coordinates_wkt
            ? parseWKT(w.coordinates_wkt)
            : null,
          budget: w.budget ?? null,
          maps,
          contractTotal: wbsTotal,
          amountPaid: wbsPaid,
          progress: wbsTotal > 0 ? Math.round((wbsPaid / wbsTotal) * 100) : 0,
        };
      });

      setWbsGroups(groups);
    } catch (err) {
      logError('useContractData', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { contract, wbsGroups, loading, error, refresh: fetchData };
}