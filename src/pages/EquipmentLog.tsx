import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface EquipmentUsage {
  id?: string;
  equipment_id: string;
  map_id?: string;
  line_item_id?: string;
  usage_date: string;
  hours_used: number;
  operator_id?: string | null;
  operator_name?: string | null;
  notes: string;
}

interface Operator {
  id: string;
  full_name: string;
}

interface EquipmentItem {
  id: string;
  user_defined_id: string;
  name: string;
  description: string;
}

export function EquipmentLog() {
  const user = useAuthStore(state => state.user);

  const [logs, setLogs] = useState<EquipmentUsage[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    user_defined_id: '',
    name: '',
    description: '',
  });

  const [newLog, setNewLog] = useState<EquipmentUsage>({
    equipment_id: '',
    usage_date: new Date().toISOString().split('T')[0],
    hours_used: 0,
    operator_id: null,
    operator_name: '',
    notes: '',
  });

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_usage')
        .select('*')
        .order('usage_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOperators = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('id, full_name');
    if (!error) setOperators(data || []);
  }, []);

  const fetchEquipment = useCallback(async () => {
    const { data, error } = await supabase.from('equipment').select('*');
    if (!error) setEquipmentList(data || []);
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchOperators();
    fetchEquipment();
  }, [fetchLogs, fetchOperators, fetchEquipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('equipment_usage').insert({
        ...newLog,
        created_by: user.id,
      });

      if (error) throw error;

      setIsCreating(false);
      fetchLogs();
      setNewLog({
        equipment_id: '',
        usage_date: new Date().toISOString().split('T')[0],
        hours_used: 0,
        operator_id: null,
        operator_name: '',
        notes: '',
      });
    } catch {
      alert('Error saving log');
    }
  };

  const handleAddEquipment = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('equipment').insert({
        ...newEquipment,
        created_by: user.id,
      });
      if (error) throw error;
      setShowAddEquipment(false);
      setNewEquipment({ user_defined_id: '', name: '', description: '' });
      fetchEquipment();
    } catch {
      alert('Error adding equipment');
    }
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Equipment Log</h1>
        <button onClick={() => setIsCreating(true)} className="bg-blue-600 px-4 py-2 rounded">
          + New
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-background-light p-4 rounded border space-y-4">
          <select
            aria-label="Select equipment"
            value={newLog.equipment_id}
            onChange={(e) => {
              if (e.target.value === 'add-new') {
                setShowAddEquipment(true);
                return;
              }
              setNewLog({ ...newLog, equipment_id: e.target.value });
            }}
            className="w-full text-black px-4 py-2 rounded"
            required
          >
            <option value="">Select Equipment</option>
            {equipmentList.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.user_defined_id} – {eq.name}
              </option>
            ))}
            <option value="add-new">+ Add New Equipment</option>
          </select>

          <input
            type="date"
            value={newLog.usage_date}
            onChange={(e) => setNewLog({ ...newLog, usage_date: e.target.value })}
            className="w-full text-black px-4 py-2 rounded"
            aria-label="Usage date"
          />

          <input
            type="number"
            value={newLog.hours_used}
            onChange={(e) =>
              setNewLog({ ...newLog, hours_used: Number(e.target.value) })
            }
            className="w-full text-black px-4 py-2 rounded"
            placeholder="Hours used"
            min="0"
            aria-label="Hours used"
          />

          <select
            aria-label="Select operator"
            value={newLog.operator_id || ''}
            onChange={(e) => setNewLog({ ...newLog, operator_id: e.target.value || null })}
            className="w-full text-black px-4 py-2 rounded"
          >
            <option value="">Select Operator (optional)</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.full_name}</option>
            ))}
          </select>

          <textarea
            value={newLog.notes}
            onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
            className="w-full text-black px-4 py-2 rounded"
            placeholder="Notes"
            aria-label="Notes"
          />

          <div className="flex justify-end gap-2">
            <button onClick={() => setIsCreating(false)} type="button" className="bg-gray-600 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-green-600 px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      )}

      {showAddEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-background p-6 rounded w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Add New Equipment</h2>
            <input
              type="text"
              placeholder="User Defined ID"
              value={newEquipment.user_defined_id}
              onChange={(e) => setNewEquipment({ ...newEquipment, user_defined_id: e.target.value })}
              className="w-full text-black px-4 py-2 rounded"
              aria-label="User defined ID"
            />
            <input
              type="text"
              placeholder="Name"
              value={newEquipment.name}
              onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              className="w-full text-black px-4 py-2 rounded"
              aria-label="Equipment name"
            />
            <textarea
              placeholder="Description"
              value={newEquipment.description}
              onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
              className="w-full text-black px-4 py-2 rounded"
              aria-label="Equipment description"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddEquipment(false)} className="bg-gray-600 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleAddEquipment} className="bg-blue-600 px-4 py-2 rounded">
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-background-light p-4 rounded border">
            <div className="font-semibold">{log.equipment_id}</div>
            <div>{log.usage_date} – {log.hours_used} hrs</div>
            <div className="text-sm text-gray-400">{log.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
