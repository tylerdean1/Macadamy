import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { rpcClient } from '@/lib/rpc.client';
import type { Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';

type DailyLogRow = Database['public']['Functions']['filter_daily_logs']['Returns'][number];
type WeatherValue = Database['public']['Tables']['daily_logs']['Row']['weather'];

interface DailyLog {
  id?: string;
  contract_id: string;
  date: string;
  notes: string | null;
  project_id: string | null;
  weather: WeatherValue;
  created_at: string | null;
  updated_at: string;
  weather_conditions?: string | null;
  temperature?: number | null;
  work_performed?: string | null;
  delays_encountered?: string | null;
  visitors?: string | null;
  safety_incidents?: string | null;
}

type WeatherData = {
  conditions?: unknown;
  temperature?: unknown;
  work_performed?: unknown;
  delays_encountered?: unknown;
  visitors?: unknown;
  safety_incidents?: unknown;
};

function getLocalDateValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatLocalDateLabel(dateValue: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return dateValue;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString();
}

function parseWeatherData(weather: WeatherValue): WeatherData {
  if (!weather) return {};

  if (typeof weather === 'string') {
    try {
      const parsed = JSON.parse(weather) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as WeatherData
        : {};
    } catch {
      return {};
    }
  }

  return typeof weather === 'object' && !Array.isArray(weather) ? weather as WeatherData : {};
}

function toOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function toOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function buildWeatherData(log: DailyLog) {
  return {
    conditions: toOptionalString(log.weather_conditions),
    temperature: toOptionalNumber(log.temperature),
    work_performed: toOptionalString(log.work_performed),
    delays_encountered: toOptionalString(log.delays_encountered),
    visitors: toOptionalString(log.visitors),
    safety_incidents: toOptionalString(log.safety_incidents),
  };
}

function createDraftDailyLog(projectId: string): DailyLog {
  return {
    contract_id: projectId,
    date: getLocalDateValue(),
    notes: null,
    project_id: projectId,
    weather: {},
    created_at: null,
    updated_at: new Date().toISOString(),
    weather_conditions: null,
    temperature: null,
    work_performed: null,
    delays_encountered: null,
    visitors: null,
    safety_incidents: null,
  };
}

function mapDailyLog(log: DailyLogRow, projectId: string): DailyLog {
  const weatherData = parseWeatherData(log.weather);

  return {
    id: typeof log.id === 'string' ? log.id : undefined,
    contract_id: projectId,
    date: typeof log.date === 'string' ? log.date : getLocalDateValue(),
    notes: log.notes ?? null,
    project_id: log.project_id ?? null,
    weather: log.weather,
    created_at: log.created_at ?? null,
    updated_at: typeof log.updated_at === 'string' ? log.updated_at : new Date().toISOString(),
    weather_conditions: toOptionalString(weatherData.conditions),
    temperature: toOptionalNumber(weatherData.temperature),
    work_performed: toOptionalString(weatherData.work_performed),
    delays_encountered: toOptionalString(weatherData.delays_encountered),
    visitors: toOptionalString(weatherData.visitors),
    safety_incidents: toOptionalString(weatherData.safety_incidents),
  };
}

function reportDailyReportsError(
  operation: string,
  error: unknown,
  projectId: string | null,
): string {
  const context = {
    module: 'DailyReports',
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

export default function DailyReports() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const projectId = typeof id === 'string' && id.trim() !== '' ? id : null;

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLog, setCurrentLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [contractStatus, setContractStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDailyReports = useCallback(async () => {
    if (!projectId) {
      setLogs([]);
      setCurrentLog(null);
      setContractStatus(null);
      setErrorMessage('Project context is missing. Return to the project and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const [dailyLogRows, projectRows] = await Promise.all([
        rpcClient.filter_daily_logs({ _filters: { project_id: projectId } }),
        rpcClient.filter_projects({ _filters: { id: projectId }, _limit: 1 }),
      ]);

      const mappedLogs = Array.isArray(dailyLogRows)
        ? dailyLogRows.map((log) => mapDailyLog(log, projectId))
        : [];
      setLogs(mappedLogs);

      const project = Array.isArray(projectRows) && projectRows.length > 0 ? projectRows[0] : null;
      setContractStatus(project && typeof project.status === 'string' ? project.status : null);
      if (!project) {
        setCurrentLog(null);
        setErrorMessage('Project could not be found or you do not have access.');
        return;
      }

      const today = getLocalDateValue();
      setCurrentLog(mappedLogs.find((log) => log.date === today) ?? null);
      setEditing(false);
    } catch (err) {
      setLogs([]);
      setCurrentLog(null);
      setContractStatus(null);
      setErrorMessage(reportDailyReportsError('load daily reports', err, projectId));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchDailyReports();
  }, [fetchDailyReports]);

  const openTodayLogForm = () => {
    if (!projectId) {
      setErrorMessage('Project context is missing. Return to the project and try again.');
      return;
    }

    const today = getLocalDateValue();
    setCurrentLog(logs.find((log) => log.date === today) ?? createDraftDailyLog(projectId));
    setErrorMessage(null);
    setEditing(true);
  };

  const handleCancelEditing = () => {
    const today = getLocalDateValue();
    setCurrentLog(logs.find((log) => log.date === today) ?? null);
    setEditing(false);
    setErrorMessage(null);
  };

  const handleSaveDailyLog = async () => {
    if (isSaving || !currentLog) return;

    if (!user) {
      const error = new Error('User must be authenticated to save a daily report.');
      setErrorMessage(reportDailyReportsError('save daily report', error, projectId));
      return;
    }

    if (!projectId) {
      setErrorMessage('Project context is missing. Return to the project and try again.');
      return;
    }

    const isExistingLog = typeof currentLog.id === 'string' && currentLog.id.length > 0;
    const weatherData = buildWeatherData(currentLog);

    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (isExistingLog) {
        await rpcClient.update_daily_logs({
          _id: currentLog.id as string,
          _input: {
            weather: weatherData,
            notes: toOptionalString(currentLog.notes),
            updated_at: new Date().toISOString(),
          }
        });
      } else {
        await rpcClient.insert_daily_logs({
          _input: {
            project_id: projectId,
            date: currentLog.date,
            weather: weatherData,
            notes: toOptionalString(currentLog.notes),
          }
        });
      }

      toast.success(isExistingLog ? 'Daily report updated.' : 'Daily report created.');
      await fetchDailyReports();
    } catch (err) {
      setErrorMessage(reportDailyReportsError(
        isExistingLog ? 'update daily report' : 'create daily report',
        err,
        projectId,
      ));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isProjectActive = contractStatus?.toLowerCase() === 'active';
  const todayButtonLabel = currentLog ? "Edit Today's Log" : "Create Today's Log";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(projectId ? `/projects/${projectId}` : '/projects')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Go back to project"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Daily Reports</h1>
          </div>
          {isProjectActive && !editing && (
            <button
              onClick={openTodayLogForm}
              className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" /> {todayButtonLabel}
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => { void fetchDailyReports(); }}
                className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!errorMessage && !isProjectActive && (
          <div className="rounded-lg border border-background-lighter bg-background-light p-6 text-center text-white">
            <p>
              Daily reporting is only available for projects with <strong>Active</strong> status. <br />
              Current project status: <strong>{contractStatus ?? 'Unknown'}</strong>
            </p>
          </div>
        )}

        {!errorMessage && isProjectActive && (
          <>
            {editing && currentLog && (
              <div className="bg-background-light p-6 rounded-lg border border-background-lighter space-y-6 mb-8">
                <h2 className="text-xl font-semibold text-white">
                  {currentLog.id ? 'Edit Daily Log' : 'Create Daily Log'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-400 text-sm">Report Date</label>
                    <input
                      type="date"
                      value={currentLog.date}
                      disabled={Boolean(currentLog.id)}
                      onChange={(e) => setCurrentLog({ ...currentLog, date: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Weather Conditions</label>
                    <input
                      type="text"
                      value={currentLog.weather_conditions ?? ''}
                      onChange={(e) => setCurrentLog({ ...currentLog, weather_conditions: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Enter weather conditions"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Temperature (°F)</label>
                    <input
                      type="number"
                      value={currentLog.temperature ?? ''}
                      onChange={(e) => setCurrentLog({
                        ...currentLog,
                        temperature: e.target.value === '' ? null : Number(e.target.value),
                      })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Enter temperature in °F"
                      title="Temperature input field"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Visitors</label>
                    <textarea
                      rows={3}
                      value={currentLog.visitors ?? ''}
                      onChange={(e) => setCurrentLog({ ...currentLog, visitors: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Enter visitors"
                      title="Visitors input field"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Work Performed</label>
                    <textarea
                      rows={4}
                      value={currentLog.work_performed ?? ''}
                      onChange={(e) => setCurrentLog({ ...currentLog, work_performed: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Summarize work performed"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Delays Encountered</label>
                    <textarea
                      rows={4}
                      value={currentLog.delays_encountered ?? ''}
                      onChange={(e) => setCurrentLog({ ...currentLog, delays_encountered: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Describe delays or enter none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Safety Incidents</label>
                    <textarea
                      rows={3}
                      value={currentLog.safety_incidents ?? ''}
                      onChange={(e) => setCurrentLog({ ...currentLog, safety_incidents: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Enter safety incidents"
                      title="Safety incidents input field"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Notes</label>
                    <textarea
                      rows={3}
                      value={currentLog.notes ?? ''}
                      onChange={(e) => setCurrentLog({ ...currentLog, notes: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded"
                      placeholder="Add any additional notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { void handleSaveDailyLog(); }}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="w-5 h-5 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="rounded-lg border border-background-lighter bg-background-light p-8 text-center text-gray-300">
                  No daily reports have been recorded for this project yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id ?? `${log.date}-${log.created_at ?? 'daily-log'}`}
                    className="bg-background-light p-4 rounded border border-background-lighter"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {formatLocalDateLabel(log.date)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Created at {log.created_at ? formatLocalDateLabel(log.created_at.slice(0, 10)) : '—'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {log.weather_conditions ?? '—'} | {typeof log.temperature === 'number' ? `${log.temperature}°F` : '—'}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>Work:</strong> {log.work_performed ?? '—'}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>Delays:</strong> {log.delays_encountered ?? '—'}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>Visitors:</strong> {log.visitors ?? '—'}
                    </p>
                    <p className="text-gray-300 text-sm mb-1">
                      <strong>Safety:</strong> {log.safety_incidents ?? '—'}
                    </p>
                    <p className="text-gray-300 text-sm">
                      <strong>Notes:</strong> {log.notes ?? '—'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
