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
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { FileText, Plus, Pencil } from 'lucide-react';

// Define the structure of an inspection record
interface Inspection {
  id?: string;
  name: string;
  description: string;
  contract_id: string;
  wbs_id: string;
  map_id: string;
  line_item_id: string;
  pdf_url: string;
  photo_urls: string[];
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Generic structure for dropdown options
interface Option {
  id: string;
  name: string;
}

export function Inspections() {
  const user = useAuthStore(state => state.user);

  // State variables
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);

  // Holds form data for creating/editing inspections
  const [newInspection, setNewInspection] = useState<Partial<Inspection>>({
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
  const canEdit = ['admin', 'engineer', 'inspector'].includes(user?.role || '');

  // Initial load
  useEffect(() => {
    loadOptions();
    fetchInspections();
  }, []);

  // Dynamically load WBS after contract is selected
  useEffect(() => {
    if (newInspection.contract_id) fetchWbs(newInspection.contract_id);
  }, [newInspection.contract_id]);

  // Load maps once WBS is selected
  useEffect(() => {
    if (newInspection.wbs_id) fetchMaps(newInspection.wbs_id);
  }, [newInspection.wbs_id]);

  // Load line items when map is selected
  useEffect(() => {
    if (newInspection.map_id) fetchLineItems(newInspection.map_id);
  }, [newInspection.map_id]);

  // Fetch contract list
  async function loadOptions() {
    const { data: contractsData } = await supabase.from('contracts').select('id, name');
    setContracts(contractsData || []);
  }

  // Fetch WBS entries for a contract
  async function fetchWbs(contractId: string) {
    const { data } = await supabase.from('wbs').select('id, name').eq('contract_id', contractId);
    setWbsList(data || []);
  }

  // Fetch maps for a WBS
  async function fetchMaps(wbsId: string) {
    const { data } = await supabase.from('maps').select('id, name').eq('wbs_id', wbsId);
    setMapList(data || []);
  }

  // Fetch line items for a map
  async function fetchLineItems(mapId: string) {
    const { data } = await supabase.from('line_items').select('id, description').eq('map_id', mapId);
    setLineItems(data?.map(l => ({ id: l.id, name: l.description })) || []);
  }

  // Load inspection records
  async function fetchInspections() {
    const { data } = await supabase.from('inspections').select('*').order('created_at', { ascending: false });
    setInspections(data || []);
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

  // Save inspection (create or update)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newInspection.name || !newInspection.contract_id || !pdfFile) return;

    const pdfUrl = await uploadFile(pdfFile, 'inspections');
    if (!pdfUrl) return;

    const photoUrls: string[] = [];
    if (photoFiles) {
      for (const file of Array.from(photoFiles)) {
        const url = await uploadFile(file, 'inspection-photos');
        if (url) photoUrls.push(url);
      }
    }

    const insertData = {
      ...newInspection,
      pdf_url: pdfUrl,
      photo_urls: photoUrls,
      created_by: user.id,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = editingId
      ? await supabase.from('inspections').update(insertData).eq('id', editingId)
      : await supabase.from('inspections').insert(insertData);

    if (error) {
      alert('Error saving inspection');
    } else {
      setCreating(false);
      setEditingId(null);
      setNewInspection({ name: '', description: '', contract_id: '', wbs_id: '', map_id: '', line_item_id: '', photo_urls: [] });
      setPdfFile(null);
      setPhotoFiles(null);
      fetchInspections();
    }
  }

  // Load inspection data into form for editing
  function handleEdit(insp: Inspection) {
    setNewInspection(insp);
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
        <form onSubmit={handleSave} className="space-y-4 bg-background-light p-4 rounded border">
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
                <a href={insp.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline inline-flex gap-1 mt-1">
                  <FileText className="w-4 h-4" /> View PDF
                </a>
              </div>
              {canEdit && (
                <button onClick={() => handleEdit(insp)} className="bg-blue-600 px-2 py-1 rounded h-fit mt-1" title="Edit Inspection">
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            {insp.photo_urls?.length > 0 && (
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
