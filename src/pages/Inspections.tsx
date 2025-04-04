import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, ClipboardList, Calendar, User, CheckCircle, XCircle, Camera, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface InspectionReport {
  id?: string;
  line_item_id: string;
  inspector: string;
  inspection_date: string;
  status: string;
  findings: string;
  recommendations: string;
  photos?: string[];
}

const STATUSES = ['Pending', 'Passed', 'Failed', 'Needs Review'] as const;

export function Inspections() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [inspectors, setInspectors] = useState<any[]>([]);
  const [newInspection, setNewInspection] = useState<InspectionReport>({
    line_item_id: id || '',
    inspector: '',
    inspection_date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    findings: '',
    recommendations: '',
    photos: []
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchInspections();
    fetchInspectors();
  }, [id]);

  const fetchInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('inspection_reports')
        .select(`
          *,
          inspector:profiles!inspector (
            full_name,
            email
          )
        `)
        .eq('line_item_id', id)
        .order('inspection_date', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'engineer')
        .order('full_name');

      if (error) throw error;
      setInspectors(data || []);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('inspection_reports')
        .insert({
          ...newInspection,
          created_by: user.id
        });

      if (error) throw error;

      setIsCreating(false);
      fetchInspections();
      setNewInspection({
        line_item_id: id || '',
        inspector: '',
        inspection_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        findings: '',
        recommendations: '',
        photos: []
      });
    } catch (error) {
      console.error('Error creating inspection:', error);
      alert('Error creating inspection report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'bg-green-500/10 text-green-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      case 'needs review':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
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
            <h1 className="text-2xl font-bold text-white">Inspections</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Inspection
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-background-light rounded-lg border border-background-lighter p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Inspector
                  </label>
                  <select
                    value={newInspection.inspector}
                    onChange={(e) => setNewInspection({ ...newInspection, inspector: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  >
                    <option value="">Select Inspector</option>
                    {inspectors.map(inspector => (
                      <option key={inspector.id} value={inspector.id}>{inspector.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={newInspection.inspection_date}
                    onChange={(e) => setNewInspection({ ...newInspection, inspection_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={newInspection.status}
                    onChange={(e) => setNewInspection({ ...newInspection, status: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Findings
                </label>
                <textarea
                  value={newInspection.findings}
                  onChange={(e) => setNewInspection({ ...newInspection, findings: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recommendations
                </label>
                <textarea
                  value={newInspection.recommendations}
                  onChange={(e) => setNewInspection({ ...newInspection, recommendations: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Photos
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background border-background-lighter hover:bg-background-lighter transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
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
          {inspections.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <ClipboardList className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Inspections</h3>
              <p className="text-gray-400 mb-6">Start tracking inspections by creating a new report.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Inspection
              </button>
            </div>
          ) : (
            inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/contracts/${id}/inspections/${inspection.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white">Inspection Report</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status}
                      </span>
                      {getStatusIcon(inspection.status)}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(inspection.inspection_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        Inspector: {inspection.inspector.full_name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Findings</h4>
                    <p className="text-gray-300">{inspection.findings}</p>
                  </div>
                  {inspection.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Recommendations</h4>
                      <p className="text-gray-300">{inspection.recommendations}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}