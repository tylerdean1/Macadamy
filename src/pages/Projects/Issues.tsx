import React, { useState, useEffect, useCallback } from 'react'; // Import React and hooks
import { Plus, Save, Pencil, Download } from 'lucide-react'; // Import icons for actions
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { useAuthStore } from '@/lib/store'; // Import the auth store for user state management
import { useParams } from 'react-router-dom'; // Import React Router hooks
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation
import type { Database } from '@/lib/database.types';
import AttachmentHandler from '@/components/ui/attachment-handler';

type Issue = Database['public']['Tables']['issues']['Row'];
type IssueWithProfile = Issue & { profiles: { full_name: string; email: string } | null };
type Attachment = Parameters<typeof AttachmentHandler>[0]['attachments'][number];

/** 
 * Interface representing an option for selection.
 */
interface Option {
  id: string; // ID of the option
  name: string; // Name of the option
}

// Define priority and status constants
const PRIORITIES: Database['public']['Enums']['priority'][] = ['Low', 'Medium', 'High', 'Note']; // Available priorities
const STATUSES = ['Open', 'In Progress', 'Resolved'] as const; // Available statuses

// Function to get CSS color class based on priority
const getPriorityColor = (priority: string) =>
  priority === 'High' ? 'text-red-500'
    : priority === 'Medium' ? 'text-yellow-500'
      : 'text-green-500';

// Function to get CSS color class based on status
const getStatusColor = (status: string) =>
  status === 'Open' ? 'text-blue-500'
    : status === 'In Progress' ? 'text-yellow-500'
      : 'text-green-500';

// Issues component for managing and displaying issues
export default function Issues() {
  const { id: contract_id } = useParams(); // Get contract ID from route parameters
  const user = useAuthStore((state) => state.user); // Get current user from auth store
  const canEdit = typeof user?.role === 'string' && ['admin', 'engineer', 'inspector'].includes(user.role); // Determine if the user can edit issues

  const [issues, setIssues] = useState<IssueWithProfile[]>([]); // State for fetched issues
  const [filteredIssues, setFilteredIssues] = useState<IssueWithProfile[]>([]); // State for filtered issues
  const [editingId, setEditingId] = useState<string | null>(null); // State for the currently editing issue ID
  const [form, setForm] = useState<Partial<Issue>>({ // State for the form data
    contract_id,
    title: '', // Initial title
    description: '', // Initial description
    priority: 'Medium', // Default priority
    status: 'Open', // Default status
    due_date: new Date().toISOString().split('T')[0], // Set initial due date to today
    photo_urls: [] // Array for photo URLs
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]); // Attachment state
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const [assignees, setAssignees] = useState<Option[]>([]); // State for assignee options
  const [wbsList, setWbsList] = useState<Option[]>([]); // State for WBS options
  const [mapList, setMapList] = useState<Option[]>([]); // State for map options
  const [lineItems, setLineItems] = useState<Option[]>([]); // State for line item options
  const [equipmentList, setEquipmentList] = useState<Option[]>([]); // State for equipment options

  // Fetch issues from Supabase
  const fetchIssues = useCallback(async () => {
    const { data } = await supabase
      .from('issues')
      .select('*, profiles:profiles!assigned_to(full_name,email)')
      .eq('contract_id', contract_id ?? '')
      .order('created_at', { ascending: false })
      .returns<IssueWithProfile[]>();

    if (Array.isArray(data)) {
      setIssues(data);
      setFilteredIssues(data);
    } else {
      setIssues([]);
      setFilteredIssues([]);
    }
  }, [contract_id]); // Dependencies

  // Fetch issues and assignees on component mount
  useEffect(() => {
    void fetchIssues(); // Fetch issues
    void fetchAssignees(); // Fetch assignees
  }, [fetchIssues]);

  // Fetch WBS and Equipment when contract ID changes
  useEffect(() => {
    if (typeof form.contract_id === 'string' && form.contract_id.length > 0) {
      void fetchWBS(form.contract_id); // Fetch WBS options
      void fetchEquipment(form.contract_id); // Fetch equipment options
    }
  }, [form.contract_id]); // Dependencies

  // Fetch maps based on WBS ID
  useEffect(() => {
    if (typeof form.wbs_id === 'string' && form.wbs_id.length > 0) void fetchMaps(form.wbs_id); // Fetch maps
  }, [form.wbs_id]); // Dependencies

  // Fetch line items based on map ID
  useEffect(() => {
    if (typeof form.map_id === 'string' && form.map_id.length > 0) void fetchLineItems(form.map_id); // Fetch line items
  }, [form.map_id]); // Dependencies

  // Fetch assignees from Supabase using RPC
  const fetchAssignees = async () => {
    const { data, error } = await supabase
      .rpc('get_profiles_by_organization');

    if (error) {
      console.error('Error fetching assignees:', error);
      return;
    }

    setAssignees(Array.isArray(data) ? data.map((profile) => ({
      id: profile.id,
      name: profile.full_name, // <-- Mapped full_name to name
    })) : []);
  };

  // Fetch WBS from Supabase using RPC
  const fetchWBS = async (contractId: string) => {
    const { data, error } = await supabase
      .rpc('get_wbs_with_wkt', { contract_id_param: contractId });

    if (error) {
      console.error('Error fetching WBS:', error);
      return;
    }

    if (Array.isArray(data)) {
      setWbsList(data.map((wbs) => ({
        id: wbs.id,
        name: wbs.description || 'Unnamed WBS',
      })));
    } else {
      setWbsList([]);
    }
  };

  // Fetch Maps from Supabase using RPC
  const fetchMaps = async (wbsId: string) => {
    // Since there's no RPC specifically for filtering by wbs_id, 
    // we'll use the contract_id RPC and filter client-side
    const { data, error } = await supabase
      .from('maps')
      .select('id, map_number')
      .eq('wbs_id', wbsId);

    if (error) {
      console.error('Error fetching maps:', error);
      return;
    }

    setMapList(Array.isArray(data) ? data.map((map) => ({
      id: map.id,
      name: map.map_number, // <-- map map_number to name
    })) : []);
  };

  // Fetch Line Items from Supabase using RPC where possible
  const fetchLineItems = async (mapId: string) => {
    // Since get_line_items_with_wkt RPC doesn't support filtering by map_id,
    // we need to use direct table access for this specific case
    const { data, error } = await supabase
      .from('line_items')
      .select('id, description')
      .eq('map_id', mapId);

    if (error) {
      console.error('Error fetching line items:', error);
      return;
    }

    setLineItems(Array.isArray(data) ? data.map((li) => ({
      id: li.id,
      name: li.description || 'Unnamed Line Item', // <-- map description to name
    })) : []);
  };

  // Update fetchEquipment to actually use the contractId parameter with correct RPC flow
  const fetchEquipment = async (contractId: string) => {
    try {
      // Try to use RPC first
      const { data, error } = await supabase
        .rpc('get_equipment_by_organization');

      if (error) {
        console.error('Error fetching equipment via RPC:', error);
        throw error;
      }

      // Using the RPC data
      setEquipmentList(Array.isArray(data) ? data.map((eq) => ({
        id: eq.id,
        name: eq.name,
      })) : []);
    } catch {
      // Fallback to direct query if RPC fails
      console.log(`Falling back to direct query with contract_id: ${contractId}`);
      const { data, error: directError } = await supabase
        .from('equipment')
        .select('id, name')
        .eq('contract_id', contractId);

      if (directError) {
        console.error('Error in fallback equipment fetch:', directError);
        return;
      }

      setEquipmentList(Array.isArray(data) ? data.map((eq) => ({
        id: eq.id,
        name: eq.name,
      })) : []);
    }
  };

  // Handle save action for form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!user) return; // Ensure user is authenticated
    const updated = {
      assigned_to: form.assigned_to === '' ? null : form.assigned_to ?? null,
      contract_id: form.contract_id === '' ? null : form.contract_id ?? null,
      title: form.title ?? '',
      description: form.description ?? '',
      priority: (form.priority as Database['public']['Enums']['priority']) ?? 'Medium',
      status: form.status ?? 'Open',
      due_date: form.due_date === '' ? null : form.due_date ?? null,
      wbs_id: form.wbs_id === '' ? null : form.wbs_id ?? null,
      map_id: form.map_id === '' ? null : form.map_id ?? null,
      line_item_id: form.line_item_id === '' ? null : form.line_item_id ?? null,
      equipment_id: form.equipment_id === '' ? null : form.equipment_id ?? null,
      photo_urls: attachments.map(a => a.url),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Insert or update issue in database
    if (typeof editingId === 'string' && editingId.length > 0) {
      const { error } = await supabase.from('issues').update(updated).eq('id', editingId);
      if (!error) {
        setEditingId(null); // Clear editing ID
        setAttachments([]); // Clear attachments
        void fetchIssues(); // Refresh issues list
      } else {
        alert('Error saving issue'); // Notify user of save error
      }
    } else {
      const insertData = {
        ...updated,
        created_by: user.id,
      };
      const { error } = await supabase.from('issues').insert(insertData);
      if (!error) {
        // Reset form after successful save
        setForm({
          contract_id,
          title: '',
          description: '',
          priority: 'Medium',
          status: 'Open',
          due_date: new Date().toISOString().split('T')[0], // Set due date to today
          photo_urls: []
        });
        setEditingId(null); // Clear editing ID
        setAttachments([]); // Clear attachments
        void fetchIssues(); // Refresh issues list
      } else {
        alert('Error saving issue'); // Notify user of save error
      }
    }
  };

  // Start editing an existing issue
  const startEdit = (issue: IssueWithProfile) => {
    setEditingId(issue.id!); // Set editing ID
    setForm(issue); // Populate form with issue data
    setAttachments(
      (issue.photo_urls ?? []).map(url => ({
        name: url.split('/').pop() ?? 'file',
        url,
        type: '',
        size: 0,
      }))
    );
  };

  // Handle searching for issues
  const handleSearch = (term: string) => {
    setSearchTerm(term); // Update search term
    const lower = term.toLowerCase();
    setFilteredIssues(issues.filter(issue =>
      issue.title.toLowerCase().includes(lower) || // Filter by title
      issue.description.toLowerCase().includes(lower) // Filter by description
    ));
  };

  // Export filtered issues to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    filteredIssues.forEach((issue, i) => {
      doc.text(`${i + 1}. ${issue.title} [${issue.status}] - ${issue.priority}`, 10, 10 + i * 10);
    });
    doc.save('issues.pdf'); // Save PDF
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Issues</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)} // Update search on input change
            className="text-black rounded px-2 py-1"
            placeholder="Search..." // Search placeholder
          />
          <button onClick={exportPDF} className="bg-blue-700 px-3 py-2 rounded flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF {/* Button to export issues as PDF */}
          </button>
          {canEdit && (
            <button
              onClick={() => {
                setEditingId('new');
                setForm({
                  contract_id,
                  title: '',
                  description: '',
                  priority: 'Medium',
                  status: 'Open',
                  due_date: new Date().toISOString().split('T')[0],
                  photo_urls: [],
                });
                setAttachments([]);
              }}
              className="bg-primary px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New {/* Button to add new issue */}
            </button>
          )}
        </div>
      </div>

      {(typeof editingId === 'string' && (editingId.length > 0 || editingId === 'new')) && (
        <form onSubmit={e => { void handleSave(e); }} className="bg-background-light p-4 rounded space-y-4">
          <input className="w-full px-4 py-2 text-black rounded" placeholder="Title"
            value={typeof form.title === 'string' ? form.title : ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea className="w-full px-4 py-2 text-black rounded" placeholder="Description"
            value={typeof form.description === 'string' ? form.description : ''} onChange={e => setForm({ ...form, description: e.target.value })} required />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label htmlFor="prioritySelect" className="sr-only">Priority</label>
            <select id="prioritySelect" className="text-black px-2 py-1 rounded"
              value={form.priority || ''} onChange={e => setForm({ ...form, priority: e.target.value as Database['public']['Enums']['priority'] })}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label htmlFor="statusSelect" className="sr-only">Status</label>
            <select id="statusSelect" className="text-black px-2 py-1 rounded"
              value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label htmlFor="dueDateInput" className="sr-only">Due Date</label>
            <input id="dueDateInput" type="date" className="text-black px-2 py-1 rounded"
              value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label htmlFor="assignedToSelect" className="sr-only">Assigned To</label>
            <select id="assignedToSelect" className="text-black px-2 py-1 rounded"
              value={typeof form.assigned_to === 'string' ? form.assigned_to : ''} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <AttachmentHandler
            parentId={contract_id ?? ''}
            storageBucket="documents"
            folderPath="issues"
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            canEdit={canEdit}
            label="Photos"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label htmlFor="wbsSelect" className="sr-only">Work Breakdown Structure</label>
            <select id="wbsSelect" className="text-black px-2 py-1 rounded"
              value={typeof form.wbs_id === 'string' ? form.wbs_id : ''} onChange={e => setForm({ ...form, wbs_id: e.target.value || undefined })}>
              <option value="">No WBS</option>
              {wbsList.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <label htmlFor="mapSelect" className="sr-only">Map</label>
            <select id="mapSelect" className="text-black px-2 py-1 rounded"
              value={typeof form.map_id === 'string' ? form.map_id : ''} onChange={e => setForm({ ...form, map_id: e.target.value || undefined })}>
              <option value="">No Map</option>
              {mapList.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <label htmlFor="lineItemSelect" className="sr-only">Line Item</label>
            <select id="lineItemSelect" className="text-black px-2 py-1 rounded"
              value={typeof form.line_item_id === 'string' ? form.line_item_id : ''} onChange={e => setForm({ ...form, line_item_id: e.target.value || undefined })}>
              <option value="">No Line Item</option>
              {lineItems.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <label htmlFor="equipmentSelect" className="sr-only">Equipment</label>
            <select id="equipmentSelect" className="text-black px-2 py-1 rounded"
              value={typeof form.equipment_id === 'string' ? form.equipment_id : ''} onChange={e => setForm({ ...form, equipment_id: e.target.value || undefined })}>
              <option value="">No Equipment</option>
              {equipmentList.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>

          <button type="submit" className="bg-green-600 px-4 py-2 rounded flex items-center gap-2">
            <Save className="w-4 h-4" /> Save {/* Button to save the line item */}
          </button>
        </form>
      )}

      {/* Render the list of issues if available */}
      {filteredIssues.map(issue => (
        <div key={issue.id} className="bg-background-light rounded p-4 border">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-bold">{issue.title}</h3>
              <p className="text-sm text-gray-400">{issue.description}</p>
              <div className="text-sm mt-1">
                <span className={getPriorityColor(issue.priority)}>Priority: {issue.priority}</span>{' | '}
                <span className={getStatusColor(issue.status)}>Status: {issue.status}</span>{' | '}
                Due: {typeof issue.due_date === 'string' && issue.due_date.length > 0 ? new Date(issue.due_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            {canEdit && (
              <button onClick={() => startEdit(issue)} title="Edit Issue" className="bg-blue-600 px-2 py-1 rounded h-fit mt-1">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
          {issue.photo_urls?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {issue.photo_urls.map((url, i) => (
                <img key={i} src={url} alt={`issue photo ${i}`} className="rounded shadow" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
