import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ContractCreation = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const handleCreateContract = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const created_by = user?.id;

    if (!created_by) {
      alert('User not authenticated');
      return;
    }

    const { error } = await supabase.from('contracts').insert([
      {
        title,
        description,
        location,
        budget,
        start_date: startDate,
        end_date: endDate,
        status: 'Draft',
        created_by,
      },
    ]);

    if (error) {
      console.error('Error creating contract:', error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Contract</h1>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="block mb-2 border p-2 w-full"
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="block mb-2 border p-2 w-full"
      />
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="block mb-2 border p-2 w-full"
      />
      <input
        type="number"
        placeholder="Budget"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="block mb-2 border p-2 w-full"
      />
      <input
        type="date"
        placeholder="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="block mb-2 border p-2 w-full"
      />
      <input
        type="date"
        placeholder="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="block mb-4 border p-2 w-full"
      />
      {/* TODO: Add UI for editing WBS and Maps */}
      <button
        onClick={handleCreateContract}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Contract
      </button>
    </div>
  );
};

export default ContractCreation;
