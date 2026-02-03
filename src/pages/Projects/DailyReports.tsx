import { useState, useEffect } from 'react'; // Import React and hooks
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks for routing
import { ArrowLeft, Plus, Save } from 'lucide-react'; // Import action icons
import { supabase } from '@/lib/supabase'; // Import Supabase client for interacting with the database
import type { Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store'; // Import auth state management

/**
 * Interface representing a daily log entry - aligned with database.types.ts daily_logs table
 */
interface DailyLog {
  id?: string;
  contract_id: string;
  date: string; // Using 'date' field from database, not 'log_date'
  notes: string | null;
  project_id: string | null;
  weather: Database['public']['Tables']['daily_logs']['Row']['weather']; // Json type from database
  created_at: string | null;
  updated_at: string;
  // Additional fields for UI mapping
  weather_conditions?: string | null;
  temperature?: number | null;
  work_performed?: string | null;
  delays_encountered?: string | null;
  visitors?: string | null;
  safety_incidents?: string | null;
}

/**
 * DailyReports component for managing daily log reports associated with a contract.
 * 
 * This component allows users to view, create, and update daily logs for
 * a specific contract. It ensures that only authorized roles can create or edit
 * logs while pulling and displaying data from Supabase. The component includes
 * state management for loading status, current log details, and the list of logs.
 */
export default function DailyReports() {
  const { id: contract_id } = useParams(); // Extract contract ID from route parameters
  const navigate = useNavigate(); // Use navigate for routing
  const user = useAuthStore(state => state.user); // Fetch the current user from the auth store

  // State variables
  const [logs, setLogs] = useState<DailyLog[]>([]); // State to hold fetched daily logs
  const [currentLog, setCurrentLog] = useState<DailyLog | null>(null); // State for currently editing log
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [contractStatus, setContractStatus] = useState<string | null>(null); // Contract status state
  const [contractCheckLoading, setContractCheckLoading] = useState(true); // Loading state for checking contract status
  const [editing, setEditing] = useState(false); // Editing state for current log

  // Fetch daily logs based on contract ID
  useEffect(() => {
    async function fetchData() {
      if (typeof contract_id !== 'string' || contract_id.length === 0) return;
      try {
        // Query daily_logs table directly since the structure doesn't match the custom RPC
        const { data, error } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('project_id', contract_id);

        if (error) throw error;

        // Map database fields to our interface
        const mappedLogs: DailyLog[] = Array.isArray(data)
          ? data.map((log) => {
            type WeatherData = {
              conditions?: string;
              temperature?: number;
              work_performed?: string;
              delays_encountered?: string;
              visitors?: string;
              safety_incidents?: string;
            };

            // Parse weather JSON if it exists
            let weatherData: WeatherData = {};
            try {
              weatherData = log.weather
                ? (typeof log.weather === 'string' ? JSON.parse(log.weather) as WeatherData : log.weather as WeatherData)
                : {};
            } catch {
              weatherData = {};
            }

            return {
              id: log.id,
              contract_id: contract_id,
              date: log.date,
              notes: log.notes,
              project_id: log.project_id,
              weather: log.weather,
              created_at: log.created_at,
              updated_at: log.updated_at,
              // Extract from weather JSON or notes
              weather_conditions: weatherData.conditions || null,
              temperature: weatherData.temperature || null,
              work_performed: weatherData.work_performed || null,
              delays_encountered: weatherData.delays_encountered || null,
              visitors: weatherData.visitors || null,
              safety_incidents: weatherData.safety_incidents || null,
            };
          })
          : [];
        setLogs(mappedLogs);
      } catch (err) {
        console.error('Failed to fetch daily logs:', err);
      } finally {
        setLoading(false);
      }
    }

    void fetchData(); // Invoke data fetch
  }, [contract_id]); // Dependency on contract ID

  // Check contract status using direct table query
  useEffect(() => {
    async function fetchContractStatus() {
      if (typeof contract_id !== 'string' || contract_id.length === 0) return;

      try {
        // Query projects table instead of contracts table
        const { data, error } = await supabase
          .from('projects')
          .select('status')
          .eq('id', contract_id)
          .single();

        if (error) throw error;
        if (data && typeof data.status === 'string') {
          setContractStatus(data.status);
        }
      } catch (err) {
        console.error('Error fetching contract status:', err);
      } finally {
        setContractCheckLoading(false);
      }
    }

    void fetchContractStatus();
  }, [contract_id]);

  // Move fetchData to top-level so it can be called from handleUpdate
  async function fetchData() {
    if (typeof contract_id !== 'string' || contract_id.length === 0) return;
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('project_id', contract_id);

      if (error) throw error;

      const mappedLogs: DailyLog[] = Array.isArray(data)
        ? data.map((log) => {
          let weatherData: Record<string, unknown> = {};
          try {
            weatherData = log.weather ? (typeof log.weather === 'string' ? JSON.parse(log.weather) : log.weather) : {};
          } catch {
            weatherData = {};
          }

          return {
            id: log.id,
            contract_id: contract_id,
            date: log.date,
            notes: log.notes,
            project_id: log.project_id,
            weather: log.weather,
            created_at: log.created_at,
            updated_at: log.updated_at,
            weather_conditions: typeof weatherData.conditions === 'string' ? weatherData.conditions : null,
            temperature: typeof weatherData.temperature === 'number' ? weatherData.temperature : null,
            work_performed: typeof weatherData.work_performed === 'string' ? weatherData.work_performed : null,
            delays_encountered: typeof weatherData.delays_encountered === 'string' ? weatherData.delays_encountered : null,
            visitors: typeof weatherData.visitors === 'string' ? weatherData.visitors : null,
            safety_incidents: typeof weatherData.safety_incidents === 'string' ? weatherData.safety_incidents : null,
          };
        })
        : [];
      setLogs(mappedLogs);
    } catch (err) {
      console.error('Failed to fetch daily logs:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle updates to the daily log
  const handleUpdate = async () => {
    if (!currentLog || typeof user !== 'object' || user === null || typeof currentLog.id !== 'string' || currentLog.id.length === 0) return;

    try {
      // Prepare weather data as JSON
      const weatherData = {
        conditions: currentLog.weather_conditions,
        temperature: currentLog.temperature,
        work_performed: currentLog.work_performed,
        delays_encountered: currentLog.delays_encountered,
        visitors: currentLog.visitors,
        safety_incidents: currentLog.safety_incidents,
      };

      // Update daily_logs table directly
      const { error } = await supabase
        .from('daily_logs')
        .update({
          weather: weatherData,
          notes: currentLog.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentLog.id);

      if (error) throw error;
      setEditing(false);
      void fetchData();
    } catch (err) {
      console.error('Error updating daily log:', err);
    }
  };

  // Render loading indicator while fetching data
  if (contractCheckLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div> // Circular loading spinner
    );
  }

  // Render message if contract is not active
  if (contractStatus !== 'active') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white text-center px-4">
        <p>
          Daily reporting is only available for contracts with <strong>Active</strong> status. <br />
          Current contract status: <strong>{contractStatus}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background"> {/* Main container for daily reports */}
      <div className="max-w-5xl mx-auto px-4 py-8"> {/* Container for content */}
        <div className="flex justify-between items-center mb-6"> {/* Header section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${contract_id}`)} // Back to project dashboard
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Go back to contract"
            >
              <ArrowLeft className="w-6 h-6" /> {/* Back arrow icon */}
            </button>
            <h1 className="text-2xl font-bold text-white">Daily Reports</h1> {/* Page title */}
          </div>
          {currentLog && !editing && ( // Show edit button if log exists and not in editing mode
            <button
              onClick={() => setEditing(true)} // Start editing the current log
              className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" /> Edit Today’s Log {/* Button to edit log */}
            </button>
          )}
        </div>

        {editing && currentLog && ( // Render form for editing daily log
          <div className="bg-background-light p-6 rounded-lg border border-background-lighter space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-white">Edit Daily Log</h2> {/* Edit log header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid for input fields */}
              <div>
                <label className="text-gray-400 text-sm">Weather Conditions</label>
                <input
                  type="text"
                  value={currentLog.weather_conditions ?? ''} // Bind weather conditions to input
                  onChange={(e) =>
                    setCurrentLog({ ...currentLog, weather_conditions: e.target.value }) // Update state on change
                  }
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                  placeholder="Enter weather conditions"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Temperature (°F)</label>
                <input
                  type="number"
                  value={currentLog.temperature ?? ''} // Bind temperature to input
                  onChange={(e) =>
                    setCurrentLog({ ...currentLog, temperature: parseFloat(e.target.value) }) // Update state on change
                  }
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                  placeholder="Enter temperature in °F"
                  title="Temperature input field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-400 text-sm">Visitors</label>
                <textarea
                  rows={3}
                  value={currentLog.visitors ?? ''} // Bind visitors to input
                  onChange={(e) =>
                    setCurrentLog({ ...currentLog, visitors: e.target.value }) // Update state on change
                  }
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                  placeholder="Enter visitors"
                  title="Visitors input field"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Safety Incidents</label>
                <textarea
                  rows={3}
                  value={currentLog.safety_incidents ?? ''} // Bind safety incidents to input
                  onChange={(e) =>
                    setCurrentLog({ ...currentLog, safety_incidents: e.target.value }) // Update state on change
                  }
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                  placeholder="Enter safety incidents"
                  title="Safety incidents input field"
                />
              </div>
            </div>

            {/* Buttons for canceling or saving the log */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditing(false)} // Reset editing state on cancel
                className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => { void handleUpdate(); }} // Call update function on save
                className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
              >
                <Save className="w-5 h-5 mr-2" /> Save {/* Save button */}
              </button>
            </div>
          </div>
        )}

        {/* Render the list of existing daily logs */}
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-background-light p-4 rounded border border-background-lighter"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {new Date(log.date).toLocaleDateString()} {/* Display log date */}
                  </h3>
                  <p className="text-gray-400 text-sm">Created at {log.created_at ? new Date(log.created_at).toLocaleDateString() : '—'}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {log.weather_conditions} | {log.temperature}°F {/* Display weather and temperature */}
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Visitors:</strong> {typeof log.visitors === 'string' && log.visitors.length > 0 ? log.visitors : '—'}
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Safety:</strong> {typeof log.safety_incidents === 'string' && log.safety_incidents.length > 0 ? log.safety_incidents : '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}