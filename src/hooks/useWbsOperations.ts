import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { logError } from '@/utils/errorLogger';
import { parseWKT } from '@/lib/utils/parseWKT';
import { geometryToWKT } from '@/lib/utils/wktUtils';

import type { GeometryData, WBS, WBSInsert, WBSUpdate } from '@/lib/types';

/* ──────────────────────────────────────────────────────────
   Row shape with parsed geometry
────────────────────────────────────────────────────────── */
export interface WBSWithGeo extends WBS {
  coordinates: GeometryData | null;
}

/* ──────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────── */
export function useWbsOperations() {
  const { profile } = useAuthStore();
  const sessionId =
    profile?.is_demo_user && profile.session_id ? profile.session_id : undefined;

  /* ══════════ FETCH ══════════ */
  const fetchWbsSections = useCallback(
    async (contractId: string): Promise<WBSWithGeo[]> => {
      try {
        let q = supabase
          .from('wbs')
          .select('*, coordinates')
          .eq('contract_id', contractId);
        if (sessionId) q = q.eq('session_id', sessionId);

        const { data, error } = await q;
        if (error) throw error;

        /*  Destructure to discard the original string/null coordinates
            then add the parsed GeometryData value so the final object
            type matches `WBSWithGeo`.                                   */
        return (
          data?.map((row) => {
            const { coordinates: raw, ...rest } = row;
            return {
              ...rest,
              coordinates: raw ? parseWKT(raw as string) : null,
            };
          }) ?? []
        );
      } catch (err) {
        logError('fetchWbsSections', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ CREATE ══════════ */
  const createWBS = useCallback(
    async (
      data: WBSInsert & { coordinates?: GeometryData },
    ): Promise<string | null> => {
      try {
        const { coordinates, ...wbsData } = data;
        const insertPayload = sessionId
          ? { ...wbsData, session_id: sessionId }
          : wbsData;

        const { data: inserted, error } = await supabase
          .from('wbs')
          .insert(insertPayload)
          .select('id')
          .single();
        if (error) throw error;
        if (!inserted) return null;

        /* optional geometry update */
        if (coordinates) {
          const wkt = geometryToWKT(coordinates);
          if (wkt) {
            let q = supabase.from('wbs').update({ coordinates: wkt }).eq('id', inserted.id);
            if (sessionId) q = q.eq('session_id', sessionId);
            const { error: geoErr } = await q;
            if (geoErr) throw geoErr;
          }
        }
        return inserted.id;
      } catch (err) {
        logError('createWBS', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ UPDATE ══════════ */
  const updateWBS = useCallback(
    async (
      id: string,
      updates: WBSUpdate & { coordinates?: GeometryData | null },
    ): Promise<void> => {
      try {
        const { coordinates, ...wbsUpdates } = updates;

        let q = supabase.from('wbs').update(wbsUpdates).eq('id', id);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;

        if (coordinates !== undefined) {
          const wkt = coordinates ? geometryToWKT(coordinates) : null;
          let q2 = supabase.from('wbs').update({ coordinates: wkt }).eq('id', id);
          if (sessionId) q2 = q2.eq('session_id', sessionId);
          const { error: geoErr } = await q2;
          if (geoErr) throw geoErr;
        }
      } catch (err) {
        logError('updateWBS', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ DELETE ══════════ */
  const deleteWBS = useCallback(
    async (id: string): Promise<void> => {
      try {
        let q = supabase.from('wbs').delete().eq('id', id);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;
      } catch (err) {
        logError('deleteWBS', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ API ══════════ */
  return {
    fetchWbsSections,
    createWBS,
    updateWBS,
    deleteWBS,
  };
}