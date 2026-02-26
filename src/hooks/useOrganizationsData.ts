import { useState, useEffect, useCallback, useMemo } from 'react';
import { getBackendErrorMessage, logBackendError } from '@/lib/backendErrors';
import { rpcClient } from '@/lib/rpc.client';
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

  // Fetch all organizations using the public RPC
  const loadOrganizations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Use empty string to fetch all orgs
      const data = await rpcClient.get_organizations_public({ p_query: '' });
      // Defensive: ensure array and shape
      if (Array.isArray(data)) {
        setOrganizations(
          data.map((org) => ({
            id: org.id,
            name: org.name,
            description: null,
            mission_statement: null,
            headquarters: null,
            logo_url: null,
            created_at: null,
            updated_at: '',
            deleted_at: null,
          }))
        );
      } else {
        setOrganizations([]);
      }
    } catch (err) {
      logBackendError({
        module: 'useOrganizationsData',
        operation: 'load organizations',
        trigger: 'background',
        error: err,
      });
      setError(getBackendErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

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
