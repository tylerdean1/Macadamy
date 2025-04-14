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

// The ContractCreation component is responsible for creating new contract entries.
const ContractCreation = () => {
  const navigate = useNavigate(); // Hook for navigation
  const { user } = useAuthStore(); // Retrieve the current user from the auth store

  const [contractData, setContractData] = useState({ // State for capturing contract data
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'draft', // Initial status is draft
    budget: 0,
    description: '',
    created_by: user?.id || '' // Record the user creating the contract
  });

  const [wbsSections, setWbsSections] = useState([]); // State for WBS sections
  const [lineItems, setLineItems] = useState<LineItem[]>([]); // State for line items list
  const [templates, setTemplates] = useState<Template[]>([]); // State for calculator templates
  const [unitOptions, setUnitOptions] = useState<{ label: string; value: string }[]>([]); // State for unit options

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase.from('calculator_templates').select('*'); // Fetch calculator templates
      if (!error && data) {
        setTemplates(data); // Set fetched templates to state
      }
    };

    const fetchUnits = async () => {
      const { data, error } = await supabase.from('unit_types').select('*'); // Fetch available unit types
      if (!error && data) {
        const formatted = data.map((u: { name: string }) => ({ // Format units for easy use
          label: u.name,
          value: u.name
        }));
        setUnitOptions(formatted); // Set formatted unit options
      }
    };

    fetchTemplates(); // Fetch templates on component mount
    fetchUnits(); // Fetch units on component mount
  }, []); // Empty dependency array to run only once

  // Handle save action for the contract
  const handleSave = async () => {
    try {
      const { data: contract, error } = await supabase // Insert the new contract
        .from('contracts')
        .insert([contractData])
        .select()
        .single();

      if (error || !contract) throw error; // Handle insertion error

      const contractId = contract.id; // Retrieve the ID of the newly created contract

      // Prepare WBS data for insertion
      const wbsInsert = wbsSections.map((wbs) => ({
        ...(typeof wbs === 'object' && wbs !== null ? wbs : {}),
        contract_id: contractId // Link WBS sections to the created contract
      }));

      const lineItemsInsert = lineItems.map((item) => ({
        ...item,
        contract_id: contractId // Link line items to the created contract
      }));

      if (wbsInsert.length) await supabase.from('wbs_sections').insert(wbsInsert); // Insert WBS sections if any
      if (lineItemsInsert.length) await supabase.from('line_items').insert(lineItemsInsert); // Insert line items if any

      toast.success('Contract saved as draft.'); // Notify user of success
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      console.error(err); // Log error
      toast.error('Failed to save contract.'); // Notify user of failure
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Contract</h1>

      <Card className="mb-6 p-4">
        {/* Contract Info Form to capture contract details */}
        <ContractInfoForm
          data={contractData}
          onChange={(updatedData) =>
            setContractData((prevData) => ({ ...prevData, ...updatedData })) // Update contract data on change
          }
        />
      </Card>

      <Card className="mb-6 p-4">
        {/* WBS Form to capture WBS data */}
        <WbsForm sections={wbsSections} onChange={setWbsSections} />
      </Card>

      <Card className="mb-6 p-4">
        {/* Line Items Form to capture line items for the contract */}
        <LineItemsForm
          items={lineItems}
          templates={templates} // Include available templates
          unitOptions={unitOptions} // Pass unit options to line items form
          onChange={setLineItems} // Update line items on change
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