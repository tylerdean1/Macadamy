import { useState, useEffect, useCallback, useMemo } from 'react';
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

  const loadOrganizations = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await rpcClient.filter_organizations({});
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError('Failed to load organizations.');
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
