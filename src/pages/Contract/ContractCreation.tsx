import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { ContractInfoForm } from '@/pages/Contract/ContractDasboardComponents/ContractInfoForm';



import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

import type { LineItems, Template, WBS, ContractsInsert } from '@/lib/types';

const ContractCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [contractData, setContractData] = useState<ContractsInsert>({
    id: uuidv4(),
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'Draft',
    budget: 0,
    description: '',
    created_by: user?.id || '',
    created_at: new Date().toISOString(),
  });

  const [wbsSections, setWbsSections] = useState<WBS[]>([]);
  const [lineItems, setLineItems] = useState<LineItems[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from('calculator_templates').select('*');
      if (!error && data) setTemplates(data);
    };

    const fetchUnits = async () => {
      const { data, error } = await supabase.from('unit_types').select('*');
      if (!error && data) {
        setUnitOptions(data.map((u: { name: string }) => ({
          label: u.name,
          value: u.name
        })));
      }
    };

    fetchTemplates();
    fetchUnits();
  }, []);

  const handleSave = async () => {
    try {
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert([contractData])
        .select()
        .single();

      if (error || !contract) throw error;

      const contractId = contract.id;

      const wbsInsert = wbsSections.map((wbs) => ({
        id: uuidv4(),
        ...wbs,
        contract_id: contractId
      }));

      const lineItemsInsert = lineItems.map((item) => ({
        id: uuidv4(),
        ...item,
        contract_id: contractId
      }));

      if (wbsInsert.length) await supabase.from('wbs').insert(wbsInsert);
      if (lineItemsInsert.length) await supabase.from('line_items').insert(lineItemsInsert);

      toast.success('Contract saved as draft.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save contract.');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Contract</h1>

      <Card className="mb-6 p-4">
        <ContractInfoForm
          data={contractData}
          onChange={(updatedData) =>
            setContractData((prev) => ({ ...prev, ...updatedData }))
          }
        />
      </Card>

      <Card className="mb-6 p-4">
        <WbsForm sections={wbsSections} onChange={setWbsSections} />
      </Card>

      <Card className="mb-6 p-4">
        <LineItemsForm
          lineItems={lineItems}
          templates={templates}
          unitOptions={unitOptions}
          onChange={setLineItems}
        />
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
        <Button onClick={handleSave}>Save Progress</Button>
      </div>
    </div>
  );
};

export default ContractCreation;
