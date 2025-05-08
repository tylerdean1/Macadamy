import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RoomIcon from '@mui/icons-material/Room';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import WbsForm from '@/components/contract/WbsForm';
import { MapsForm } from '@/components/contract/MapsForm';
import { LineItemsForm } from '@/components/contract/LineItemsForm';
import { MapModal } from '@/components/contract/MapModal';
import { UNIT_MEASURE_OPTIONS, OrganizationRole } from '@/lib/enums';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import {
  GoogleMap,
  Marker,
  Polyline,
  Polygon,
  useJsApiLoader,
} from '@react-google-maps/api';
import type { EditableMap } from '@/components/contract/MapsForm';
import type { EditableWbsSection } from '@/components/contract/WbsForm';
import type {
  WBS,
  Maps,
  LineItems,
  LineItemTemplates,
  Contracts,
} from '@/lib/types';
import type { Database } from '@/lib/database.types';

type ContractStatusValue = Database['public']['Enums']['contract_status'];
type ContractOrganization = Database['public']['Tables']['contract_organizations']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];
type Role = Database['public']['Enums']['organization_role'];


function GoogleMapPreview({ coordinates }: { coordinates: string | null }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  if (!coordinates || !isLoaded) return null;

  const parseWKT = (wkt: string): { type: string; points: google.maps.LatLngLiteral[] } => {
    if (wkt.startsWith('POINT')) {
      const [lng, lat] = wkt.replace('POINT(', '').replace(')', '').split(' ').map(Number);
      return { type: 'point', points: [{ lat, lng }] };
    }
    if (wkt.startsWith('LINESTRING')) {
      const coords = wkt.replace('LINESTRING(', '').replace(')', '').split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return { lat, lng };
      });
      return { type: 'line', points: coords };
    }
    if (wkt.startsWith('POLYGON')) {
      const cleaned = wkt.replace('POLYGON((', '').replace('))', '');
      const coords = cleaned.split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return { lat, lng };
      });
      return { type: 'polygon', points: coords };
    }
    return { type: 'unknown', points: [] };
  };

  const { type, points } = parseWKT(coordinates);
  if (!points.length) return null;

  const center = points[Math.floor(points.length / 2)];

  return (
    <Box sx={{ my: 2, width: '100%', height: 300 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={16}
      >
        {type === 'point' && <Marker position={points[0]} />}
        {type === 'line' && <Polyline path={points} options={{ strokeColor: '#00bfff', strokeWeight: 4 }} />}
        {type === 'polygon' && (
          <Polygon
            path={points}
            options={{ strokeColor: '#00FF00', fillColor: '#00FF0080', strokeWeight: 2 }}
          />
        )}
      </GoogleMap>
    </Box>
  );
}

function OrgRoleManager({ contractId }: { contractId: string }) {
  const [entries, setEntries] = useState<
    (ContractOrganization & { organization: Organization | null })[]
  >([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [newOrgId, setNewOrgId] = useState<string>('');
  const [newRole, setNewRole] = useState<Role>('Prime Contractor');
  const [roleOptions, setRoleOptions] = useState<Role[]>([]);

  useEffect(() => {
    (async () => {
      const { data: roles, error } = await supabase.rpc('get_enum_values', {
        enum_type: 'organization_role',
      });
      if (error) console.error('Failed to fetch organization roles', error);
      else setRoleOptions((roles ?? []).map((r) => r.value as Role));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data: orgs } = await supabase.from('organizations').select('*');
      const { data: rels } = await supabase
        .from('contract_organizations')
        .select('*, organization:organization_id(*)')
        .eq('contract_id', contractId); 
      setAllOrgs(orgs ?? []);
      setEntries(rels ?? []);
    })();
  }, [contractId]);

  const handleAdd = async () => {
    if (!newOrgId) return;
    const user = supabase.auth.getUser();
      await supabase.from('contract_organizations').insert({
        contract_id: contractId,
        organization_id: newOrgId,
        role: newRole,
        created_by: (await user).data?.user?.id ?? ''
      });
    setNewOrgId('');
    setNewRole('Prime Contractor');
    const { data: rels = [] } = await supabase
      .from('contract_organizations')
      .select('*, organization:organization_id(*)')
      .eq('contract_id', contractId);
      setEntries(rels ?? []);
  };

  const handleRoleChange = async (entryId: string, role: Role) => {
    await supabase.from('contract_organizations').update({ role }).eq('id', entryId);
    setEntries(prev =>
      prev.map(e => (e.id === entryId ? { ...e, role } : e))
    );
  };

  const handleDelete = async (id: string) => {
    await supabase.from('contract_organizations').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {entries.map(entry => (
        <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography>{entry.organization?.name || 'Unknown Org'}</Typography>
          <select
            title="Organization Role"
            aria-label="Organization Role"
            value={entry.role ?? ''}
            onChange={(e) => handleRoleChange(entry.id, e.target.value as Role)}
            className="bg-zinc-900 border border-zinc-700 text-white px-2 py-1 rounded"
          >
            <option value="" disabled>Select role</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            className="text-red-400 hover:underline"
            onClick={() => handleDelete(entry.id)}
          >
            Remove
          </button>
        </Box>
      ))}
      <Divider />
      <Box display="flex" gap={2}>
        <select
          aria-label="Select Organization"
          value={newOrgId}
          onChange={(e) => setNewOrgId(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white px-2 py-1 rounded"
        >
          <option value="">Select Organization</option>
          {allOrgs
            .filter(org => !entries.find(e => e.organization_id === org.id))
            .map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
        </select>
        <select
          aria-label="Select Role"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as Role)}
          className="bg-zinc-900 border border-zinc-700 text-white px-2 py-1 rounded"
        >
          {Object.values(OrganizationRole).map(r => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          className="bg-primary text-white px-3 py-1 rounded"
          onClick={handleAdd}
        >
          + Add Organization
        </button>
      </Box>
    </Box>
  );
}

export function ContractSettings() {
  const { id: contractId } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contracts | null>(null);
  const [wbsSections, setWbsSections] = useState<WBS[]>([]);
  const [mapsByWbs, setMapsByWbs] = useState<Record<string, Maps[]>>({});
  const [lineItemsByMap, setLineItemsByMap] = useState<Record<string, LineItems[]>>({});
  const [templates, setTemplates] = useState<LineItemTemplates[]>([]);
  const [modalTarget, setModalTarget] = useState<{ id: string; level: 'contract' | 'wbs' | 'map' | 'line' } | null>(null);
  const statusOptions = useEnumOptions('contract_status');

  useEffect(() => {
    if (!contractId) return;
    const id = contractId as string;
    async function load() {
      const { data: contract } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      const { data: wbs = [] } = await supabase
        .from('wbs')
        .select('*')
        .eq('contract_id', id);

      const wbsIds = (wbs ?? []).map(w => w.id);
      const { data: maps = [] } = await supabase
        .from('maps')
        .select('*')
        .in('wbs_id', wbsIds);

      const mapIds = (maps ?? []).map(m => m.id);
      const { data: lineItems = [] } = await supabase
        .from('line_items')
        .select('*')
        .in('map_id', mapIds);

      const { data: templates = [] } = await supabase
        .from('line_item_templates')
        .select('*');

      setContract(contract);
      setWbsSections(wbs ?? []);
      setTemplates(templates ?? []);

      const groupedMaps = (maps ?? []).reduce((acc, map) => {
        acc[map.wbs_id] = [...(acc[map.wbs_id] || []), map];
        return acc;
      }, {} as Record<string, Maps[]>);
      setMapsByWbs(groupedMaps);

      const groupedItems = (lineItems ?? []).reduce((acc, li) => {
        if (li.map_id) {
          acc[li.map_id] = [...(acc[li.map_id] || []), li];
        }
        return acc;
      }, {} as Record<string, LineItems[]>);
      setLineItemsByMap(groupedItems);
    }
    load();
  }, [contractId]);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Contract Settings</Typography>
      </Box>
  
      {contract && (
        <Box mb={4} sx={{ gap: 2, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <input
            value={contract.title ?? ''}
            onChange={(e) => setContract((c) => c && { ...c, title: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white"
            placeholder="Contract Title"
          />
          <input
            value={contract.location ?? ''}
            onChange={(e) => setContract((c) => c && { ...c, location: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white"
            placeholder="Contract Location"
          />
          <textarea
            value={contract.description ?? ''}
            onChange={(e) => setContract((c) => c && { ...c, description: e.target.value })}
            className="col-span-2 bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white"
            placeholder="Description"
          />
          <select
            value={contract.status ?? ''}
            onChange={(e) =>
              setContract((c) => c && { ...c, status: e.target.value as ContractStatusValue })}
            className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white"
            aria-label="Status"
          > 
            <option value="" disabled>Select status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={contract.start_date ?? ''}
            onChange={(e) => setContract((c) => c && { ...c, start_date: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={contract.end_date ?? ''}
            onChange={(e) => setContract((c) => c && { ...c, end_date: e.target.value })}
            className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white"
            placeholder="End Date"
          />
          <Box display="flex" alignItems="center">
            <GoogleMapPreview coordinates={typeof contract.coordinates === 'string' ? contract.coordinates : null} />
            <IconButton
              onClick={() => setModalTarget({ id: contract.id, level: 'contract' })}
              sx={{ color: 'red' }}
            >
              <RoomIcon />
            </IconButton>
          </Box>
        </Box>
      )}
  
  <OrgRoleManager contractId={contractId!} />

<Divider sx={{ my: 3 }} />

{wbsSections.map((wbs) => (
  <Accordion key={wbs.id} defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6">WBS {wbs.wbs_number}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography variant="body2">{wbs.description}</Typography>
      <Box display="flex" alignItems="center">
        <GoogleMapPreview
          coordinates={typeof wbs.coordinates === 'string' ? wbs.coordinates : null}
        />
        <IconButton
          onClick={() => setModalTarget({ id: wbs.id, level: 'wbs' })}
          sx={{ color: 'red' }}
        >
          <RoomIcon />
        </IconButton>
      </Box>

      <MapsForm
        wbsId={wbs.id}
        maps={(mapsByWbs[wbs.id] || []).map(map => ({
          ...map,
          location_description: map.location_description ?? '',
        })) as EditableMap[]}
        onChange={(newMaps: EditableMap[]) =>
          setMapsByWbs((prev) => ({ ...prev, [wbs.id]: newMaps as Maps[] }))
        }
      />

      {(mapsByWbs[wbs.id] || []).map((map) => (
        <Box key={map.id} sx={{ pl: 2, mt: 2, borderLeft: '2px solid #444' }}>
          <Typography variant="subtitle1" gutterBottom>
            Map {map.map_number}
          </Typography>
          <Typography variant="body2">{map.location_description}</Typography>
          <Box display="flex" alignItems="center" mb={2}>
            <GoogleMapPreview
              coordinates={typeof map.coordinates === 'string' ? map.coordinates : null}
            />
            <IconButton
              onClick={() => setModalTarget({ id: map.id, level: 'map' })}
              sx={{ color: 'red' }}
            >
              <RoomIcon />
            </IconButton>
          </Box>

          <MapsForm
            wbsId={wbs.id}
            maps={[(map as EditableMap)]}
            onChange={(newMaps: EditableMap[]) =>
              setMapsByWbs((prev) => ({
                ...prev,
                [wbs.id]: prev[wbs.id].map((m) =>
                  m.id === map.id ? { ...m, ...newMaps[0] } : m
                ),
              }))
            }
          />

          {(lineItemsByMap[map.id] || []).map((li) => (
            <Box key={li.id} sx={{ pl: 2, mt: 2, borderLeft: '2px dashed #666' }}>
              <Typography variant="body2" gutterBottom>
                Line Item: {li.line_code}
              </Typography>
              <Typography variant="body2">{li.description}</Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <GoogleMapPreview
                  coordinates={typeof li.coordinates === 'string' ? li.coordinates : null}
                />
                <IconButton
                  onClick={() => setModalTarget({ id: li.id, level: 'line' })}
                  sx={{ color: 'red' }}
                >
                  <RoomIcon />
                </IconButton>
              </Box>

              <LineItemsForm
                mapId={map.id}
                lineItems={[li]}
                templates={templates}
                unitOptions={UNIT_MEASURE_OPTIONS.map((u) => ({ label: u, value: u }))}
                onChange={(newItems) =>
                  setLineItemsByMap((prev) => ({
                    ...prev,
                    [map.id]: prev[map.id].map((item) =>
                      item.id === li.id ? newItems[0] : item
                    ),
                  }))
                }
              />
            </Box>
          ))}
        </Box>
      ))}
    </AccordionDetails>
  </Accordion>
))}

<WbsForm
  sections={wbsSections.map((wbs) => ({
    ...wbs,
    description: wbs.description ?? '',
  })) as EditableWbsSection[]}
  onChange={(updatedSections: EditableWbsSection[]) => {
    setWbsSections(updatedSections as WBS[]); // if needed
  }}
/>

{modalTarget && (
  <MapModal
  open={!!modalTarget}
  targetId={modalTarget.id}
  level={modalTarget.level}
  onClose={() => setModalTarget(null)}
  onConfirm={(wkt) => {
    const { id, level } = modalTarget;
    if (!id || !level) return;

    // Update local coordinates in state
    if (level === 'contract') {
      setContract((prev) => prev && { ...prev, coordinates: wkt });
    } else if (level === 'wbs') {
      setWbsSections((prev) =>
        prev.map((wbs) => (wbs.id === id ? { ...wbs, coordinates: wkt } : wbs))
      );
    } else if (level === 'map') {
      setMapsByWbs((prev) => {
        const group = Object.entries(prev).map(([wbsId, maps]) => [
          wbsId,
          maps.map((m) => (m.id === id ? { ...m, coordinates: wkt } : m)),
        ]);
        return Object.fromEntries(group);
      });
    } else if (level === 'line') {
      setLineItemsByMap((prev) => {
        const group = Object.entries(prev).map(([mapId, items]) => [
          mapId,
          items.map((li) => (li.id === id ? { ...li, coordinates: wkt } : li)),
        ]);
        return Object.fromEntries(group);
      });
    }

    setModalTarget(null);
  }}
  
/>
)}
<Box display="flex" justifyContent="flex-end" mt={4}>
  <button
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
    onClick={async () => {
      if (!contract) return;

      // Save contract
      const { error: contractError } = await supabase
        .from('contracts')
        .update({
          title: contract.title,
          description: contract.description,
          location: contract.location,
          status: contract.status,
          start_date: contract.start_date,
          end_date: contract.end_date,
          coordinates: contract.coordinates,
        })
        .eq('id', contract.id);
      if (contractError) console.error('Failed to save contract', contractError);

      // Save WBS
      for (const wbs of wbsSections) {
        const { error: wbsError } = await supabase
          .from('wbs')
          .update({
            wbs_number: wbs.wbs_number,
            description: wbs.description,
            coordinates: wbs.coordinates,
          })
          .eq('id', wbs.id);
        if (wbsError) console.error(`Failed to save WBS ${wbs.id}`, wbsError);
      }

      // Save Maps
      for (const maps of Object.values(mapsByWbs)) {
        for (const map of maps) {
          const { error: mapError } = await supabase
            .from('maps')
            .update({
              map_number: map.map_number,
              location_description: map.location_description,
              coordinates: map.coordinates,
            })
            .eq('id', map.id);
          if (mapError) console.error(`Failed to save Map ${map.id}`, mapError);
        }
      }

      // Save Line Items
      for (const lineItems of Object.values(lineItemsByMap)) {
        for (const li of lineItems) {
          const { error: liError } = await supabase
            .from('line_items')
            .update({
              line_code: li.line_code,
              description: li.description,
              quantity: li.quantity,
              unit_price: li.unit_price,
              unit_measure: li.unit_measure,
              reference_doc: li.reference_doc,
              coordinates: li.coordinates,
              template_id: li.template_id,
            })
            .eq('id', li.id);
          if (liError) console.error(`Failed to save Line Item ${li.id}`, liError);
        }
      }

      alert('All changes saved!');
    }}
  >
    💾 Save All Changes
  </button>
</Box>
</Box>
  );
}  