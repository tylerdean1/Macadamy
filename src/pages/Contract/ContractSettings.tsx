// filepath: c:\Users\tyler\OneDrive\Desktop\Macadamy\public\src\pages\Contract\ContractSettings.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Page } from '@/components/Layout';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ContractStatusSelect } from './SharedComponents/ContractStatusSelect';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import type { ContractWithWktRow, ProfilesByContractRow } from '@/lib/rpc.types';
import type { Database } from '@/lib/database.types';

type ContractStatus = Database['public']['Enums']['contract_status'];
type UserRole = Database['public']['Enums']['user_role'];

export default function ContractSettings() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contract, setContract] = useState<ContractWithWktRow | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus>('Draft');
  const [teamMembers, setTeamMembers] = useState<ProfilesByContractRow[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      if (typeof contractId !== 'string' || contractId.length === 0) return;
      setIsLoading(true);
      try {
        // Get contract data
        const contractDataResult = await rpcClient.getContractWithWkt({ contract_id: contractId });
        const contractData = Array.isArray(contractDataResult) ? contractDataResult : [];
        if (contractData.length > 0) {
          setContract(contractData[0]);
          setSelectedStatus(contractData[0].status ?? 'Draft');
        } else {
          toast.error('Contract not found');
          navigate('/dashboard');
          return;
        }

        // Get team members
        const teamDataResult = await rpcClient.getProfilesByContract({ contract_id: contractId });
        const teamData = Array.isArray(teamDataResult) ? teamDataResult : [];
        setTeamMembers(teamData);
      } catch (error) {
        console.error('Error fetching contract data:', error);
        toast.error('Failed to load contract data');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchContractData();
  }, [contractId, navigate]);

  // Update contract status
  const handleUpdateStatus = async () => {
    if (typeof contractId !== 'string' || contractId.length === 0 || !contract) return;

    setIsSaving(true);
    try {
      await rpcClient.updateContracts({ _id: contractId, _status: selectedStatus });

      setContract(prev => prev ? { ...prev, status: selectedStatus } : null);
      toast.success('Contract status updated successfully');
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast.error('Failed to update contract status');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove team member
  const handleRemoveTeamMember = async (userId: string) => {
    if (typeof contractId !== 'string' || contractId.length === 0) return;
    try {
      await rpcClient.removeProfileFromContract({ _contract_id: contractId, _profile_id: userId });

      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      toast.success('Team member removed successfully');
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  // Update team member role
  const handleUpdateTeamMemberRole = async (userId: string, role: UserRole) => {
    if (typeof contractId !== 'string' || contractId.length === 0) return;
    try {
      await rpcClient.updateProfileContractRole({ _contract_id: contractId, _profile_id: userId, _role: role });

      setTeamMembers(prev => prev.map(member =>
        member.id === userId ? { ...member, role } : member
      ));
      toast.success('Team member role updated');
    } catch (error) {
      console.error('Error updating team member role:', error);
      toast.error('Failed to update role');
    }
  };

  // Delete contract
  const handleDeleteContract = async () => {
    if (typeof contractId !== 'string' || contractId.length === 0 || !contract || deleteConfirmation !== contract.title) return;
    try {
      await rpcClient.deleteContracts({ id: contractId });

      toast.success('Contract deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract');
    }
  };

  // Fix: Add null checks before accessing contract properties
  if (!contract) return null;

  return (
    <Page>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Contract Settings</h1>
          <Button
            variant="outline"
            onClick={() => navigate(`/contract/${contractId}`)}
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <Card className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Contract Status */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contract Status</h2>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-full md:w-64">
                    <ContractStatusSelect
                      value={selectedStatus}
                      onChange={setSelectedStatus}
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => { void handleUpdateStatus(); }}
                    disabled={isSaving || selectedStatus === contract?.status}
                    className="mt-2 md:mt-0"
                  >
                    {isSaving ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </Card>

              {/* Team Management */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Team Management</h2>

                {teamMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-800 text-left">
                          <th className="px-4 py-3 text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-sm font-medium">Role</th>
                          <th className="px-4 py-3 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-750">
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                {member.avatar_url ? (
                                  <img
                                    src={member.avatar_url}
                                    alt={member.full_name || 'User'}
                                    className="w-8 h-8 rounded-full mr-3"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                    {(member.full_name || 'U').charAt(0)}
                                  </div>
                                )}
                                <span>{member.full_name || 'Unnamed User'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-300">{member.email}</td>
                            <td className="px-4 py-3">
                              <select
                                value={member.role}
                                onChange={(e) => { void handleUpdateTeamMemberRole(member.id, e.target.value as UserRole); }}
                                className="bg-gray-700 text-white border-0 rounded-md px-3 py-1.5 text-sm"
                                disabled={member.id === profile?.id}
                                title="Select option"
                              >
                                <option value="admin">Admin</option>
                                <option value="member">Member</option>
                                <option value="viewer">Viewer</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => { void handleRemoveTeamMember(member.id); }}
                                disabled={member.id === profile?.id}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">No team members assigned to this contract.</p>
                )}
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 border border-red-900 bg-gray-850">
                <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-red-400">Delete Contract</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      This will permanently delete the contract and all associated data.
                    </p>

                    {!showDeleteConfirmation ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirmation(true)}
                      >
                        Delete Contract
                      </Button>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-300 mb-2">
                          To confirm, please type <strong>{contract.title}</strong> below:
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                          placeholder="Enter value"
                        />
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDeleteConfirmation(false);
                              setDeleteConfirmation('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => { void handleDeleteContract(); }}
                            disabled={deleteConfirmation !== contract.title}
                          >
                            Confirm Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

// TODO: Fix: These RPCs are not available in the generated supabase client. Use the custom rpcClient or add them to the supabase client if needed.
