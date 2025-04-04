import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Clock, Calendar, HardHat, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface LaborRecord {
  id?: string;
  line_item_id: string;
  worker_count: number;
  hours_worked: number;
  work_date: string;
  work_type: string;
  notes: string;
}

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

export function LaborRecords() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState<LaborRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newRecord, setNewRecord] = useState<LaborRecord>({
    line_item_id: id || '',
    worker_count: 1,
    hours_worked: 8,
    work_date: new Date().toISOString().split('T')[0],
    work_type: '',
    notes: ''
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchRecords();
  }, [id]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('labor_records')
        .select('*')
        .eq('line_item_id', id)
        .order('work_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching labor records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('labor_records')
        .insert({
          ...newRecord,
          created_by: user.id
        });

      if (error) throw error;

      setIsCreating(false);
      fetchRecords();
      setNewRecord({
        line_item_id: id || '',
        worker_count: 1,
        hours_worked: 8,
        work_date: new Date().toISOString().split('T')[0],
        work_type: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating labor record:', error);
      alert('Error creating labor record');
    }
  };

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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/contracts/${id}`)}
              className="p-2 text-gray-400 hover:text-white hover:bg-background-lighter rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Labor Records</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Record
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-background-light rounded-lg border border-background-lighter p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Record
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {records.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <HardHat className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Labor Records</h3>
              <p className="text-gray-400 mb-6">Start tracking labor by creating a new record.</p>
              <button
                onClick={() => setIsCreating(true)}
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
                onClick={() => navigate(`/contracts/${id}/labor/${record.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{record.work_type}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(record.work_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        {record.worker_count} workers
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        {record.hours_worked} hours
                      </div>
                    </div>
                  </div>
                </div>
                {record.notes && (
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