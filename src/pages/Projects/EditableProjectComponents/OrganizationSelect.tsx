import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rpcClient } from '@/lib/rpc.client';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import type { Organization } from '@/lib/types';
import { Search, Plus } from 'lucide-react';

interface OrganizationSelectProps {
  selectedId: string | null;
  onSelect: (org: Organization) => void;
  createUrl?: string; // ✅ New prop for customizing destination
}

export default function OrganizationSelect({
  selectedId,
  onSelect,
  createUrl = '/organization_creation' // ✅ Default fallback
}: OrganizationSelectProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const data = await rpcClient.get_organizations_public({ p_query: search.trim() });
        const normalized = Array.isArray(data)
          ? data.map(org => ({
            id: org.id,
            name: org.name,
            address: null,
            phone: null,
            website: null
          }))
          : [];
        setOrganizations(normalized);
      } catch (error) {
        console.error('Error loading organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrganizations();
  }, [search]);

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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-2 text-center">No matches found.</p>
        ) : (
          filtered.map((org) => (
            <div
              key={org.id}
              className={`cursor-pointer rounded px-3 py-2 hover:bg-gray-800 ${org.id === selectedId ? 'bg-gray-700' : ''}`}
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
        onClick={() => navigate(createUrl)} // ✅ Uses passed-in destination
        className="w-full"
      >
        Create New Organization
      </Button>
    </Card>
  );
}
