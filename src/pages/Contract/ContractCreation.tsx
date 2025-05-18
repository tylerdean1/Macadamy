import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import { Page } from '@/pages/StandardPages/StandardPageComponents/Page';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ContractInfoForm } from './ContractDasboardComponents/ContractInfoForm';
import { MapModal } from './SharedComponents/GoogleMaps/MapModal';
import { MapPreview } from './SharedComponents/GoogleMaps/MapPreview';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

import type { ContractWithWktRow } from '@/lib/rpc.types';
import type { Database } from '@/lib/database.types';

type ContractStatus = Database['public']['Enums']['contract_status'];

export const ContractCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [contractData, setContractData] = useState<Partial<ContractWithWktRow>>({
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 0,
    status: 'Draft' as ContractStatus,
    coordinates_wkt: null
  });

  const handleChange = (field: keyof ContractWithWktRow, value: string | number | ContractStatus) => {
    setContractData(prev => ({ ...prev, [field]: value }));
  };

  const handleMapSave = (wkt: string) => {
    setContractData(prev => ({ ...prev, coordinates_wkt: wkt }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to create a contract');
      return;
    }
    
    if (!contractData.title || !contractData.location || !contractData.start_date || !contractData.end_date) {
      toast.error('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a new UUID for the contract
      const contractId = uuidv4();
      
      // Prepare contract data
      const newContract = {
        id: contractId,
        ...contractData,
        created_by: user.id
      };

      // Insert the contract
      const { error: contractError } = await supabase.rpc('insert_contracts', {
        _data: newContract
      });
      
      if (contractError) throw contractError;

      // Assign the contract to the user
      const { error: assignError } = await supabase.rpc('insert_user_contracts', {
        _data: {
          user_id: user.id,
          contract_id: contractId,
          role: 'Project Manager'
        }
      });
      
      if (assignError) throw assignError;

      toast.success('Contract created successfully!');
      navigate(`/contracts/${contractId}/dashboard`);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-6">Create New Contract</h1>
              
              <ContractInfoForm 
                contractData={contractData as ContractWithWktRow}
                onChange={handleChange}
                isEditMode={true}
                isCreating={true}
              />
              
              <div className="mt-6 border-t border-gray-700 pt-6">
                <h2 className="text-lg font-semibold mb-4">Location</h2>
                
                {contractData.coordinates_wkt ? (
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
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Contract'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <MapModal 
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSave={handleMapSave}
        initialWkt={contractData.coordinates_wkt || undefined}
        title="Set Contract Location"
      />
    </Page>
  );
};

export default ContractCreation;

