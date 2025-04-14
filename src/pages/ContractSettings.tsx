import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, PlusCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import WbsForm from '@/components/contract/WbsForm';
import { MapsForm } from '@/components/contract/MapsForm';
import { LineItemModal } from '@/components/contract/LineItemModal';
import { toast } from 'sonner';

// Available contract statuses for selection
const STATUS_OPTIONS = ['Draft', 'Active', 'On Hold', 'Final Review', 'Closed'];

export function ContractSettings() {
  const { id } = useParams(); // Retrieve the contract ID from the URL parameters
  const navigate = useNavigate(); // Navigate between routes
  const [contract, setContract] = useState<Database['public']['Tables']['contracts']['Row'] | null>(null); // State for contract data
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [saving, setSaving] = useState(false); // Saving state for contract updates

  // States for WBS sections, maps, line items, and templates
  const [wbsSections, setWbsSections] = useState<{ wbs_number: string; description: string }[]>([]);
  const [maps, setMaps] = useState<{ id: string; map_number: string; location_description: string }[]>([]);
  const [mapRefresh, setMapRefresh] = useState(false); // Trigger refresh of maps

  const [lineItems, setLineItems] = useState<{ id: string; line_code: string; description: string; quantity: number; unit_measure: string; unit_price: number }[]>([]);
  const [showLineItemModal, setShowLineItemModal] = useState(false); // Modal state for line item addition
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string }[]>([]); // Templates for line items
  const unitOptions = ['kg', 'm', 'pcs', 'liters']; // Unit options for line items

  const [openSection, setOpenSection] = useState<string>('info'); // State to manage which section is currently open

  // Fetch the contract information
  const fetchContract = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase.from('contracts').select('*').eq('id', id).maybeSingle();
    if (error || !data) return toast.error('Contract not found');
    setContract(data);
    setLoading(false);
  }, [id]);

  // Fetch the WBS sections associated with the contract
  const fetchWbsSections = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('wbs').select('wbs_number, description').eq('contract_id', id).order('wbs_number');
    if (data) setWbsSections(data);
  }, [id]);

  // Fetch the maps associated with the contract
  const fetchMaps = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('maps').select('*').eq('contract_id', id);
    if (data) setMaps(data);
  }, [id]);

  // Fetch line items linked to the contract
  const fetchLineItems = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('line_items').select('*').eq('contract_id', id);
    if (data) setLineItems(data);
  }, [id]);

  // Fetch line item templates for selection when adding new line items
  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase.from('line_item_templates').select('*');
    if (data) setTemplates(data);
  }, []);

  // Fetch all necessary data when the component mounts or when dependencies change
  useEffect(() => {
    fetchContract();
    fetchWbsSections();
    fetchMaps();
    fetchLineItems();
    fetchTemplates();
  }, [fetchContract, fetchWbsSections, fetchMaps, fetchLineItems, fetchTemplates, id, mapRefresh]);

  // Handle saving contract updates
  const handleSave = async () => {
    if (!contract) return;
    setSaving(true);
    const { error } = await supabase.from('contracts').update({
      title: contract.title,
      description: contract.description,
      location: contract.location,
      start_date: contract.start_date,
      end_date: contract.end_date,
      status: contract.status,
    }).eq('id', contract.id);
    if (error) toast.error('Error saving contract');
    else toast.success('Contract updated!');
    setSaving(false);
  };

  // Save WBS sections to the database
  const saveWbsSections = async () => {
    if (!id) return;
    await supabase.from('wbs').delete().eq('contract_id', id); // Delete existing WBS entries for the contract
    const inserts = wbsSections.map(s => ({ ...s, contract_id: id }));
    const { error } = await supabase.from('wbs').insert(inserts);
    if (error) toast.error('Failed to save WBS');
    else toast.success('WBS saved!');
  };

  // Delete a specific map by ID
  const deleteMap = async (mapId: string) => {
    const { error } = await supabase.from('maps').delete().eq('id', mapId);
    if (!error) {
      toast.success('Map deleted');
      setMapRefresh(!mapRefresh); // Trigger refresh to update map list
    }
  };

  // Delete a specific line item by ID
  const deleteLineItem = async (itemId: string) => {
    const { error } = await supabase.from('line_items').delete().eq('id', itemId);
    if (!error) {
      toast.success('Line item deleted');
      fetchLineItems(); // Refresh line items after deletion
    }
  };

  // Handle saving a new line item
  const handleLineItemSave = async (data: { line_code: string; description: string; quantity: number; unit_measure: string; unit_price: number }) => {
    const { error } = await supabase.from('line_items').insert([{ ...data, contract_id: id }]);
    if (!error) {
      toast.success('Line item added!');
      fetchLineItems(); // Refresh line items after adding a new one
      setShowLineItemModal(false); // Close the modal
    }
  };

  // Calculate total budget from line items
  const totalBudget = lineItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

  // Renderable Section Toggle Component
  const SectionToggle = ({ id, title }: { id: string; title: string }) => (
    <button
      type="button"
      className="w-full flex justify-between items-center bg-background-light px-4 py-2 text-left border-b border-background-lighter hover:bg-background"
      onClick={() => setOpenSection(prev => (prev === id ? '' : id))} // Toggle open/close section
    >
      <span className="text-lg font-semibold">{title}</span>
      {openSection === id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  );

  // Display a loading indication while contract data is being fetched
  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white rounded">
          <Save className="w-4 h-4 inline mr-1" /> {saving ? 'Saving...' : 'Save Contract'} {/* Conditional saving state */}
        </button>
      </div>

      <div className="rounded overflow-hidden border border-background-lighter">
        {/* Contract Info Section */}
        <SectionToggle id="info" title="Contract Info" />
        {openSection === 'info' && contract && (
          <div className="p-4 space-y-4">
            <div className="text-green-400 font-semibold">Total Budget: ${totalBudget.toLocaleString()}</div>
            <input
              placeholder="Contract Title"
              value={contract.title || ''}
              onChange={e => setContract(c => c ? { ...c, title: e.target.value } : c)}
              className="w-full p-2 bg-background border rounded"
            />
            <textarea
              placeholder="Contract Description"
              value={contract.description || ''}
              onChange={e => setContract(c => c ? { ...c, description: e.target.value } : c)}
              className="w-full p-2 bg-background border rounded"
            />
            <input
              placeholder="Location"
              value={contract.location || ''}
              onChange={e => setContract(c => c ? { ...c, location: e.target.value } : c)}
              className="w-full p-2 bg-background border rounded"
            />
            <div className="flex gap-4">
              <input
                type="date"
                aria-label="Start Date"
                title="Start Date"
                value={contract.start_date || ''}
                onChange={e => setContract(c => c ? { ...c, start_date: e.target.value } : c)}
                className="w-full p-2 bg-background border rounded"
              />
              <input
                type="date"
                aria-label="End Date"
                title="End Date"
                value={contract.end_date || ''}
                onChange={e => setContract(c => c ? { ...c, end_date: e.target.value } : c)}
                className="w-full p-2 bg-background border rounded"
              />
            </div>
            <select
              aria-label="Contract Status"
              value={contract.status || ''}
              onChange={e => setContract(c => c ? { ...c, status: e.target.value as Database['public']['Tables']['contracts']['Row']['status'] } : c)}
              className="w-full p-2 bg-background border rounded"
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* WBS Sections Toggle */}
        <SectionToggle id="wbs" title="WBS Sections" />
        {openSection === 'wbs' && (
          <div className="p-4">
            <div className="flex justify-between mb-2">
              <span className="text-green-400">Total: {wbsSections.length} sections</span>
              <button onClick={saveWbsSections} className="text-sm bg-primary px-3 py-1 rounded">Save WBS</button>
            </div>
            <WbsForm sections={wbsSections} onChange={setWbsSections} />
          </div>
        )}

        {/* Maps Toggle */}
        <SectionToggle id="maps" title="Maps" />
        {openSection === 'maps' && (
          <div className="p-4 space-y-3">
            <div className="text-green-400">Total: {maps.length} map(s)</div>
            {maps.map(map => (
              <div key={map.id} className="flex justify-between items-center border-b border-gray-700 py-2">
                <span>{map.map_number} – {map.location_description}</span>
                <button onClick={() => deleteMap(map.id)} className="text-red-500 hover:text-white" title="Delete Map">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <MapsForm contractId={id!} wbsId={wbsSections[0]?.wbs_number} onMapSaved={() => setMapRefresh(!mapRefresh)} />
          </div>
        )}

        {/* Line Items Toggle */}
        <SectionToggle id="lineitems" title="Line Items" />
        {openSection === 'lineitems' && (
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-400">Total: {lineItems.length} items</span>
              <button onClick={() => setShowLineItemModal(true)} className="text-sm bg-primary px-3 py-1 rounded flex items-center gap-1">
                <PlusCircle className="w-4 h-4" /> Add Line Item
              </button>
            </div>
            {lineItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b border-gray-700 py-2">
                <span>{item.line_code} – {item.description} – {item.quantity} {item.unit_measure}</span>
                <button onClick={() => deleteLineItem(item.id)} className="text-red-500 hover:text-white" title="Delete Line Item">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal for adding line items */}
        {showLineItemModal && (
          <LineItemModal
            open={showLineItemModal}
            onClose={() => setShowLineItemModal(false)}
            templates={templates.map(template => ({
              ...template,
              title: template.name,
              unit_measure: '',
              formula: '',
              variables: []
            }))}
            unitOptions={unitOptions.map(option => ({ label: option, value: option }))}
            onSave={handleLineItemSave} // Function to call when saving the line item
          />
        )}
      </div>
    </div>
  );
}