import { useState, useEffect, useCallback, useMemo } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';
import type { Tables } from '@/lib/database.types';

type OrganizationsRow = Tables<'organizations'>;

export function useOrganizationsData(): {
  organizations: OrganizationsRow[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reloadOrganizations: () => Promise<void>;
} {
  const [organizations, setOrganizations] = useState<OrganizationsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const organizationId = useAuthStore((state) => state.profile?.organization_id ?? null);

  const loadOrganizations = useCallback(async (): Promise<void> => {
    if (!organizationId) {
      setOrganizations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = await rpcClient.get_organization_by_id({ p_organization_id: organizationId });
      const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : null;
      if (!data) {
        setOrganizations([]);
        return;
      }
      const normalized: OrganizationsRow = {
        id: typeof data.id === 'string' ? data.id : organizationId,
        name: typeof data.name === 'string' ? data.name : '',
        description: typeof data.description === 'string' ? data.description : null,
        mission_statement: typeof data.mission_statement === 'string' ? data.mission_statement : null,
        headquarters: typeof data.headquarters === 'string' ? data.headquarters : null,
        logo_url: typeof data.logo_url === 'string' ? data.logo_url : null,
        created_at: typeof data.created_at === 'string' ? data.created_at : null,
        updated_at: typeof data.updated_at === 'string' ? data.updated_at : '',
        deleted_at: null,
      };
      setOrganizations([normalized]);
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError('Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadOrganizations();
  }, [loadOrganizations]);

  const filteredOrganizations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return organizations.filter(org => {
      if (!q) return true;
      const name = typeof org.name === 'string' ? org.name.toLowerCase() : '';
      const description = typeof org.description === 'string' ? org.description.toLowerCase() : '';
      return name.includes(q) || description.includes(q);
    });
  }, [organizations, searchQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return {
    organizations: filteredOrganizations,
    loading,
    error,
    searchQuery,
    handleSearchChange,
    reloadOrganizations: loadOrganizations,
  };
}
