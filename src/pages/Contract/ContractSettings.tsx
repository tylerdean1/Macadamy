import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import fastEqual from 'fast-deep-equal';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';

import { supabase } from '@/lib/supabase';
import { Page } from '@/pages/StandardPages/StandardPageComponents/Page';
import { PageContainer } from '@/pages/StandardPages/StandardPageComponents/PageContainer';
import { CardSection } from '@/pages/StandardPages/StandardPageComponents/CardSection';
import { ContractHeader } from '@/pages/Contract/ContractDasboardComponents/ContractHeader';
import { ContractTotalsPanel } from '@/pages/Contract/ContractDasboardComponents/ContractTotalsPanel';
import { WbsSection } from '@/pages/Contract/ContractDasboardComponents/WbsSection';
import { MapModal } from '@/pages/Contract/SharedComponents/GoogleMaps/MapModal';
import { parseGeometryToPins } from '@/lib/utils/mapUtils';
import { useEnumOptions } from '@/hooks/useEnumOptions';

import type { Database } from '@/lib/database.types';
import type { WBSGroup, ProcessedMap, GeometryData } from '@/lib/types';

/* ————————————————————————————
   Table‑row aliases
———————————————————————————— */
type ContractRow = Database['public']['Tables']['contracts']['Row'];
type WbsRow      = Database['public']['Tables']['wbs']['Row'];
type MapRow      = Database['public']['Tables']['maps']['Row'];
type LineRow     = Database['public']['Tables']['line_items']['Row'];
type OrgRow      = Database['public']['Tables']['contract_organizations']['Row'];

/* Strip meta & tag with `persisted` flag */
type Clean<T> = Omit<T, 'created_at' | 'updated_at'> & {
  created_at: string | null;
  updated_at: string | null;
  persisted: boolean;
};

const build = <T extends { id?: string | null; created_at?: string | null; updated_at?: string | null }>(
  row: T
): Clean<T> => ({
  ...(row as T),
  created_at: row.created_at ?? null,
  updated_at: row.updated_at ?? null,
  persisted: Boolean(row.id),
});

/* ————————————————————————————
   Misc helpers
———————————————————————————— */
const now = () => new Date().toISOString();

/* ————————————————————————————
   Component
———————————————————————————— */
export default function ContractSettings() {
  const { id: contractId } = useParams<{ id: string }>();

  /* enum dropdowns */
  const roleOpts = useEnumOptions('organization_role');
  const unitOpts = useEnumOptions('unit_measure_type');

  /* local state */
  const [contract, setContract] = useState<Clean<ContractRow> | null>(null);
  const [orgs,     setOrgs]     = useState<Clean<OrgRow  >[]>([]);
  const [wbs,      setWbs]      = useState<Clean<WbsRow  >[]>([]);
  const [maps,     setMaps]     = useState<Clean<MapRow  >[]>([]);
  const [lines,    setLines]    = useState<Clean<LineRow >[]>([]);

  const [modalTarget, setModalTarget] = useState<
    { id: string; level: 'contract' | 'wbs' | 'map' | 'line' } | null
  >(null);
  const [modalPins,   setModalPins]   = useState<
    { lat: number; lng: number; label?: string }[]
  >([]);

  const [openWbs,  setOpenWbs]  = useState<string[]>([]);
  const [openMaps, setOpenMaps] = useState<string[]>([]);

  /* pristine snapshot for dirty checking */
  const pristine = useRef<{
    contract: ContractRow | null;
    orgs: OrgRow[];
    wbs: WbsRow[];
    maps: MapRow[];
    lines: LineRow[];
  } | null>(null);

  /* — fetch everything — */
  const fetchAll = useCallback(async () => {
    if (!contractId) return;

    const { data: ct } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    const { data: co } = await supabase
      .from('contract_organizations')
      .select('*')
      .eq('contract_id', contractId);

    const { data: wb } = await supabase
      .from('wbs')
      .select('*')
      .eq('contract_id', contractId);

    const wbsIds = (wb ?? []).map(w => w.id);

    const { data: mp } = await supabase
      .from('maps')
      .select('*')
      .in('wbs_id', wbsIds);

    const mapIds = (mp ?? []).map(m => m.id);

    const { data: li } = await supabase
      .from('line_items')
      .select('*')
      .in('map_id', mapIds);

    setContract(ct ? build(ct) : null);
    setOrgs((co ?? []).map(build));
    setWbs((wb ?? []).map(build));
    setMaps((mp ?? []).map(build));
    setLines((li ?? []).map(build));

    pristine.current = { contract: ct, orgs: co ?? [], wbs: wb ?? [], maps: mp ?? [], lines: li ?? [] };
  }, [contractId]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  /* dirty flag */
  const isDirty = useMemo(() => {
    if (!pristine.current) return false;
    return !fastEqual(pristine.current, {
      contract: contract ?? null,
      orgs, wbs, maps, lines,
    });
  }, [contract, orgs, wbs, maps, lines]);

  /* before‑unload guard */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  /* --------------- Budget roll‑ups --------------- */
  const totals = useMemo(() => {
    const mapTotals: Record<string, number> = {};
    maps.forEach(m => {
      mapTotals[m.id] = lines
        .filter(li => li.map_id === m.id)
        .reduce((s, li) => s + li.quantity * li.unit_price, 0);
    });

    const wbsTotals: Record<string, number> = {};
    wbs.forEach(w => {
      wbsTotals[w.id] = maps
        .filter(m => m.wbs_id === w.id)
        .reduce((s, m) => s + (mapTotals[m.id] ?? 0), 0);
    });

    return {
      mapTotals,
      wbsTotals,
      contractTotal: Object.values(wbsTotals).reduce((a, b) => a + b, 0),
    } as const;
  }, [lines, maps, wbs]);

  /* --------------- Add helpers --------------- */
  const addWbs = () => {
    if (!contract) return;
    const draft: WbsRow = {
      id: uuid(),
      contract_id: contract.id,
      wbs_number: '',
      description: '',
      coordinates: null,
      created_at: now(),
      updated_at: now(),
      budget: null,
      scope: null,
      session_id: null,
    };
    setWbs(p => [...p, build(draft)]);
    setOpenWbs(p => [...p, draft.id]);
  };

  const addMap = (wbsId: string) => {
    if (!contract) return;
    const draft: MapRow = {
      id: uuid(),
      contract_id: contract.id,
      wbs_id: wbsId,
      map_number: '',
      location_description: '',
      coordinates: null,
      created_at: now(),
      updated_at: now(),
      budget: null,
      session_id: null,
    };
    setMaps(p => [...p, build(draft)]);
    setOpenMaps(p => [...p, draft.id]);
  };

  const addLine = useCallback((mapId: string) => {
    if (!contract) return;
    const parentMap = maps.find(m => m.id === mapId);
    if (!parentMap) return;

    const draft: LineRow = {
      id: uuid(),
      contract_id: contract.id,
      wbs_id: parentMap.wbs_id,
      map_id: mapId,
      line_code: '',
      description: '',
      unit_measure: (unitOpts[0] ?? 'Each (EA)') as LineRow['unit_measure'],
      quantity: 0,
      unit_price: 0,
      reference_doc: null,
      template_id: null,
      coordinates: null,
      created_at: now(),
      updated_at: now(),
      session_id: null,
    };
    setLines(p => [...p, build(draft)]);
  }, [contract, maps, unitOpts]);

  /* --------------- Delete helpers --------------- */
  const deleteWbs  = (id: string) => {
    setWbs (p => p.filter(w => w.id !== id));
    setMaps(p => p.filter(m => m.wbs_id !== id));
    setLines(p => p.filter(l => l.wbs_id !== id));
  };
  const deleteMap  = (id: string) => {
    setMaps (p => p.filter(m => m.id !== id));
    setLines (p => p.filter(l => l.map_id !== id));
  };
  const deleteLine = (id: string) => {
    setLines(p => p.filter(l => l.id !== id));
  };

  /* --------------- Map‑modal helpers --------------- */
  const openMapModal = (id: string, level: 'contract' | 'wbs' | 'map' | 'line') => {
    const wkt =
      level === 'contract'
        ? contract?.coordinates
        : level === 'wbs'
        ? wbs.find(w => w.id === id)?.coordinates
        : level === 'map'
        ? maps.find(m => m.id === id)?.coordinates
        : lines.find(l => l.id === id)?.coordinates;

    const desc =
      level === 'map'
        ? maps.find(m => m.id === id)?.location_description ?? undefined
        : undefined;

    setModalPins(parseGeometryToPins(wkt as GeometryData | null, desc));
    setModalTarget({ id, level });
  };

  const applyWkt = (
    id: string,
    level: 'contract' | 'wbs' | 'map' | 'line',
    wkt: string
  ) => {
    if (level === 'contract') {
      setContract(c => (c ? { ...c, coordinates: wkt } : c));
    } else if (level === 'wbs') {
      setWbs(wbs => wbs.map(w => (w.id === id ? { ...w, coordinates: wkt } : w)));
    } else if (level === 'map') {
      setMaps(maps => maps.map(m => (m.id === id ? { ...m, coordinates: wkt } : m)));
    } else {
      setLines(lines => lines.map(li => (li.id === id ? { ...li, coordinates: wkt } : li)));
    }
  };

  /* --------------- diff helper --------------- */
  type TableKey = keyof Database['public']['Tables'];
  type TableRow<K extends TableKey>  = Database['public']['Tables'][K]['Row'];
  type InsertRow<K extends TableKey> = Database['public']['Tables'][K]['Insert'];
  type CleanRow<K extends TableKey>  = Clean<TableRow<K>>;

  const diff = async <
    K extends TableKey,
    Row extends TableRow<K>,
    Insert extends InsertRow<K>
  >(
    table: K,
    next: CleanRow<K>[],
    prev: CleanRow<K>[]
  ) => {
    const keyOf = (row: CleanRow<K>) =>
      (row as { id?: string }).id ?? JSON.stringify(row);

    const prevMap = new Map<string, CleanRow<K>>(prev.map(r => [keyOf(r), r]));
    const nextMap = new Map<string, CleanRow<K>>(next.map(r => [keyOf(r), r]));

    /* DELETE (if table has an `id`) */
    if ('id' in ({} as Row)) {
      const toDelete = [...prevMap.values()]
        .filter(r => !nextMap.has(keyOf(r)))
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        .filter((r): r is CleanRow<K> & { id: string } => !!(r as any).id)
        .map(r => (r as { id: string }).id);

      if (toDelete.length) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        await (supabase as any).from(table as string).delete().in('id', toDelete);
      }
    }

    /* UPSERT */
    if (next.length) {
      const rows: Insert[] = next.map(r => {
        const { ...dbRow } = r;
        return dbRow as unknown as Insert;
      });

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      await (supabase as any).from(table as string).upsert(rows);
    }
  };

  /* --------------- save‑all --------------- */
  const saveAll = async () => {
    if (!contract) return;

    toast.promise(
      (async () => {
        /* contract */
        if (!fastEqual(contract, pristine.current?.contract)) {
          const { ...dbRow } = contract;
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          await (supabase as any)
            .from('contracts')
            .update(dbRow)
            .eq('id', contract.id);
        }

        await diff('contract_organizations', orgs.map(build), pristine.current?.orgs.map(build) ?? []);
        await diff('wbs',                   wbs.map(build),   pristine.current?.wbs.map(build)   ?? []);
        await diff('maps',                  maps.map(build),  pristine.current?.maps.map(build)  ?? []);
        await diff('line_items',            lines.map(build), pristine.current?.lines.map(build) ?? []);

        /* optional recalc */
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        await (supabase as any).rpc('recalculate_budgets_for_contract', {
          p_contract_id: contract.id,
        });

        await fetchAll();
      })(),
      { loading: 'Saving…', success: 'Saved!', error: 'Save failed' }
    );
  };

  /* --------------- accordion view‑model --------------- */
  const wbsGroups: WBSGroup[] = useMemo(() => {
    return wbs.map<WBSGroup>(w => {
      const mapsForWbs: ProcessedMap[] = maps
        .filter(m => m.wbs_id === w.id)
        .map<ProcessedMap>(m => {
          const mapLines: ProcessedMap['line_items'] = lines
            .filter(li => li.map_id === m.id)
            .map(li => ({
              id: li.id,
              line_code:    li.line_code ?? '',
              description:  li.description ?? '',
              unit_measure: li.unit_measure ?? '',
              quantity:     li.quantity,
              unit_price:   li.unit_price,
              reference_doc: li.reference_doc,
              map_id:       li.map_id,
              total_cost:   li.quantity * li.unit_price,
              amount_paid:  0,
            }));

          return {
            id: m.id,
            map_number:           m.map_number ?? '',
            location_description: m.location_description ?? '',
            coordinates:          m.coordinates as GeometryData | null,
            line_items: mapLines,
            addLine: () => addLine(m.id),
            contractTotal: totals.mapTotals[m.id] ?? 0,
            amountPaid: 0,
            progress: 0,
          };
        });

      return {
        wbs:           w.wbs_number || '(new)',
        description:   w.description ?? '',
        contractTotal: totals.wbsTotals[w.id] ?? 0,
        amountPaid:    0,
        progress:      0,
        maps: mapsForWbs,
      };
    });
  }, [wbs, maps, lines, totals, addLine]);

  /* --------------- UI --------------- */
  if (!contract) return null;

  return (
    <Page>
      <PageContainer>
        <CardSection>
          <ContractHeader
            contract={contract}
            onStatusChange={async status =>
              setContract(c => (c ? { ...c, status } : c))
            }
          />

          {/* --------------- Organizations --------------- */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Organizations
            </h3>

            {orgs.map(o => (
              <div
                key={`${o.organization_id}-${o.role}`}
                className="flex items-center gap-2 mb-1 bg-background-light p-2 rounded"
              >
                <input
                  className="flex-1 bg-transparent border-b border-gray-600 text-white"
                  aria-label="Organization ID"
                  value={o.organization_id ?? ''}
                  onChange={e =>
                    setOrgs(p =>
                      p.map(r =>
                        r === o ? { ...r, organization_id: e.target.value } : r
                      )
                    )
                  }
                />
                <select
                  aria-label="Organization Role"
                  className="bg-background border rounded text-white"
                  value={o.role ?? ''}
                  onChange={e =>
                    setOrgs(p =>
                      p.map(r =>
                        r === o
                          ? { ...r, role: e.target.value as OrgRow['role'] }
                          : r
                      )
                    )
                  }
                >
                  {roleOpts.map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <button
                  className="text-red-400 hover:text-red-600"
                  onClick={() => setOrgs(p => p.filter(r => r !== o))}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              className="text-sm text-primary hover:text-primary-light mt-1"
              onClick={() => {
                if (!contract) return;
                const draft: OrgRow = {
                  id: uuid(),
                  contract_id: contract.id,
                  organization_id: '',
                  role: (roleOpts[0] as OrgRow['role']) ?? 'Other',
                  notes: null,
                  created_at: now(),
                  updated_at: now(),
                  created_by: '',
                  session_id: null,
                };
                setOrgs(p => [...p, build(draft)]);
              }}
            >
              + Add Organization
            </button>
          </section>

          {/* --------------- WBS accordion --------------- */}
          {wbsGroups.map(group => {
            const wbsRow = wbs.find(w => w.wbs_number === group.wbs)!;

            return (
              <div key={group.wbs} className="mb-4">
                <WbsSection
                  group={group}
                  isExpanded={openWbs.includes(group.wbs)}
                  onToggle={id =>
                    setOpenWbs(p =>
                      p.includes(id) ? p.filter(x => x !== id) : [...p, id]
                    )
                  }
                  expandedMaps={openMaps}
                  onToggleMap={id =>
                    setOpenMaps(p =>
                      p.includes(id) ? p.filter(x => x !== id) : [...p, id]
                    )
                  }
                  onMapClick={m => openMapModal(m.id, 'map')}
                  onViewWbsMap={() => openMapModal(wbsRow.id, 'wbs')}
                  onAddMap={() => addMap(wbsRow.id)}
                  onDeleteWbs={() => deleteWbs(wbsRow.id)}
                  onAddLine={mapId => addLine(mapId)}
                  onDeleteMap={deleteMap}
                  onDeleteLine={deleteLine}
                />
              </div>
            );
          })}

          <button
            onClick={addWbs}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover rounded text-white"
          >
            + Add WBS
          </button>

          <ContractTotalsPanel
            totalContractValue={totals.contractTotal}
            amountPaid={0}
            progressPercent={0}
          />

          <div className="flex justify-end mt-6">
            <button
              className={`px-6 py-2 rounded text-white ${
                isDirty
                  ? 'bg-primary hover:bg-primary-hover'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              onClick={saveAll}
              disabled={!isDirty}
            >
              Save All
            </button>
          </div>
        </CardSection>
      </PageContainer>

      {modalTarget && (
        <MapModal
          open
          targetId={modalTarget.id}
          level={modalTarget.level}
          mapLocations={modalPins}
          onClose={() => setModalTarget(null)}
          onConfirm={wkt => {
            applyWkt(modalTarget.id, modalTarget.level, wkt);
            setModalTarget(null);
          }}
        />
      )}
    </Page>
  );
}