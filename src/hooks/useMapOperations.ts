import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { logError } from '@/utils/errorLogger';
import { parseWKT } from '@/lib/utils/parseWKT';
import { geometryToWKT } from '@/lib/utils/wktUtils';

import type { GeometryData, Maps, MapsInsert, MapsUpdate } from '@/lib/types';

/* ──────────────────────────────────────────────────────────
   Map row with parsed geometry
────────────────────────────────────────────────────────── */
export interface MapWithGeo extends Maps {
  coordinates: GeometryData | null;
}

/* ──────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────── */
export function useMapOperations() {
  /* demo-session handling */
  const { profile } = useAuthStore();
  const sessionId =
    profile?.is_demo_user && profile.session_id ? profile.session_id : undefined;

  /* ══════════ FETCH ══════════ */
  const fetchMaps = useCallback(
    async (params: { wbsIds?: string[]; contractId?: string }): Promise<MapWithGeo[]> => {
      const { wbsIds, contractId } = params;

      try {
        let q = supabase.from('maps').select('*, coordinates');

        if (wbsIds?.length) q = q.in('wbs_id', wbsIds);
        else if (contractId) q = q.eq('contract_id', contractId);

        if (sessionId) q = q.eq('session_id', sessionId);

        const { data, error } = await q;
        if (error) throw error;

        /* safe-destructure so `coordinates` becomes GeometryData | null */
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
        logError('fetchMaps', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ CREATE ══════════ */
  const createMap = useCallback(
    async (
      data: MapsInsert & { coordinates?: GeometryData },
    ): Promise<string | null> => {
      try {
        const { coordinates, ...mapData } = data;
        const insertPayload = sessionId ? { ...mapData, session_id: sessionId } : mapData;

        const { data: inserted, error } = await supabase
          .from('maps')
          .insert(insertPayload)
          .select('id')
          .single();

        if (error) throw error;
        if (!inserted) return null;

        /* optional geometry update */
        if (coordinates) {
          const wkt = geometryToWKT(coordinates);
          if (wkt) {
            let q = supabase.from('maps').update({ coordinates: wkt }).eq('id', inserted.id);
            if (sessionId) q = q.eq('session_id', sessionId);
            const { error: geoErr } = await q;
            if (geoErr) throw geoErr;
          }
        }
        return inserted.id;
      } catch (err) {
        logError('createMap', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ UPDATE ══════════ */
  const updateMap = useCallback(
    async (
      id: string,
      updates: MapsUpdate & { coordinates?: GeometryData | null },
    ): Promise<void> => {
      try {
        const { coordinates, ...mapUpdates } = updates;

        /* main columns */
        let q = supabase.from('maps').update(mapUpdates).eq('id', id);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;

        /* geometry column */
        if (coordinates !== undefined) {
          const wkt = coordinates ? geometryToWKT(coordinates) : null;
          let q2 = supabase.from('maps').update({ coordinates: wkt }).eq('id', id);
          if (sessionId) q2 = q2.eq('session_id', sessionId);
          const { error: geoErr } = await q2;
          if (geoErr) throw geoErr;
        }
      } catch (err) {
        logError('updateMap', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ DELETE ══════════ */
  const deleteMap = useCallback(
    async (id: string): Promise<void> => {
      try {
        let q = supabase.from('maps').delete().eq('id', id);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;
      } catch (err) {
        logError('deleteMap', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ API ══════════ */
  return {
    fetchMaps,
    createMap,
    updateMap,
    deleteMap,
  };
}