import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Truck, Clock, User, Calendar, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface EquipmentUsage {
  id?: string;
  line_item_id: string;
  equipment_type: string;
  hours_used: number;
  usage_date: string;
  operator: string | null;
  notes: string;
}

const EQUIPMENT_TYPES = [
  'Excavator',
  'Bulldozer',
  'Grader',
  'Loader',
  'Paver',
  'Roller',
  'Dump Truck',
  'Water Truck',
  'Crane',
  'Other'
];

export function EquipmentLog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<EquipmentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [newLog, setNewLog] = useState<EquipmentUsage>({
    line_item_id: id || '',
    equipment_type: '',
    hours_used: 0,
    usage_date: new Date().toISOString().split('T')[0],
    operator: null,
    notes: ''
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchLogs();
    fetchOperators();
  }, [id]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_usage')
        .select(`
          *,
          operator:profiles!operator (
            full_name,
            email
          )
        `)
        .eq('line_item_id', id)
        .order('usage_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching equipment logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setOperators(data || []);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('equipment_usage')
        .insert({
          ...newLog,
          created_by: user.id
        });

      if (error) throw error;

      setIsCreating(false);
      fetchLogs();
      setNewLog({
        line_item_id: id || '',
        equipment_type: '',
        hours_used: 0,
        usage_date: new Date().toISOString().split('T')[0],
        operator: null,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating equipment log:', error);
      alert('Error creating equipment log');
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
            <h1 className="text-2xl font-bold text-white">Equipment Log</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Entry
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-background-light rounded-lg border border-background-lighter p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Equipment Type
                  </label>
                  <select
                    value={newLog.equipment_type}
                    onChange={(e) => setNewLog({ ...newLog, equipment_type: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Select Equipment Type</option>
                    {EQUIPMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Operator
                  </label>
                  <select
                    value={newLog.operator || ''}
                    onChange={(e) => setNewLog({ ...newLog, operator: e.target.value || null })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="">Select Operator</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Usage Date
                  </label>
                  <input
                    type="date"
                    value={newLog.usage_date}
                    onChange={(e) => setNewLog({ ...newLog, usage_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Hours Used
                  </label>
                  <input
                    type="number"
                    value={newLog.hours_used}
                    onChange={(e) => setNewLog({ ...newLog, hours_used: Number(e.target.value) })}
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
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {logs.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <Truck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Equipment Logs</h3>
              <p className="text-gray-400 mb-6">Start tracking equipment usage by creating a new entry.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Entry
              </button>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/contracts/${id}/equipment/${log.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{log.equipment_type}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(log.usage_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        {log.hours_used} hours
                      </div>
                      <div className="flex items-center text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        {log.operator?.full_name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                </div>
                {log.notes && (
                  <div className="border-t border-background-lighter pt-4 mt-4">
                    <p className="text-gray-300">{log.notes}</p>
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