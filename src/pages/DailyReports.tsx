import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sun, Cloud, CloudRain, Thermometer, FileText, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface DailyLog {
  id?: string;
  contract_id: string;
  log_date: string;
  weather_conditions: string;
  temperature: number;
  work_performed: string;
  delays_encountered: string;
  visitors: string;
  safety_incidents: string;
}

export function DailyReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newLog, setNewLog] = useState<DailyLog>({
    contract_id: id || '',
    log_date: new Date().toISOString().split('T')[0],
    weather_conditions: 'Clear',
    temperature: 70,
    work_performed: '',
    delays_encountered: '',
    visitors: '',
    safety_incidents: ''
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('contract_id', id)
        .order('log_date', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('daily_logs')
        .insert({
          ...newLog,
          created_by: user.id
        });

      if (error) throw error;

      setIsCreating(false);
      fetchLogs();
      setNewLog({
        contract_id: id || '',
        log_date: new Date().toISOString().split('T')[0],
        weather_conditions: 'Clear',
        temperature: 70,
        work_performed: '',
        delays_encountered: '',
        visitors: '',
        safety_incidents: ''
      });
    } catch (error) {
      console.error('Error creating log:', error);
      alert('Error creating daily log');
    }
  };

  const getWeatherIcon = (conditions: string) => {
    if (conditions?.toLowerCase().includes('rain')) return <CloudRain className="w-5 h-5" />;
    if (conditions?.toLowerCase().includes('cloud')) return <Cloud className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
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
            <h1 className="text-2xl font-bold text-white">Daily Reports</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Report
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-background-light rounded-lg border border-background-lighter p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newLog.log_date}
                    onChange={(e) => setNewLog({ ...newLog, log_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Weather Conditions
                  </label>
                  <select
                    value={newLog.weather_conditions}
                    onChange={(e) => setNewLog({ ...newLog, weather_conditions: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="Clear">Clear</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Rain">Rain</option>
                    <option value="Snow">Snow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Temperature (°F)
                  </label>
                  <input
                    type="number"
                    value={newLog.temperature}
                    onChange={(e) => setNewLog({ ...newLog, temperature: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Work Performed
                </label>
                <textarea
                  value={newLog.work_performed}
                  onChange={(e) => setNewLog({ ...newLog, work_performed: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Delays Encountered
                </label>
                <textarea
                  value={newLog.delays_encountered}
                  onChange={(e) => setNewLog({ ...newLog, delays_encountered: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Visitors
                  </label>
                  <textarea
                    value={newLog.visitors}
                    onChange={(e) => setNewLog({ ...newLog, visitors: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Safety Incidents
                  </label>
                  <textarea
                    value={newLog.safety_incidents}
                    onChange={(e) => setNewLog({ ...newLog, safety_incidents: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
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
                  Save Report
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {logs.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Daily Reports</h3>
              <p className="text-gray-400 mb-6">Start by creating your first daily report.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Report
              </button>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/contracts/${id}/daily-reports/${log.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {new Date(log.log_date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      Created by {user?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center text-gray-400">
                      {getWeatherIcon(log.weather_conditions)}
                      <span className="ml-2">{log.weather_conditions}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Thermometer className="w-5 h-5" />
                      <span className="ml-2">{log.temperature}°F</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-background-lighter pt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Work Performed</h4>
                  <p className="text-gray-300">{log.work_performed}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}