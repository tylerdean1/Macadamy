import { useState, useEffect, useCallback, useMemo } from 'react';
import { rpcClient } from '@/lib/rpc.client';
import type { OrganizationsRow } from '@/lib/rpc.types';

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
      const data = await rpcClient.getOrganizations();
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
      const address = typeof org.address === 'string' ? org.address.toLowerCase() : '';
      return name.includes(q) || address.includes(q);
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
