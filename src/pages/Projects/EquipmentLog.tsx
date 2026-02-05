import React, { useState, useEffect, useCallback } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';

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

interface EquipmentLogPayload {
  logs: Array<Record<string, unknown>>;
  equipment: Array<Record<string, unknown>>;
  operators: Array<Record<string, unknown>>;
}

export default function EquipmentLog() {
  const { user } = useAuthStore(state => ({
    user: state.user,
  }));

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

  const loadPayload = useCallback(async () => {
    try {
      const raw = await rpcClient.rpc_equipment_log_payload();
      const payload = raw && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as unknown as EquipmentLogPayload)
        : null;

      const logsRaw = payload?.logs ?? [];
      const equipmentRaw = payload?.equipment ?? [];
      const operatorsRaw = payload?.operators ?? [];

      const processedLogs: EquipmentUsage[] = logsRaw.map((log) => ({
        id: typeof log.id === 'string' ? log.id : undefined,
        equipment_id: typeof log.equipment_id === 'string' ? log.equipment_id : '',
        usage_date: typeof log.usage_date === 'string' ? log.usage_date : new Date().toISOString().split('T')[0],
        hours_used: typeof log.hours_used === 'number' ? log.hours_used : 0,
        operator_id: null,
        operator_name: null,
        notes: typeof log.notes === 'string' ? log.notes : ''
      }));

      const normalizedEquipment: EquipmentItem[] = equipmentRaw.map((item) => ({
        id: typeof item.id === 'string' ? item.id : '',
        user_defined_id: typeof item.serial_number === 'string' && item.serial_number.length > 0
          ? item.serial_number
          : (typeof item.id === 'string' ? item.id : ''),
        name: typeof item.name === 'string' ? item.name : 'Unnamed',
        description: typeof item.model === 'string' ? item.model : ''
      })).filter((item) => item.id !== '');

      const normalizedOperators: Operator[] = operatorsRaw.map((profile) => ({
        id: typeof profile.id === 'string' ? profile.id : '',
        full_name: typeof profile.full_name === 'string' ? profile.full_name : 'Unknown'
      })).filter((op) => op.id !== '');

      setLogs(processedLogs);
      setEquipmentList(normalizedEquipment);
      setOperators(normalizedOperators);
    } catch (error) {
      console.error('Error loading equipment log payload:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayload();
  }, [loadPayload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const createdLogs = await rpcClient.insert_equipment_usage({
        _input: {
          equipment_id: newLog.equipment_id,
          date: newLog.usage_date,
          hours_used: newLog.hours_used,
          notes: newLog.notes || null
        }
      });

      // Use returned row to update UI without a full refetch.
      const created = Array.isArray(createdLogs) && createdLogs.length > 0
        ? createdLogs[0]
        : null;

      if (created) {
        const operatorName = operators.find((op) => op.id === newLog.operator_id)?.full_name ?? null;
        setLogs((prev) => ([
          {
            id: typeof created.id === 'string' ? created.id : undefined,
            equipment_id: typeof created.equipment_id === 'string' ? created.equipment_id : newLog.equipment_id,
            usage_date: typeof created.date === 'string' ? created.date : newLog.usage_date,
            hours_used: typeof created.hours_used === 'number' ? created.hours_used : newLog.hours_used,
            operator_id: newLog.operator_id ?? null,
            operator_name: operatorName,
            notes: typeof created.notes === 'string' ? created.notes : newLog.notes,
          },
          ...prev,
        ]));
      }

      setIsCreating(false);
      setNewLog({
        equipment_id: '',
        usage_date: new Date().toISOString().split('T')[0],
        hours_used: 0,
        operator_id: null,
        operator_name: '',
        notes: '',
      });
    } catch (error) {
      alert('Error saving log');
      console.error('Error saving log:', error);
    }
  };

  const handleAddEquipment = async () => {
    if (!user) return;
    try {
      const createdEquipment = await rpcClient.insert_equipment({
        _input: {
          name: newEquipment.name,
          serial_number: newEquipment.user_defined_id || null,
          model: newEquipment.description || null
        }
      });
      // Use returned row to update equipment list without refetching.
      const created = Array.isArray(createdEquipment) && createdEquipment.length > 0
        ? createdEquipment[0]
        : null;

      if (created) {
        setEquipmentList((prev) => ([
          {
            id: typeof created.id === 'string' ? created.id : '',
            user_defined_id: typeof created.serial_number === 'string' && created.serial_number.length > 0
              ? created.serial_number
              : (typeof created.id === 'string' ? created.id : ''),
            name: typeof created.name === 'string' ? created.name : 'Unnamed',
            description: typeof created.model === 'string' ? created.model : '',
          },
          ...prev,
        ].filter((item) => item.id !== '')));
      }
      setShowAddEquipment(false);
      setNewEquipment({ user_defined_id: '', name: '', description: '' });
    } catch (error) {
      alert('Error adding equipment');
      console.error('Error adding equipment:', error);
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
        <form onSubmit={e => { void handleSubmit(e); }} className="bg-background-light p-4 rounded border space-y-4">
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
            value={typeof newLog.operator_id === 'string' && newLog.operator_id.length > 0 ? newLog.operator_id : ''}
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
              <button onClick={() => { void handleAddEquipment(); }} className="bg-blue-600 px-4 py-2 rounded">
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
            <div className="text-sm text-gray-400">{log.notes ?? ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
