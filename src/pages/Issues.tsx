import React, { useState, useEffect, useCallback } from 'react'; // Import React and hooks
import { Plus, Save, Pencil, Download } from 'lucide-react'; // Import icons for actions
import { supabase } from '../lib/supabase'; // Import Supabase client
import { useAuthStore } from '../lib/store'; // Import the auth store for user state management
import useRouteParamsAndNavigation from '../hooks/useRouteParamsAndNavigation'; // Custom hook for route parameters
import jsPDF from 'jspdf'; // Import jsPDF for PDF generation

/** 
 * Interface representing an issue in the system.
 */
interface Issue {
  id?: string; // Optional ID of the issue
  contract_id: string; // ID of the associated contract
  title: string; // Title of the issue
  description: string; // Description of the issue
  priority: string; // Priority level of the issue
  status: string; // Current status of the issue
  assigned_to?: string; // Optional ID of the user the issue is assigned to
  due_date?: string; // Optional due date for the issue
  resolution?: string; // Optional resolution of the issue
  wbs_id?: string; // Optional ID of the WBS associated with the issue
  map_id?: string; // Optional ID of the map associated with the issue
  line_item_id?: string; // Optional ID of the line item associated with the issue
  equipment_id?: string; // Optional ID of the equipment associated with the issue
  photo_urls: string[]; // Array of URLs for photos related to the issue
  updated_by?: string; // Optional ID of the user who last updated the issue
  updated_at?: string; // Optional timestamp of when the issue was last updated
  profiles?: {
    full_name: string; // Full name of the user associated with the issue
    email: string; // Email of the user associated with the issue
  };
}

/** 
 * Interface representing an option for selection.
 */
interface Option {
  id: string; // ID of the option
  name: string; // Name of the option
}

// Define priority and status constants
const PRIORITIES = ['Low', 'Medium', 'High'] as const; // Available priorities
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
  const { id: contract_id } = useRouteParamsAndNavigation().params; // Get contract ID from route parameters
  const user = useAuthStore((state) => state.user); // Get current user from auth store
  const canEdit = ['admin', 'engineer', 'inspector'].includes(user?.role || ''); // Determine if the user can edit issues

  const [issues, setIssues] = useState<Issue[]>([]); // State for fetched issues
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]); // State for filtered issues
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
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null); // State for uploaded files
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const [assignees, setAssignees] = useState<Option[]>([]); // State for assignee options
  const [wbsList, setWbsList] = useState<Option[]>([]); // State for WBS options
  const [mapList, setMapList] = useState<Option[]>([]); // State for map options
  const [lineItems, setLineItems] = useState<Option[]>([]); // State for line item options
  const [equipmentList, setEquipmentList] = useState<Option[]>([]); // State for equipment options

  // Fetch issues from Supabase
  const fetchIssues = useCallback(async () => {
    const { data } = await supabase
      .from('issues') // Get issues from 'issues' table
      .select('*, profiles:profiles!assigned_to(full_name,email)') // Join to get assignee profiles
      .eq('contract_id', contract_id) // Filter by contract ID
      .order('created_at', { ascending: false }); // Order by creation date

    setIssues(data || []); // Set issues state
    setFilteredIssues(data || []); // Set filtered issues state
  }, [contract_id]); // Dependencies

  // Fetch issues and assignees on component mount
  useEffect(() => {
    fetchIssues(); // Fetch issues
    fetchAssignees(); // Fetch assignees
  }, [fetchIssues]);

  // Fetch WBS and Equipment when contract ID changes
  useEffect(() => {
    if (form.contract_id) {
      fetchWBS(form.contract_id); // Fetch WBS options
      fetchEquipment(form.contract_id); // Fetch equipment options
    }
  }, [form.contract_id]); // Dependencies

  // Fetch maps based on WBS ID
  useEffect(() => {
    if (form.wbs_id) fetchMaps(form.wbs_id); // Fetch maps
  }, [form.wbs_id]); // Dependencies

  // Fetch line items based on map ID
  useEffect(() => {
    if (form.map_id) fetchLineItems(form.map_id); // Fetch line items
  }, [form.map_id]); // Dependencies

  // Fetch assignees from Supabase
  const fetchAssignees = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name').order('full_name'); // Get profiles
    setAssignees((data || []).map(({ id, full_name }) => ({ id, name: full_name }))); // Set state
  };

  // Fetch WBS from Supabase
  const fetchWBS = async (contractId: string) => {
    const { data } = await supabase.from('wbs').select('id, name').eq('contract_id', contractId); // Fetch WBS
    setWbsList(data || []); // Update WBS list
  };

  // Fetch maps from Supabase
  const fetchMaps = async (wbsId: string) => {
    const { data } = await supabase.from('maps').select('id, name').eq('wbs_id', wbsId); // Fetch maps
    setMapList(data || []); // Update map list
  };

  // Fetch line items from Supabase
  const fetchLineItems = async (mapId: string) => {
    const { data } = await supabase.from('line_items').select('id, description').eq('map_id', mapId); // Fetch line items
    setLineItems((data || []).map(li => ({ id: li.id, name: li.description }))); // Update line item list
  };

  // Fetch equipment from Supabase
  const fetchEquipment = async (contractId: string) => {
    const { data } = await supabase.from('equipment').select('id, name').eq('contract_id', contractId); // Fetch equipment
    setEquipmentList(data || []); // Update equipment list
  };

  // Upload files to Supabase storage and return their public URLs
  const uploadFiles = async (files: FileList | null): Promise<string[]> => {
    if (!files) return []; // Return empty array if no files
    const urls: string[] = []; // Array for URLs

    // Loop through uploaded files
    for (const file of Array.from(files)) {
      const path = `issues/${crypto.randomUUID()}-${file.name}`; // Create unique file path
      const { error } = await supabase.storage.from('documents').upload(path, file); // Upload file
      if (!error) {
        const { data } = supabase.storage.from('documents').getPublicUrl(path); // Get public URL
        if (data?.publicUrl) urls.push(data.publicUrl); // Add URL to list
      }
    }
    return urls; // Return list of URLs
  };

  // Handle save action for form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!user) return; // Ensure user is authenticated

    const uploaded = await uploadFiles(photoFiles); // Upload any photos
    const updated = {
      ...form, // Current form data
      updated_by: user.id, // Set updater
      updated_at: new Date().toISOString(), // Set update timestamp
      photo_urls: [...(form.photo_urls || []), ...uploaded] // Append uploaded URLs
    };

    // Insert or update issue in database
    const { error } = editingId
      ? await supabase.from('issues').update(updated).eq('id', editingId)
      : await supabase.from('issues').insert({ ...updated, created_by: user.id });

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
      setPhotoFiles(null); // Clear photo files
      fetchIssues(); // Refresh issues list
    } else {
      alert('Error saving issue'); // Notify user of save error
    }
  };

  // Start editing an existing issue
  const startEdit = (issue: Issue) => {
    setEditingId(issue.id!); // Set editing ID
    setForm(issue); // Populate form with issue data
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
            <button onClick={() => setEditingId('new')} className="bg-primary px-4 py-2 rounded flex items-center gap-2">
              <Plus className="w-4 h-4" /> New {/* Button to add new issue */}
            </button>
          )}
        </div>
      </div>

      {(editingId || editingId === 'new') && (
        <form onSubmit={handleSave} className="bg-background-light p-4 rounded space-y-4">
          <input className="w-full px-4 py-2 text-black rounded" placeholder="Title"
            value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea className="w-full px-4 py-2 text-black rounded" placeholder="Description"
            value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} required />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label htmlFor="prioritySelect" className="sr-only">Priority</label>
            <select id="prioritySelect" className="text-black px-2 py-1 rounded"
              value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
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
              value={form.assigned_to || ''} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
              <option value="">Unassigned</option>
              {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <label htmlFor="photoUpload" className="sr-only">Upload Photos</label>
            <input id="photoUpload" type="file" multiple accept="image/*"
              onChange={(e) => setPhotoFiles(e.target.files)} className="text-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label htmlFor="wbsSelect" className="sr-only">Work Breakdown Structure</label>
            <select id="wbsSelect" className="text-black px-2 py-1 rounded"
              value={form.wbs_id || ''} onChange={e => setForm({ ...form, wbs_id: e.target.value || undefined })}>
              <option value="">No WBS</option>
              {wbsList.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <label htmlFor="mapSelect" className="sr-only">Map</label>
            <select id="mapSelect" className="text-black px-2 py-1 rounded"
              value={form.map_id || ''} onChange={e => setForm({ ...form, map_id: e.target.value || undefined })}>
              <option value="">No Map</option>
              {mapList.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <label htmlFor="lineItemSelect" className="sr-only">Line Item</label>
            <select id="lineItemSelect" className="text-black px-2 py-1 rounded"
              value={form.line_item_id || ''} onChange={e => setForm({ ...form, line_item_id: e.target.value || undefined })}>
              <option value="">No Line Item</option>
              {lineItems.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
            <label htmlFor="equipmentSelect" className="sr-only">Equipment</label>
            <select id="equipmentSelect" className="text-black px-2 py-1 rounded"
              value={form.equipment_id || ''} onChange={e => setForm({ ...form, equipment_id: e.target.value || undefined })}>
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
                  Due: {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : 'N/A'}
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
