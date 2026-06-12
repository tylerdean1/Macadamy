/**
 * Labor Records Management Page
 *
 * This component handles creation and viewing of labor records for a contract.
 * Uses RPC functions for all labor record operations.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, HardHat, Plus, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';
import { useAuthStore } from '@/lib/store';
import { useNavigate, useParams } from 'react-router-dom';

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

type LaborRecordRow = Database['public']['Functions']['filter_labor_records']['Returns'][number];

function createEmptyLaborRecord(lineItemId: string | null): LaborRecordRow {
  return {
    id: crypto.randomUUID(),
    line_item_id: lineItemId,
    worker_count: 1,
    hours_worked: 8,
    work_date: new Date().toISOString().split('T')[0],
    work_type: '',
    notes: '',
    created_at: null,
    updated_at: new Date().toISOString(),
    deleted_at: null
  };
}

function reportLaborRecordsError(
  operation: string,
  error: unknown,
  projectId: string | null,
): string {
  const context = {
    module: 'LaborRecords',
    operation,
    trigger: 'user' as const,
    error,
    ids: {
      projectId,
    },
  };

  logBackendError(context);
  const message = toBackendErrorToastMessage(context);
  toast.error(message);
  return message;
}

export default function LaborRecords() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params; // Get the contract ID from route parameters
  const projectId = typeof id === 'string' && id.trim() !== '' ? id : null;
  const [records, setRecords] = useState<LaborRecordRow[]>([]); // State for storing labor records
  const [loading, setLoading] = useState(true); // Loading state for fetching records
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false); // State to manage log creation
  const [newRecord, setNewRecord] = useState<LaborRecordRow>(() => createEmptyLaborRecord(projectId));
  const user = useAuthStore(state => state.user); // Get the authenticated user

  useEffect(() => {
    setNewRecord(createEmptyLaborRecord(projectId));
  }, [projectId]);

  // Fetch labor records for the current contract when component mounts
  const fetchRecords = useCallback(async () => {
    if (!projectId) {
      setRecords([]);
      setErrorMessage('Project context is missing. Return to the project and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const data = await rpcClient.filter_labor_records({ _filters: { line_item_id: projectId } });
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(reportLaborRecordsError('load labor records', error, projectId));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  // Handle submission of the new labor record form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!user) {
      const error = new Error('User must be authenticated to create a labor record.');
      setErrorMessage(reportLaborRecordsError('create labor record', error, projectId));
      return;
    }

    if (!projectId) {
      setErrorMessage('Project context is missing. Return to the project and try again.');
      return;
    }

    const { worker_count, hours_worked, work_date, work_type, notes } = newRecord;

    try {
      setErrorMessage(null);
      const createdRows = await rpcClient.insert_labor_records({
        _input: {
          line_item_id: projectId,
          worker_count,
          hours_worked,
          work_date,
          work_type,
          notes
        }
      });

      // Use returned record to update UI without a full refetch.
      const created = Array.isArray(createdRows) && createdRows.length > 0
        ? createdRows[0]
        : null;

      if (created) {
        setRecords((prev) => [created, ...prev]);
      } else {
        await fetchRecords();
      }

      setIsCreating(false); // Close the creation form
      setNewRecord(createEmptyLaborRecord(projectId));
    } catch (error) {
      setErrorMessage(reportLaborRecordsError('create labor record', error, projectId));
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

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => { void fetchRecords(); }}
                className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
              >
                Retry
              </button>
            </div>
          </div>
        )}

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
                    value={newRecord.work_type ?? ''}
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
                    value={newRecord.work_date ?? ''}
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
                    value={newRecord.worker_count ?? 0}
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
                    value={newRecord.hours_worked ?? 0}
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
                  value={newRecord.notes ?? ''}
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
          {records.length === 0 && !isCreating && !errorMessage ? (
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
                        {record.work_date ? new Date(record.work_date).toLocaleDateString() : 'N/A'} {/* Display work date */}
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