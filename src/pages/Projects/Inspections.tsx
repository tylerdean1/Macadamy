/**
 * Inspections.tsx - Inspection Management Page
 *
 * Overview:
 * - Allows users to upload PDF inspection reports with optional photo attachments.
 * - Associates each inspection with a specific contract, WBS, map, and line item via dropdowns.
 * - Supports viewing and editing of inspections.
 * - Ensures proper role-based permissions:
 *   - All users can view inspection reports and photos.
 *   - Only 'admin', 'engineer', and 'inspector' roles can create or edit inspections.
 *
 * Future Enhancements:
 * - Support for inspection templates (structured test types like compaction, density, etc.).
 * - Dynamic form generation based on template type.
 * - Pass/fail status flags and report export.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { FileText, Plus, Pencil } from 'lucide-react';
import { rpcClient } from '@/lib/rpc.client';
import { getOrderByColumn } from '@/lib/utils/rpcOrderBy';

// Define the structure of an inspection record
interface Inspection {
  id?: string;
  name: string;
  description: string | null;
  contract_id: string;
  wbs_id: string | null;
  map_id: string | null;
  line_item_id: string | null;
  pdf_url: string | null;
  photo_urls: string[] | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Generic structure for dropdown options
interface Option {
  id: string;
  name: string;
}

export default function Inspections() {
  const user = useAuthStore(state => state.user);

  // State variables
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);

  // Holds form data for creating/editing inspections
  const [newInspection, setNewInspection] = useState<{
    name: string;
    description: string;
    contract_id: string;
    wbs_id: string;
    map_id: string;
    line_item_id: string;
    photo_urls: string[];
  }>({
    name: '',
    description: '',
    contract_id: '',
    wbs_id: '',
    map_id: '',
    line_item_id: '',
    photo_urls: [],
  });

  // Dropdown data
  const [contracts, setContracts] = useState<Option[]>([]);
  const [wbsList, setWbsList] = useState<Option[]>([]);
  const [mapList, setMapList] = useState<Option[]>([]);
  const [lineItems, setLineItems] = useState<Option[]>([]);

  // Check if the user has edit permissions
  const canEdit = typeof user?.role === 'string' && ['admin', 'engineer', 'inspector'].includes(user.role);

  // Initial load
  useEffect(() => {
    void loadOptions();
    void fetchInspections();
  }, []);

  // Dynamically load WBS after contract is selected
  useEffect(() => {
    if (newInspection.contract_id) void fetchWbs(newInspection.contract_id);
  }, [newInspection.contract_id]);

  // Load maps once WBS is selected
  useEffect(() => {
    if (newInspection.wbs_id) void fetchMaps(newInspection.wbs_id);
  }, [newInspection.wbs_id]);

  // Load line items when map is selected
  useEffect(() => {
    if (newInspection.map_id) void fetchLineItems(newInspection.map_id);
  }, [newInspection.map_id]);

  // Fetch contract list using RPC
  async function loadOptions() {
    try {
      // Note: get_contract_with_wkt normally expects a contract_id parameter,
      // but when called without it, it should return all contracts
      const orderBy = await getOrderByColumn('projects');
      if (!orderBy) {
        setContracts([]);
        return;
      }

      const { data, error } = await supabase.rpc('filter_projects', {
        _filters: {},
        _order_by: orderBy,
        _direction: 'asc'
      });

      if (error) {
        console.error('Error fetching contracts:', error);
        return;
      }

      if (Array.isArray(data)) {
        setContracts(data.map((contract) => ({
          id: contract.id,
          name: contract.name
        })));
      }
    } catch (err) {
      console.error('Unexpected error in loadOptions:', err);
    }
  }

  // Fetch WBS entries for a contract using RPC
  async function fetchWbs(contractId: string) {
    try {
      const { data, error } = await supabase.rpc('filter_wbs', {
        _filters: { project_id: contractId }
      });

      if (error) {
        console.error('Error fetching WBS:', error);
        setWbsList([]);
        return;
      }

      if (Array.isArray(data)) {
        setWbsList(data.map((wbs) => ({
          id: wbs.id,
          name: wbs.name || 'Unnamed WBS',
        })));
      } else {
        setWbsList([]);
      }
    } catch (err) {
      console.error('Unexpected error in fetchWbs:', err);
      setWbsList([]);
    }
  }

  // Fetch maps for a WBS using RPC
  async function fetchMaps(wbsId: string) {
    try {
      // In this application, get_maps_with_wkt needs contract_id, not wbs_id
      // This is likely a design issue in the API, but we need to work with it
      const { data, error } = await supabase.rpc('filter_maps', {
        _filters: { wbs_id: wbsId }
      });

      if (error) {
        console.error('Error fetching maps:', error);
        setMapList([]);
        return;
      }

      if (Array.isArray(data)) {
        // Filter maps to only show ones related to the selected WBS
        const filteredMaps = data.filter(map => map.wbs_id === wbsId);
        setMapList(filteredMaps.map((map) => ({
          id: map.id,
          name: map.name
        })));
      } else {
        setMapList([]);
      }
    } catch (err) {
      console.error('Unexpected error in fetchMaps:', err);
      setMapList([]);
    }
  }

  // Fetch line items for a map
  async function fetchLineItems(mapId: string) {
    try {
      const data = await rpcClient.filter_line_items({
        _filters: { map_id: mapId }
      });

      if (Array.isArray(data) && data.length > 0) {
        setLineItems(data.map(li => ({
          id: li.id,
          name: li.description || li.name || 'Unnamed Line Item'
        })));
      } else {
        setLineItems([]);
      }
    } catch (err) {
      console.error('Error in fetchLineItems:', err);
      setLineItems([]);
    }
  }

  // Fetch inspections using RPC
  async function fetchInspections() {
    try {
      const data = await rpcClient.filter_inspections({
        _filters: {}
      });

      const normalized: Inspection[] = Array.isArray(data)
        ? data.map(insp => ({
          id: insp.id,
          name: insp.name,
          description: insp.notes ?? null,
          contract_id: insp.project_id ?? '',
          wbs_id: null,
          map_id: null,
          line_item_id: null,
          pdf_url: null,
          photo_urls: null,
          created_by: null,
          updated_by: null,
          created_at: insp.created_at ?? null,
          updated_at: insp.updated_at ?? null
        }))
        : [];
      setInspections(normalized);
    } catch (err) {
      console.error('Unexpected error in fetchInspections:', err);
    }
  }

  // Upload file (PDF or image) to Supabase Storage and return public URL
  async function uploadFile(file: File, folder: string): Promise<string | null> {
    const path = `${folder}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from('documents').upload(path, file);
    if (error) {
      alert('Failed to upload file');
      return null;
    }
    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
    return urlData?.publicUrl || null;
  }

  // Save inspection (create or update) using correct backend functions
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newInspection.name || !newInspection.contract_id || !pdfFile) return;

    try {
      const pdfUrl = await uploadFile(pdfFile, 'inspections');
      if (typeof pdfUrl !== 'string' || pdfUrl.length === 0) return;

      const photoUrls: string[] = [];
      if (photoFiles) {
        for (const file of Array.from(photoFiles)) {
          const url = await uploadFile(file, 'inspection-photos');
          if (typeof url === 'string' && url.length > 0) photoUrls.push(url);
        }
      }

      const insertData = {
        name: newInspection.name,
        description: newInspection.description,
        contract_id: newInspection.contract_id,
        wbs_id: newInspection.wbs_id || undefined,
        map_id: newInspection.map_id || undefined,
        line_item_id: newInspection.line_item_id || undefined,
        pdf_url: pdfUrl,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        created_by: user.id
      };

      const input = {
        name: insertData.name,
        project_id: insertData.contract_id || null,
        notes: insertData.description || null,
        result: {
          pdf_url: insertData.pdf_url,
          photo_urls: insertData.photo_urls ?? [],
          line_item_id: insertData.line_item_id,
          map_id: insertData.map_id,
          wbs_id: insertData.wbs_id
        }
      };

      if (typeof editingId === 'string' && editingId.length > 0) {
        // Use correct backend function for updating inspection
        await rpcClient.update_inspections({
          _id: editingId,
          _input: input
        });
      } else {
        // Use correct backend function for inserting inspection
        await rpcClient.insert_inspections({
          _input: input
        });
      }

      setCreating(false);
      setEditingId(null);
      setNewInspection({
        name: '',
        description: '',
        contract_id: '',
        wbs_id: '',
        map_id: '',
        line_item_id: '',
        photo_urls: []
      });
      setPdfFile(null);
      setPhotoFiles(null);
      void fetchInspections();
    } catch (err) {
      console.error('Unexpected error in handleSave:', err);
      alert('Error saving inspection');
    }
  }

  // Load inspection data into form for editing, handling nullable fields correctly
  function handleEdit(insp: Inspection) {
    setNewInspection({
      name: insp.name,
      description: typeof insp.description === 'string' ? insp.description : '',
      contract_id: insp.contract_id,
      wbs_id: typeof insp.wbs_id === 'string' ? insp.wbs_id : '',
      map_id: typeof insp.map_id === 'string' ? insp.map_id : '',
      line_item_id: typeof insp.line_item_id === 'string' ? insp.line_item_id : '',
      photo_urls: insp.photo_urls || [],
    });
    setEditingId(insp.id!);
    setCreating(true);
  }

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inspections</h1>
        {canEdit && (
          <button className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> New Inspection
          </button>
        )}
      </div>

      {/* Inspection Form */}
      {creating && (
        <form onSubmit={e => { void handleSave(e); }} className="space-y-4 bg-background-light p-4 rounded border">
          <input
            type="text"
            placeholder="Name"
            value={newInspection.name}
            onChange={(e) => setNewInspection({ ...newInspection, name: e.target.value })}
            className="w-full px-4 py-2 text-black rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={newInspection.description}
            onChange={(e) => setNewInspection({ ...newInspection, description: e.target.value })}
            className="w-full px-4 py-2 text-black rounded"
          />
          <label htmlFor="contractSelect" className="sr-only">Select Contract</label>
          <select
            id="contractSelect"
            className="w-full text-black px-4 py-2 rounded"
            value={newInspection.contract_id}
            onChange={(e) => setNewInspection({ ...newInspection, contract_id: e.target.value })}
            required
          >
            <option value="">Select Contract</option>
            {contracts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label htmlFor="wbsSelect" className="sr-only">Select WBS</label>
          <select
            id="wbsSelect"
            className="w-full text-black px-4 py-2 rounded"
            value={newInspection.wbs_id}
            onChange={(e) => setNewInspection({ ...newInspection, wbs_id: e.target.value })}
          >
            <option value="">Select WBS</option>
            {wbsList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <label htmlFor="mapSelect" className="sr-only">Select Map</label>
          <select
            id="mapSelect"
            className="w-full text-black px-4 py-2 rounded"
            value={newInspection.map_id}
            onChange={(e) => setNewInspection({ ...newInspection, map_id: e.target.value })}
          >
            <option value="">Select Map</option>
            {mapList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label htmlFor="lineItemSelect" className="sr-only">Select Line Item</label>
          <select
            id="lineItemSelect"
            className="w-full text-black px-4 py-2 rounded"
            value={newInspection.line_item_id}
            onChange={(e) => setNewInspection({ ...newInspection, line_item_id: e.target.value })}
          >
            <option value="">Select Line Item</option>
            {lineItems.map(li => <option key={li.id} value={li.id}>{li.name}</option>)}
          </select>

          <label>PDF Report *</label>
          <input type="file" required accept="application/pdf" title="Upload a PDF report" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />

          <label htmlFor="photoFiles">Photos (optional)</label>
          <input
            id="photoFiles"
            type="file"
            multiple
            accept="image/*"
            title="Upload photos for the inspection"
            onChange={(e) => setPhotoFiles(e.target.files)}
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setCreating(false); setEditingId(null); }} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-green-600 px-4 py-2 rounded">Save</button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {inspections.map((insp) => (
          <div key={insp.id} className="bg-background-light p-4 rounded border">
            <div className="flex justify-between">
              <div>
                <div className="text-lg font-bold">{insp.name}</div>
                <p className="text-gray-400 text-sm">{insp.description}</p>
                <a href={typeof insp.pdf_url === 'string' && insp.pdf_url.length > 0 ? insp.pdf_url : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex gap-1 mt-1">
                  <FileText className="w-4 h-4" /> View PDF
                </a>
              </div>
              {canEdit && (
                <button onClick={() => handleEdit(insp)} className="bg-blue-600 px-2 py-1 rounded h-fit mt-1" title="Edit Inspection">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {insp.photo_urls && insp.photo_urls.length > 0 && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {insp.photo_urls.map((url, i) => (
                  <img key={i} src={url} alt={`Inspection photo ${i + 1}`} className="rounded shadow-md" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
