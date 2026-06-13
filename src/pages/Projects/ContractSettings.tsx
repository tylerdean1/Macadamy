import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Page } from '@/components/Layout';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ContractStatusSelect } from './SharedComponents/ContractStatusSelect';
import { useAuthStore } from '@/lib/store';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
import type { ContractWithWktRow, ProfilesByContractRow } from '@/lib/geospatial.types';
import type { Database } from '@/lib/database.types';

type ContractStatus = Database['public']['Enums']['project_status'];
type ContractRole = string;

export default function ContractSettings() {
  const { id: routeProjectId, contractId: legacyContractId } = useParams<{ id?: string; contractId?: string }>();
  const projectId = routeProjectId ?? legacyContractId ?? '';
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contract, setContract] = useState<ContractWithWktRow | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus>('planned');
  const [teamMembers, setTeamMembers] = useState<ProfilesByContractRow[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const navigateBackToProject = useCallback(() => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
      return;
    }

    navigate('/projects');
  }, [navigate, projectId]);

  const loadContractData = useCallback(async () => {
    if (!projectId) {
      setContract(null);
      setTeamMembers([]);
      setLoadError('Missing project context. Open settings from a project dashboard.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    try {
      const contractRows = await rpcClient.get_contract_with_wkt({ p_contract_id: projectId });
      const currentContract = Array.isArray(contractRows) ? contractRows[0] : null;
      if (!currentContract) {
        setContract(null);
        setTeamMembers([]);
        return;
      }

      const members = await rpcClient.get_profiles_by_contract({ p_contract_id: projectId });
      setContract(currentContract);
      setSelectedStatus(currentContract.status ?? 'planned');
      setTeamMembers(Array.isArray(members) ? members : []);
    } catch (error) {
      logBackendError({
        module: 'ContractSettings',
        operation: 'load project settings',
        trigger: 'user',
        error,
        ids: { projectId },
      });
      setContract(null);
      setTeamMembers([]);
      setLoadError(getBackendErrorMessage(error));
      toast.error('Unable to load project settings.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadContractData();
  }, [loadContractData]);

  const handleUpdateStatus = async () => {
    if (!projectId || !contract) return;

    setIsSaving(true);
    try {
      await rpcClient.update_projects({ _id: projectId, _input: { status: selectedStatus } });

      setContract(prev => prev ? { ...prev, status: selectedStatus } : null);
      toast.success('Project status updated successfully');
    } catch (error) {
      logBackendError({
        module: 'ContractSettings',
        operation: 'update project status',
        trigger: 'user',
        error,
        ids: { projectId },
      });
      toast.error('Failed to update project status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!projectId) return;
    try {
      await rpcClient.remove_profile_from_contract({
        p_contract_id: projectId,
        p_profile_id: userId,
      });
      setTeamMembers((prev) => prev.filter((member) => member.id !== userId));
      toast.success('Team member removed');
    } catch (error) {
      logBackendError({
        module: 'ContractSettings',
        operation: 'remove project team member',
        trigger: 'user',
        error,
        ids: { projectId, userId },
      });
      toast.error('Failed to remove team member');
    }
  };

  const handleUpdateTeamMemberRole = async (userId: string, role: ContractRole) => {
    if (!projectId) return;
    try {
      await rpcClient.update_profile_contract_role({
        p_contract_id: projectId,
        p_profile_id: userId,
        p_role: role,
      });
      setTeamMembers((prev) => prev.map((member) => (
        member.id === userId ? { ...member, contract_role: role } : member
      )));
      toast.success('Role updated');
    } catch (error) {
      logBackendError({
        module: 'ContractSettings',
        operation: 'update project team member role',
        trigger: 'user',
        error,
        ids: { projectId, userId },
      });
      toast.error('Failed to update role');
    }
  };

  const handleDeleteContract = async () => {
    if (!projectId || !contract || deleteConfirmation !== contract.title) return;
    try {
      await rpcClient.delete_projects({ _id: projectId });

      toast.success('Project deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      logBackendError({
        module: 'ContractSettings',
        operation: 'delete project',
        trigger: 'user',
        error,
        ids: { projectId },
      });
      toast.error('Failed to delete project');
    }
  };

  const contractTitle = contract?.title ?? '';

  if (!isLoading && loadError) {
    return (
      <Page>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Project Settings</h1>
            <Button variant="outline" onClick={navigateBackToProject}>
              Back to Dashboard
            </Button>
          </div>
          <ErrorState
            error={loadError}
            onRetry={() => { void loadContractData(); }}
            title="Unable to load project settings"
          />
        </div>
      </Page>
    );
  }

  if (!isLoading && !contract) {
    return (
      <Page>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Project Settings</h1>
            <Button
              variant="outline"
              onClick={navigateBackToProject}
            >
              Back to Dashboard
            </Button>
          </div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <p className="text-sm text-gray-300">
              The requested project could not be loaded.
            </p>
          </Card>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Project Settings</h1>
          <Button
            variant="outline"
            onClick={navigateBackToProject}
          >
            Back to Dashboard
          </Button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <Card className="p-8">
              <LoadingState message="Loading project settings..." />
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Project Status</h2>
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
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                  {(member.full_name || 'U').charAt(0)}
                                </div>
                                <span>{member.full_name || 'Unnamed User'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-300">{member.email}</td>
                            <td className="px-4 py-3">
                              <select
                                value={member.contract_role ?? ''}
                                onChange={(e) => { void handleUpdateTeamMemberRole(member.id, e.target.value); }}
                                className="bg-gray-700 text-white border-0 rounded-md px-3 py-1.5 text-sm"
                                disabled={member.id === profile?.id}
                                title="Select option"
                              >
                                <option value="">Unassigned</option>
                                <option value="project_manager">Project Manager</option>
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
                  <p className="text-gray-400">No team members assigned to this project.</p>
                )}
              </Card>

              <Card className="p-6 border border-red-900 bg-gray-850">
                <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
                <div className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2 text-red-400">Delete Project</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      This will permanently delete the project and all associated data.
                    </p>

                    {!showDeleteConfirmation ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirmation(true)}
                      >
                        Delete Project
                      </Button>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-300 mb-2">
                          To confirm, please type <strong>{contractTitle}</strong> below:
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
                            disabled={deleteConfirmation !== contractTitle}
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
}