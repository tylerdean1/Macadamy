import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Building2, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];

export function ContractSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      // First try to fetch from contracts table
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .limit(1)
        .maybeSingle();

      if (contractError) {
        throw contractError;
      }

      if (!contractData) {
        // If no contract found, check if this is the demo contract
        if (id === '00000000-0000-0000-0000-000000000001') {
          setContract({
            id,
            title: 'Contract Resurfacing',
            description: 'Contract resurfacing for multiple sections',
            location: 'Various Locations',
            status: 'active',
            budget: 2500000.00,
            start_date: '2024-03-01',
            end_date: '2024-12-31',
            created_by: '00000000-0000-0000-0000-000000000000',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else {
          setError('Contract not found');
        }
      } else {
        setContract(contractData);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError('Error loading contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contract) return;

    try {
      setSaving(true);
      setError(null);

      // Don't try to update the demo contract
      if (contract.id === '00000000-0000-0000-0000-000000000001') {
        navigate(`/contracts/${contract.id}`);
        return;
      }

      const { error: updateError } = await supabase
        .from('contracts')
        .update({
          title: contract.title,
          description: contract.description,
          location: contract.location,
          start_date: contract.start_date,
          end_date: contract.end_date
        })
        .eq('id', contract.id);

      if (updateError) throw updateError;
      navigate(`/contracts/${contract.id}`);
    } catch (error) {
      console.error('Error updating contract:', error);
      setError('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">{error || 'Contract not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
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
            <h1 className="text-2xl font-bold text-white">Contract Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-background-light rounded-lg border border-background-lighter p-6">
            <h2 className="text-lg font-medium text-white mb-4">Contract Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Contract Title
                </label>
                <input
                  type="text"
                  value={contract.title}
                  onChange={(e) => setContract({ ...contract, title: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={contract.description || ''}
                  onChange={(e) => setContract({ ...contract, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={contract.location}
                  onChange={(e) => setContract({ ...contract, location: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={contract.start_date}
                    onChange={(e) => setContract({ ...contract, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={contract.end_date}
                    onChange={(e) => setContract({ ...contract, end_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Team</h2>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-400">Manage team members and permissions</p>
              <button className="mt-4 w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors">
                Manage Team
              </button>
            </div>

            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Subcontractors</h2>
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-400">Manage subcontractors and agreements</p>
              <button className="mt-4 w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors">
                Manage Subcontractors
              </button>
            </div>

            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">Locations</h2>
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-400">Manage project locations and maps</p>
              <button className="mt-4 w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors">
                Manage Locations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}