import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Mail, MapPin, Phone, Plus, Search, FileText, Calendar,
  DollarSign, AlertTriangle, ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [contracts, setContracts] = useState<Database['public']['Tables']['contracts']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const [metrics, setMetrics] = useState({
    activeContracts: 0,
    openIssues: 0,
    pendingInspections: 0
  });

 useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);

      if (!user) {
        console.log('No user found, redirecting...');
        navigate('/');
        return;
      }

      console.log('✅ Current user ID:', user.id); // Log user ID


        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            id,
            role,
            full_name,
            email,
            username,
            phone,
            location,
            organization_id,
            job_title_id,
            organizations!profiles_organization_id_fkey (
              name,
              address,
              phone,
              website
            ),
            job_titles!profiles_job_title_id_fkey (
              title
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          throw profileError;
        }
        console.log('✅ Profile loaded:', profileData);

        const { data: userContracts, error: userContractsError } = await supabase
          .from('user_contracts')
          .select('contract_id')
          .eq('user_id', user.id);

        if (userContractsError) {
          console.error('❌ Error fetching user_contracts:', userContractsError);
          throw userContractsError;
        }
        console.log('✅ user_contracts:', userContracts);


        const contractIds = userContracts?.map((uc) => uc.contract_id);

        if (!contractIds || contractIds.length === 0) {
          setContracts([]);
          setMetrics({ activeContracts: 0, openIssues: 0, pendingInspections: 0 });
          return;
        }

        const { data: contractData, error: contractError } = await supabase
          .from('contracts')
          .select(`
            id,
            title,
            description,
            location,
            status,
            budget,
            start_date,
            end_date,
            created_at
          `)
          .in('id', contractIds)
          .order('created_at', { ascending: false });

        if (contractError) throw contractError;

        setContracts(contractData || []);

        const { data: activeContracts, error: activeError } = await supabase
          .from('contracts')
          .select('id')
          .in('id', contractIds)
          .eq('status', 'Active');

        if (activeError) throw activeError;

        const { count: issuesCount, error: issuesError } = await supabase
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Open')
          .in('contract_id', contractIds);

        if (issuesError) throw issuesError;

        setMetrics({
          activeContracts: activeContracts?.length || 0,
          openIssues: issuesCount || 0,
          pendingInspections: 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, navigate]);

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="bg-background-light rounded-lg border border-background-lighter p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {profile?.full_name}
              </h1>
              <div className="space-y-2">
                <p className="text-gray-400 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {profile?.organizations?.name} • {profile?.job_titles?.title}
                </p>
                <p className="text-gray-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {profile?.email}
                </p>
                {profile?.phone && (
                  <p className="text-gray-400 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {profile.phone}
                  </p>
                )}
                {profile?.location && (
                  <p className="text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-background-light p-6 rounded-lg border border-background-lighter">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Active Contracts</h3>
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.activeContracts}</p>
          </div>

          <div className="bg-background-light p-6 rounded-lg border border-background-lighter">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Open Issues</h3>
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.openIssues}</p>
          </div>

          <div className="bg-background-light p-6 rounded-lg border border-background-lighter">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Pending Inspections</h3>
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.pendingInspections}</p>
          </div>
        </div>

        <div className="bg-background-light rounded-lg border border-background-lighter p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">Contracts</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
              <button
                onClick={() => navigate('/demo/create')}
                className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors whitespace-nowrap"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Contract
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Contracts Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? "No contracts match your search criteria"
                    : "Start by creating your first contract"}
                </p>
              </div>
            ) : (
              filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-background p-6 rounded-lg border border-background-lighter hover:border-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">{contract.title}</h3>
                      <p className="text-gray-400 mb-4">{contract.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {contract.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${contract.budget.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        contract.status === 'Active'
                          ? 'bg-green-500/10 text-green-500'
                          : contract.status === 'Completed'
                          ? 'bg-blue-500/10 text-blue-500'
                          : contract.status === 'Cancelled'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {contract.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
