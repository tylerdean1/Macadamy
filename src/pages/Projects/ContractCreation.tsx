import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Page, SectionContainer } from '@/components/Layout';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ProjectInfoForm, type ProjectInfoVM } from './ProjectDashboardComponents/ProjectInfoForm';
import { MapModal } from './SharedComponents/MapModal';
import { MapPreview } from './SharedComponents/GoogleMaps/MapPreview';
import { parseWktToGeoJson, geometryToWKT } from '@/lib/utils/geometryUtils';

import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';

import type { Database } from '@/lib/database.types';

type ProjectStatus = Database['public']['Enums']['project_status'];

type ContractFormData = {
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: ProjectStatus;
  coordinates_wkt: string | null;
};

const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  'planned',
  'active',
  'on_hold',
  'complete',
  'archived',
  'canceled',
];

const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const normalizeOptionalText = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const buildProjectDescription = (description: string, location: string): string | null => {
  const parts = [
    normalizeOptionalText(description),
    normalizeOptionalText(location) ? `Location: ${normalizeOptionalText(location)}` : null,
  ].filter((part): part is string => part != null);

  return parts.length > 0 ? parts.join('\n\n') : null;
};

const formatProjectStatus = (status: ProjectStatus): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ContractCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const today = new Date();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const [contractData, setContractData] = useState<ContractFormData>({
    title: '',
    description: '',
    location: '',
    start_date: toDateInputValue(today),
    end_date: toDateInputValue(addDays(today, 30)),
    budget: 0,
    status: 'planned',
    coordinates_wkt: null,
  });

  const updateContractField = <K extends keyof ContractFormData>(
    field: K,
    value: ContractFormData[K],
  ): void => {
    setContractData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapSave = (geometry: import('@/lib/types').GeometryData) => {
    const wkt = geometryToWKT(geometry);
    setContractData((prev) => ({ ...prev, coordinates_wkt: (typeof wkt === 'string' && wkt.length > 0) ? wkt : null }));
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (typeof user?.id !== 'string' || user.id.length === 0) {
      toast.error('You must be logged in to create a project');
      return;
    }

    const title = contractData.title.trim();
    const startDate = contractData.start_date.trim();
    const endDate = contractData.end_date.trim();
    const location = contractData.location.trim();

    if (!title || !location || !startDate || !endDate) {
      toast.error('Please fill out all required fields');
      return;
    }

    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      toast.error('End date must be on or after the start date');
      return;
    }

    if (!Number.isFinite(contractData.budget) || contractData.budget < 0) {
      toast.error('Budget must be zero or greater');
      return;
    }

    setIsSubmitting(true);

    try {
      const createdProjects = await rpcClient.create_project_with_owner({
        _input: {
          name: title,
          description: buildProjectDescription(contractData.description, contractData.location),
          start_date: startDate,
          end_date: endDate,
          budget: contractData.budget,
          coordinates_wkt: contractData.coordinates_wkt,
          status: contractData.status,
        },
        _role: 'project_manager',
      });

      const createdProject = Array.isArray(createdProjects) ? createdProjects[0] : null;
      const projectId = createdProject?.id;

      if (typeof projectId !== 'string' || projectId.length === 0) {
        throw new Error('Project creation did not return a project ID');
      }

      toast.success('Project created successfully');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      logBackendError({
        module: 'Project Creation',
        operation: 'create project',
        trigger: 'user',
        error,
        ids: { userId: user.id },
      });
      toast.error(`Failed to create project: ${getBackendErrorMessage(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewContract: ProjectInfoVM = {
    id: '',
    title: contractData.title,
    description: buildProjectDescription(contractData.description, contractData.location),
    start_date: contractData.start_date,
    end_date: contractData.end_date,
    budget: contractData.budget,
    status: contractData.status,
    created_at: null,
    updated_at: new Date().toISOString(),
    coordinates_wkt: contractData.coordinates_wkt,
  };

  return (
    <Page>
      <SectionContainer>
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

              <form onSubmit={(event) => { void handleSubmit(event); }}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label htmlFor="project-title" className="block text-sm font-medium text-gray-300 mb-2">
                      Project name
                    </label>
                    <input
                      id="project-title"
                      type="text"
                      value={contractData.title}
                      onChange={(event) => updateContractField('title', event.target.value)}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="project-description"
                      value={contractData.description}
                      onChange={(event) => updateContractField('description', event.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="project-location" className="block text-sm font-medium text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      id="project-location"
                      type="text"
                      value={contractData.location}
                      onChange={(event) => updateContractField('location', event.target.value)}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="project-start-date" className="block text-sm font-medium text-gray-300 mb-2">
                      Start date
                    </label>
                    <input
                      id="project-start-date"
                      type="date"
                      value={contractData.start_date}
                      onChange={(event) => updateContractField('start_date', event.target.value)}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="project-end-date" className="block text-sm font-medium text-gray-300 mb-2">
                      End date
                    </label>
                    <input
                      id="project-end-date"
                      type="date"
                      value={contractData.end_date}
                      onChange={(event) => updateContractField('end_date', event.target.value)}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="project-budget" className="block text-sm font-medium text-gray-300 mb-2">
                      Budget
                    </label>
                    <input
                      id="project-budget"
                      type="number"
                      min="0"
                      step="0.01"
                      value={contractData.budget === 0 ? '' : contractData.budget}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        updateContractField('budget', rawValue === '' ? 0 : Number(rawValue));
                      }}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="project-status" className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      id="project-status"
                      value={contractData.status}
                      onChange={(event) => updateContractField('status', event.target.value as ProjectStatus)}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {PROJECT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {formatProjectStatus(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h2 className="text-lg font-semibold mb-4">Location Map</h2>

                  {typeof contractData.coordinates_wkt === 'string' && contractData.coordinates_wkt.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="w-full cursor-pointer text-left"
                    >
                      <MapPreview
                        wktGeometry={contractData.coordinates_wkt}
                        height="300px"
                        onClick={() => setShowMapModal(true)}
                      />
                      <div className="text-center mt-2 text-gray-400 text-sm">
                        Click to edit location
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-gray-700 rounded-md flex items-center justify-center h-60 cursor-pointer hover:border-gray-500 transition-colors"
                      onClick={() => setShowMapModal(true)}
                    >
                      <span className="text-center">
                        <span className="block text-4xl mb-2 text-gray-500">📍</span>
                        <span className="text-gray-400">Set project location on map</span>
                      </span>
                    </button>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/projects')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </form>

              <div className="mt-6">
                <ProjectInfoForm contractData={previewContract} />
              </div>
            </div>
          </Card>
        </div>
      </SectionContainer>

      <MapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSave={handleMapSave}
        initialGeometry={typeof contractData.coordinates_wkt === 'string' && contractData.coordinates_wkt.length > 0 ? parseWktToGeoJson(contractData.coordinates_wkt) : undefined}
        title="Set Project Location"
        contractId=""
        mode="edit"
      />
    </Page>
  );
};

export default ContractCreation;
