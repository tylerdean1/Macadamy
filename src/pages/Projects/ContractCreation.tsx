import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { Page, SectionContainer } from '@/components/Layout';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ProjectInfoForm, type ProjectInfoVM } from './ProjectDashboardComponents/ProjectInfoForm';
import { MapModal } from './SharedComponents/MapModal';
import { MapPreview } from './SharedComponents/GoogleMaps/MapPreview';
import { parseWktToGeoJson, geometryToWKT } from '@/lib/utils/geometryUtils';

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

export const ContractCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const [contractData, setContractData] = useState<ContractFormData>({
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 0,
    status: 'planned',
    coordinates_wkt: null
  });

  const handleMapSave = (geometry: import('@/lib/types').GeometryData) => {
    const wkt = geometryToWKT(geometry);
    setContractData(prev => ({ ...prev, coordinates_wkt: (typeof wkt === 'string' && wkt.length > 0) ? wkt : null }));
  };

  const handleSubmit = async () => {
    if (typeof user?.id !== 'string' || user.id.length === 0) {
      toast.error('You must be logged in to create a contract');
      return;
    }
    if (typeof contractData.title !== 'string' || contractData.title.length === 0 ||
      typeof contractData.location !== 'string' || contractData.location.length === 0 ||
      typeof contractData.start_date !== 'string' || contractData.start_date.length === 0 ||
      typeof contractData.end_date !== 'string' || contractData.end_date.length === 0) {
      toast.error('Please fill out all required fields');
      return;
    }
    setIsSubmitting(true);

    try {
      const createdProjects = await rpcClient.create_project_with_owner({
        _input: {
          name: contractData.title,
          description: contractData.description || null,
          start_date: contractData.start_date,
          end_date: contractData.end_date,
          status: contractData.status
        },
        _role: 'project_manager'
      });

      const createdProject = Array.isArray(createdProjects) ? createdProjects[0] : null;
      const projectId = createdProject?.id;

      if (typeof projectId !== 'string' || projectId.length === 0) {
        throw new Error('Failed to create project');
      }

      toast.success('Contract created successfully!');
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewContract: ProjectInfoVM = {
    id: '',
    title: contractData.title,
    description: contractData.description || null,
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
              <h1 className="text-2xl font-bold mb-6">Create New Contract</h1>

              <ProjectInfoForm contractData={previewContract} />

              <div className="mt-6 border-t border-gray-700 pt-6">
                <h2 className="text-lg font-semibold mb-4">Location</h2>

                {typeof contractData.coordinates_wkt === 'string' && contractData.coordinates_wkt.length > 0 ? (
                  <div onClick={() => setShowMapModal(true)} className="cursor-pointer">
                    <MapPreview
                      wktGeometry={contractData.coordinates_wkt}
                      height="300px"
                      onClick={() => setShowMapModal(true)}
                    />
                    <div className="text-center mt-2 text-gray-400 text-sm">
                      Click to edit location
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-700 rounded-md flex items-center justify-center h-60 cursor-pointer hover:border-gray-500 transition-colors"
                    onClick={() => setShowMapModal(true)}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2 text-gray-500">📍</div>
                      <p className="text-gray-400">Click to set contract location on map</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => { void handleSubmit(); }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Contract'}
                </Button>
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
        title="Set Contract Location"
        contractId=""
        mode="edit"
      />
    </Page>
  );
};

export default ContractCreation;

