/**
 * Labor Records Management Page
 * 
 * This component handles creation and viewing of labor records for a contract.
 * Uses RPC functions for all labor record operations.
 * 
 * -- SPECIAL TYPESCRIPT NOTICE --
 * This file contains @ts-ignore comments to suppress TypeScript errors related to
 * direct table access for 'labor_records'. This is necessary because:
 * 1. RPC functions are not available yet for labor records
 * 2. The labor_records table schema is not included in the database.types.ts
 * These suppressions will be removed when proper RPC functions are implemented.
 */
import React, { useCallback, useState, useEffect } from 'react';
import { ArrowLeft, Plus, Users, Clock, Calendar, HardHat, Save } from 'lucide-react';
import { rpcClient } from '@/lib/rpc.client';
import type { LaborRecords } from '@/lib/types';
import { useAuthStore } from '@/lib/store';
import { useNavigate, useParams } from 'react-router-dom';


// Define a runtime type for labor records (until added to database.types.ts)

// Available work types for selection
const WORK_TYPES = [
  'Site Preparation',
  'Excavation',
  'Grading',
  'Paving',
  'Concrete Work',
  'Utility Installation',
  'Drainage',
  'Landscaping',
  'General Labor',
  'Other'
];

export default function LaborRecords() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params; // Get the contract ID from route parameters
  const [records, setRecords] = useState<LaborRecords[]>([]); // State for storing labor records
  const [loading] = useState(true); // Loading state for fetching records
  const [isCreating, setIsCreating] = useState(false); // State to manage log creation
  const [newRecord, setNewRecord] = useState<LaborRecords>({ // Initial state for new record form
    id: crypto.randomUUID(), // Generate a unique ID for the new record
    line_item_id: typeof id === 'string' && id.trim() !== '' ? id : '',
    worker_count: 1, // Default to 1 worker
    hours_worked: 8, // Default to 8 hours worked
    work_date: new Date().toISOString().split('T')[0], // Default to today's date
    work_type: '',
    notes: ''
  });
  const user = useAuthStore(state => state.user); // Get the authenticated user

  // Fetch labor records for the current contract when component mounts
  const fetchRecords = useCallback(async () => {
    if (typeof id !== 'string' || id.trim() === '') {
      setRecords([]);
      return;
    }
    try {
      const data = await rpcClient.getLaborRecords({ line_item_id: id });
      setRecords(data);
    } catch (error) {
      console.error('Error fetching labor records:', error);
      setRecords([]);
    }
  }, [id]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]); // ✅ no ESLint warning now

  // Handle submission of the new labor record form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!user) return; // Ensure user is authenticated

    const { worker_count, hours_worked, work_date, work_type, notes } = newRecord;

    try {
      if (typeof id !== 'string' || id.trim() === '') return;
      await rpcClient.insertLaborRecord({
        line_item_id: id,
        worker_count,
        hours_worked,
        work_date,
        work_type,
        notes
      });

      setIsCreating(false); // Close the creation form
      // Fix: void fetchRecords()
      void fetchRecords(); // Refresh the records list
      // Reset the newRecord state to initial values
      setNewRecord({
        id: crypto.randomUUID(),
        line_item_id: typeof id === 'string' && id.trim() !== '' ? id : '',
        worker_count: 1,
        hours_worked: 8,
        work_date: new Date().toISOString().split('T')[0],
        work_type: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating labor record:', error); // Log any errors
      alert('Error creating labor record'); // Notify the user
    }
  };

  // Loading spinner while records are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with navigation and new record button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${id}`)} // Navigate back to the project details
              className="p-2 text-gray-400 hover:text-white hover:bg-background-lighter rounded-lg transition-colors"
              title="Go back to contract details"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Labor Records</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)} // Open the form for creating a new labor record
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Record
          </button>
        </div>

        {/* New labor record creation form */}
        {isCreating && (
          <div className="mb-8 bg-background-light rounded-lg border border-background-lighter p-6">
            <form onSubmit={e => { void handleSubmit(e); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Work Type
                  </label>
                  <select
                    value={newRecord.work_type}
                    onChange={(e) => setNewRecord({ ...newRecord, work_type: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                    aria-label="Work Type"
                  >
                    <option value="">Select Work Type</option>
                    {WORK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Work Date
                  </label>
                  <input
                    type="date"
                    value={newRecord.work_date}
                    onChange={(e) => setNewRecord({ ...newRecord, work_date: e.target.value })}
                    placeholder="Select work date"
                    title="Work Date"
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Number of Workers
                  </label>
                  <input
                    type="number"
                    value={newRecord.worker_count}
                    onChange={(e) => setNewRecord({ ...newRecord, worker_count: Number(e.target.value) })}
                    min="1"
                    placeholder="Enter number of workers"
                    title="Number of Workers"
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    value={newRecord.hours_worked}
                    onChange={(e) => setNewRecord({ ...newRecord, hours_worked: Number(e.target.value) })}
                    min="0"
                    step="0.5"
                    placeholder="Enter hours worked"
                    title="Hours Worked"
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Notes
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  rows={3}
                  placeholder="Enter notes here"
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)} // Close the form without saving
                  className="px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" // Submit the form to create a new labor record
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Display labor records */}
        <div className="space-y-4">
          {records.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <HardHat className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Labor Records</h3>
              <p className="text-gray-400 mb-6">Start tracking labor by creating a new record.</p>
              <button
                onClick={() => setIsCreating(true)} // Open the new record form
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Record
              </button>
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${id}/labor/${record.id}`)} // Navigate to labor record details
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{record.work_type}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(record.work_date).toLocaleDateString()} {/* Display work date */}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        {record.worker_count} workers {/* Display number of workers */}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        {record.hours_worked} hours {/* Display hours worked */}
                      </div>
                    </div>
                  </div>
                </div>
                {record.notes && ( // Show notes if available
                  <div className="border-t border-background-lighter pt-4 mt-4">
                    <p className="text-gray-300">{record.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
