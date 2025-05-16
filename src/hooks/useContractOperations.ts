import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { logError } from '@/utils/errorLogger';
import { parseWKT } from '@/lib/utils/parseWKT';
import { geometryToWKT } from '@/lib/utils/wktUtils';

import type { GeometryData } from '@/lib/types';
import type {
  Contracts,
  ContractsInsert,
  ContractsUpdate,
  ContractOrganizations,
  Issues,
  Inspections,
  ChangeOrders,
  DailyLogs,
  EquipmentAssignments,
} from '@/lib/types';

/* ──────────────────────────────────────────────────────────
   Local types
────────────────────────────────────────────────────────── */
export interface ContractWithGeo extends Contracts {
  coordinates: GeometryData | null;
}

/* tables that share the “contract_id” column */
type RelatedTable =
  | 'contract_organizations'
  | 'issues'
  | 'inspections'
  | 'change_orders'
  | 'daily_logs'
  | 'equipment_assignments';

/* ──────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────── */
export function useContractOperations() {
  const { profile } = useAuthStore();
  const sessionId =
    profile?.is_demo_user && profile.session_id ? profile.session_id : undefined;

  /* ══════════ READ ONE ══════════ */
  const fetchContract = useCallback(
    async (contractId: string): Promise<ContractWithGeo | null> => {
      try {
        let q = supabase.from('contracts').select('*').eq('id', contractId);
        if (sessionId) q = q.eq('session_id', sessionId);

        const { data, error } = await q.single();
        if (error) throw error;
        if (!data) return null;

        return {
          ...data,
          coordinates: data.coordinates ? parseWKT(data.coordinates) : null,
        };
      } catch (err) {
        logError('fetchContract', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ CREATE ══════════ */
  const createContract = useCallback(
    async (
      data: ContractsInsert & { coordinates?: GeometryData | null },
    ): Promise<string | null> => {
      try {
        const { coordinates, ...contractData } = data;
        const insertPayload = sessionId
          ? { ...contractData, session_id: sessionId }
          : contractData;

        const { data: inserted, error } = await supabase
          .from('contracts')
          .insert(insertPayload)
          .select('id')
          .single();
        if (error) throw error;
        if (!inserted) return null;

        if (coordinates !== undefined) {
          const wkt = coordinates ? geometryToWKT(coordinates) : null;
          const { error: coordErr } = await supabase
            .from('contracts')
            .update({ coordinates: wkt })
            .eq('id', inserted.id);
          if (coordErr) throw coordErr;
        }
        return inserted.id;
      } catch (err) {
        logError('createContract', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ UPDATE ══════════ */
  const updateContract = useCallback(
    async (
      contractId: string,
      updates: ContractsUpdate & { coordinates?: GeometryData | null },
    ): Promise<void> => {
      try {
        const { coordinates, ...contractUpdates } = updates;

        let q = supabase.from('contracts').update(contractUpdates).eq('id', contractId);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;

        if (coordinates !== undefined) {
          const wkt = coordinates ? geometryToWKT(coordinates) : null;
          let q2 = supabase
            .from('contracts')
            .update({ coordinates: wkt })
            .eq('id', contractId);
          if (sessionId) q2 = q2.eq('session_id', sessionId);
          const { error: coordErr } = await q2;
          if (coordErr) throw coordErr;
        }
      } catch (err) {
        logError('updateContract', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ DELETE ══════════ */
  const deleteContract = useCallback(
    async (contractId: string): Promise<void> => {
      try {
        let q = supabase.from('contracts').delete().eq('id', contractId);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;
      } catch (err) {
        logError('deleteContract', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ RELATED FETCH ══════════ */
  const fetchRelated = useCallback(
    async <T>(table: RelatedTable, contractId: string): Promise<T[]> => {
      let q = supabase.from(table).select('*').eq('contract_id', contractId);
      if (sessionId) q = q.eq('session_id', sessionId);

      const { data, error } = await q;
      if (error) {
        logError(`fetch ${table}`, error);
        return [];
      }
      return data as T[];
    },
    [sessionId],
  );

  const fetchContractOrganizations = (id: string) =>
    fetchRelated<ContractOrganizations>('contract_organizations', id);
  const fetchContractIssues = (id: string) =>
    fetchRelated<Issues>('issues', id);
  const fetchContractInspections = (id: string) =>
    fetchRelated<Inspections>('inspections', id);
  const fetchChangeOrders = (id: string) =>
    fetchRelated<ChangeOrders>('change_orders', id);
  const fetchDailyLogs = (id: string) =>
    fetchRelated<DailyLogs>('daily_logs', id);
  const fetchEquipmentAssignments = (id: string) =>
    fetchRelated<EquipmentAssignments>('equipment_assignments', id);

  /* ══════════ API ══════════ */
  return {
    fetchContract,
    createContract,
    updateContract,
    deleteContract,
    fetchContractOrganizations,
    fetchContractIssues,
    fetchContractInspections,
    fetchChangeOrders,
    fetchDailyLogs,
    fetchEquipmentAssignments,
  };
}