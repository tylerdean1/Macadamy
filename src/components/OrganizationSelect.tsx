import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Organization } from '@/lib/types';
import { Search, Plus } from 'lucide-react';

interface OrganizationSelectProps {
  selectedId: string | null;
  onSelect: (org: Organization) => void;
}

export default function OrganizationSelect({ selectedId, onSelect }: OrganizationSelectProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('organizations').select('*').order('name');
        if (error) throw error;
        setOrganizations(data || []);
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filtered = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="space-y-4">
      <Input
        placeholder="Search organizations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        startAdornment={<Search className="w-4 h-4 text-gray-400" />}
        fullWidth
      />

      <div className="max-h-40 overflow-y-auto rounded border border-background-lighter p-2">
        {loading ? (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-2 text-center">No matches found.</p>
        ) : (
          filtered.map((org) => (
            <div
              key={org.id}
              className={`cursor-pointer rounded px-3 py-2 hover:bg-gray-800 ${
                org.id === selectedId ? 'bg-gray-700' : ''
              }`}
            onClick={() => onSelect(org)}
          >
            {org.name}
          </div>
          ))
        )}
      </div>

      <Button
        variant="outline"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={() => navigate('/organization_creation')}
        className="w-full"
      >
        Create New Organization
      </Button>
    </Card>
  );
}

