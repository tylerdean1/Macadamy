import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ContractInfoForm from '@/components/contract/ContractInfoForm';
import { LineItemsForm } from '@/components/contract/LineItemsForm';
import WbsForm from '@/components/contract/WbsForm';
import type { LineItem, Template } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

const ContractCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [contractData, setContractData] = useState({
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    budget: 0,
    description: '',
    created_by: user?.id || ''
  });

  const [wbsSections, setWbsSections] = useState([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from('calculator_templates').select('*');
      if (!error && data) {
        setTemplates(data);
      }
    };

    const fetchUnits = async () => {
      const { data, error } = await supabase.from('unit_types').select('*');
      if (!error && data) {
        const formatted = data.map((u: { name: string }) => ({
          label: u.name,
          value: u.name
        }));
        setUnitOptions(formatted);
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
        ...(typeof wbs === 'object' && wbs !== null ? wbs : {}),
        contract_id: contractId
      }));

      const lineItemsInsert = lineItems.map((item) => ({
        ...item,
        contract_id: contractId
      }));

      if (wbsInsert.length) await supabase.from('wbs_sections').insert(wbsInsert);
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
            setContractData((prevData) => ({ ...prevData, ...updatedData }))
          }
        />
      </Card>

      <Card className="mb-6 p-4">
        <WbsForm sections={wbsSections} onChange={setWbsSections} />
      </Card>

      <Card className="mb-6 p-4">
        <LineItemsForm
          items={lineItems}
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
