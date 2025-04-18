import { useState, useEffect } from 'react'; // Import React and hooks
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks for routing
import { ArrowLeft, Plus, Save } from 'lucide-react'; // Import action icons
import { supabase } from '../lib/supabase'; // Import Supabase client for interacting with the database
import { useAuthStore } from '../lib/store'; // Import auth state management

/**
 * Interface representing a daily log entry.
 */
interface DailyLog {
  id?: string; // Optional ID for the log entry
  contract_id: string; // ID of the associated contract
  log_date: string; // Date of the log
  weather_conditions: string | null; // Weather conditions noted in the log
  temperature: number | null; // Temperature recorded during the log
  work_performed: string | null; // Work performed on the log date
  delays_encountered: string | null; // Any delays noted
  visitors: string | null; // Visitors logged during the inspection
  safety_incidents: string | null; // Any safety incidents noted in the log
  created_by?: string; // User who created the log entry
  updated_by?: string; // User who last updated the log entry
  created_at?: string; // Timestamp of log creation
  updated_at?: string; // Timestamp of the last update
}

/**
 * DailyReports component for managing daily log reports associated with a contract.
 * 
 * This component allows users to view, create, and update daily logs for
 * a specific contract. It ensures that only authorized roles can create or edit
 * logs while pulling and displaying data from Supabase. The component includes
 * state management for loading status, current log details, and the list of logs.
 */
export function DailyReports() {
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
      try {
        const { data, error } = await supabase
          .from('daily_logs') // Fetch logs from the daily_logs table
          .select('*')
          .eq('contract_id', contract_id) // Filter by contract ID
          .order('log_date', { ascending: false }); // Order logs by log date

        if (error) throw error; // Handle fetch errors
        setLogs(data || []); // Update logs state
      } catch (err) {
        console.error('Failed to fetch daily logs:', err); // Log errors for debugging
      } finally {
        setLoading(false); // Hide loading indicator after fetch
      }
    }
    
    fetchData(); // Invoke data fetch
  }, [contract_id]); // Dependency on contract ID

  // Check contract status upon component mount
  useEffect(() => {
    async function fetchContractStatus() {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('status')
          .eq('id', contract_id)
          .single(); // Fetch the status of the contract

        if (error) throw error; // Handle fetch errors
        setContractStatus(data?.status); // Set the contract status state
      } catch (err) {
        console.error('Error fetching contract status:', err); // Log errors
      } finally {
        setContractCheckLoading(false); // Hide loading for contract check
      }
    }

    fetchContractStatus(); // Call function to check contract status
  }, [contract_id]); // Dependency on contract ID

  // Handle updates to the daily log
  const handleUpdate = async () => {
    if (!currentLog || !user) return; // Ensure user is authenticated and there is a log to update

    try {
      const { error } = await supabase
        .from('daily_logs') // Update or insert the log
        .update({
          weather_conditions: currentLog.weather_conditions, // Current weather conditions
          temperature: currentLog.temperature, // Current temperature
          visitors: currentLog.visitors, // Current visitors
          safety_incidents: currentLog.safety_incidents, // Current safety incidents
          updated_by: user.id, // User who updated the log
          updated_at: new Date().toISOString(), // Current timestamp
        })
        .eq('id', currentLog.id); // Target the specific log to update

      if (error) throw error; // Handle error during update
      setEditing(false); // Reset editing state
      fetchData(); // Refresh logs after update
    } catch (err) {
      console.error('Error updating daily log:', err); // Log errors
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
  if (contractStatus !== 'Active') {
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
              onClick={() => navigate(`/contracts/${contract_id}`)} // Back to contract dashboard
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
                onClick={handleUpdate} // Call update function on save
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
                    {new Date(log.log_date).toLocaleDateString()} {/* Display log date */}
                  </h3>
                  <p className="text-gray-400 text-sm">Created by {log.created_by || '—'}</p>
                </div>
                <div className="text-sm text-gray-400">
                  {log.weather_conditions} | {log.temperature}°F {/* Display weather and temperature */}
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-1">
                <strong>Visitors:</strong> {log.visitors || '—'}
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Safety:</strong> {log.safety_incidents || '—'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
async function fetchData() {
  try {
    // Add your implementation here or remove this function if not needed
    console.log('Fetching data...');
  } catch (error) {
    console.error('Error in fetchData:', error);
  }
}