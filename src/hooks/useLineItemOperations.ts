import { useCallback } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { logError } from '@/utils/errorLogger';
import { parseWKT } from '@/lib/utils/parseWKT';
import { geometryToWKT } from '@/lib/utils/wktUtils';

import type {
  FormulaDef,
  GeometryData,
  LineItems,
  LineItemsInsert,
  LineItemsUpdate,
} from '@/lib/types';
import type { UnitMeasureTypeValue } from '@/lib/enums';
import type { CalculatorTemplate } from '@/lib/formula.types';

/* ──────────────────────────────────────────────────────────
   Interfaces
────────────────────────────────────────────────────────── */
export interface LineItemWithGeo extends LineItems {
  coordinates: GeometryData | null;
  formula?: FormulaDef | null;
}

export interface LineItem {
  id: string;
  line_code: string;
  description: string;
  unit_measure: string;
  quantity: number;
  unit_price: number;
  reference_doc: string | null;
  map_id: string | null;
  template_id: string | null;
  total_cost: number;
  amount_paid: number;
  coordinates?: GeometryData | null;
  formula?: FormulaDef | null;
}

/* ──────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────── */
export function useLineItemOperations() {
  /* demo-session handling */
  const { profile } = useAuthStore();
  const sessionId =
    profile?.is_demo_user && profile.session_id ? profile.session_id : undefined;

  /* ══════════ FETCH LINE ITEMS ══════════ */
  const fetchLineItems = useCallback(
    async (params: {
      mapIds?: string[];
      wbsIds?: string[];
      contractId?: string;
    }): Promise<LineItemWithGeo[]> => {
      const { mapIds, wbsIds, contractId } = params;

      try {
        let q = supabase.from('line_items').select('*, coordinates');

        if (mapIds?.length) q = q.in('map_id', mapIds);
        else if (wbsIds?.length) q = q.in('wbs_id', wbsIds);
        else if (contractId) q = q.eq('contract_id', contractId);

        if (sessionId) q = q.eq('session_id', sessionId);

        const { data: lineItemsData, error } = await q;
        if (error) throw error;

        const lineItems = lineItemsData ?? [];

        /* fetch templates once, map by id */
        const templateIds = lineItems
          .filter((li) => li.template_id !== null)
          .map((li) => li.template_id as string);

        const templateMap = new Map<string, FormulaDef>();
        if (templateIds.length) {
          const { data: templates, error: tmplErr } = await supabase
            .from('line_item_templates')
            .select('*')
            .in('id', templateIds);
          if (tmplErr) {
            console.error('Error fetching templates:', tmplErr);
          } else {
            templates?.forEach((t) =>
              templateMap.set(t.id, {
                id: t.id,
                name: t.name,
                description: t.description,
                output_unit: t.output_unit,
                unit_type: t.unit_type,
                formula: t.formula as CalculatorTemplate | null,
                instructions: t.instructions,
              }),
            );
          }
        }

        /* safe-destructure so coordinates is GeometryData | null */
        return lineItems.map((li) => {
          const { coordinates: raw, ...rest } = li;
          return {
            ...rest,
            unit_measure: li.unit_measure as UnitMeasureTypeValue,
            coordinates: raw ? parseWKT(raw as string) : null,
            template_id: li.template_id || null,
            formula: li.template_id ? templateMap.get(li.template_id) || null : null,
          };
        }) as LineItemWithGeo[];
      } catch (err) {
        logError('fetchLineItems', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ CREATE ══════════ */
  const createLineItem = useCallback(
    async (
      data: LineItemsInsert & { coordinates?: GeometryData },
    ): Promise<string | null> => {
      try {
        const { coordinates, ...base } = data;
        const payload = sessionId ? { ...base, session_id: sessionId } : base;

        const { data: newLI, error } = await supabase
          .from('line_items')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        if (!newLI) return null;

        /* optional geometry update */
        if (coordinates) {
          const wkt = geometryToWKT(coordinates);
          if (wkt) {
            let q = supabase.from('line_items').update({ coordinates: wkt }).eq('id', newLI.id);
            if (sessionId) q = q.eq('session_id', sessionId);
            const { error: geoErr } = await q;
            if (geoErr) throw geoErr;
          }
        }
        return newLI.id;
      } catch (err) {
        logError('createLineItem', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ UPDATE ══════════ */
  const updateLineItem = useCallback(
    async (
      id: string,
      updates: LineItemsUpdate & { coordinates?: GeometryData | null },
    ): Promise<void> => {
      try {
        const { coordinates, ...rest } = updates;

        let q = supabase.from('line_items').update(rest).eq('id', id);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;

        if (coordinates !== undefined) {
          const wkt = coordinates ? geometryToWKT(coordinates) : null;
          let q2 = supabase.from('line_items').update({ coordinates: wkt }).eq('id', id);
          if (sessionId) q2 = q2.eq('session_id', sessionId);
          const { error: geoErr } = await q2;
          if (geoErr) throw geoErr;
        }
      } catch (err) {
        logError('updateLineItem', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ DELETE ══════════ */
  const deleteLineItem = useCallback(
    async (id: string): Promise<void> => {
      try {
        let q = supabase.from('line_items').delete().eq('id', id);
        if (sessionId) q = q.eq('session_id', sessionId);
        const { error } = await q;
        if (error) throw error;
      } catch (err) {
        logError('deleteLineItem', err);
        throw err;
      }
    },
    [sessionId],
  );

  /* ══════════ TEMPLATES (read-only) ══════════ */
  const fetchLineItemTemplate = useCallback(async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('line_item_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        output_unit: data.output_unit,
        unit_type: data.unit_type,
        formula: data.formula as CalculatorTemplate | null,
        instructions: data.instructions,
      } as FormulaDef;
    } catch (err) {
      logError('fetchLineItemTemplate', err);
      return null;
    }
  }, []);

  const fetchLineItemTemplates = useCallback(async (): Promise<FormulaDef[]> => {
    try {
      const { data, error } = await supabase.from('line_item_templates').select('*');
      if (error) throw error;

      return (
        data?.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          output_unit: t.output_unit,
          unit_type: t.unit_type,
          formula: t.formula as CalculatorTemplate | null,
          instructions: t.instructions,
        })) ?? []
      );
    } catch (err) {
      logError('fetchLineItemTemplates', err);
      return [];
    }
  }, []);

  /* ══════════ API ══════════ */
  return {
    fetchLineItems,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    fetchLineItemTemplate,
    fetchLineItemTemplates,
  };
}