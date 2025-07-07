import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';
import type { EnrichedUserContract } from '@/lib/types';
import { UserRole, ContractStatusValue } from '@/lib/enums'; // Fix: Import UserRole and ContractStatusValue

// Helper to check if a value is a valid ContractStatusValue (copied from Dashboard.tsx)
function isContractStatusValue(val: unknown): val is ContractStatusValue {
    return (
        typeof val === 'string' &&
        [
            'Draft', 'Awaiting Assignment', 'Active', 'On Hold', 'Final Review',
            'Closed', 'Bidding Solicitation', 'Assigned(Partial)', 'Assigned(Full)',
            'Completed', 'Cancelled',
        ].includes(val)
    );
}

// isJson (copied from Dashboard.tsx)
function isJson(val: unknown): val is import('@/lib/types').Json {
    if (val === null || typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return true;
    if (Array.isArray(val)) return val.every(isJson);
    if (typeof val === 'object' && val !== null) {
        return Object.values(val).every(isJson);
    }
    return false;
}

// validateUserRole (assuming it's simple, otherwise import from utils if it's complex)
// For simplicity, let's assume it just returns the role or a default.
// If it's more complex, it should be in '@/lib/utils/validate-user-role' and imported.
function validateUserRole(role: string | null | undefined): UserRole | null {
    if (role !== null && role !== undefined && Object.values(UserRole).includes(role as UserRole)) {
        return role as UserRole;
    }
    return null;
}


// Safe normalization for EnrichedUserContract (copied and adapted from Dashboard.tsx)
function normalizeEnrichedUserContract(obj: unknown): EnrichedUserContract {
    const o = typeof obj === 'object' && obj !== null ? obj as Record<string, unknown> : {};
    return {
        id: typeof o.id === 'string' ? o.id : '',
        title: typeof o.title === 'string' ? o.title : null,
        description: typeof o.description === 'string' ? o.description : null,
        location: typeof o.location === 'string' ? o.location : null,
        start_date: typeof o.start_date === 'string' ? o.start_date : null,
        end_date: typeof o.end_date === 'string' ? o.end_date : null,
        created_by: typeof o.created_by === 'string' ? o.created_by : null,
        created_at: typeof o.created_at === 'string' ? o.created_at : null,
        updated_at: typeof o.updated_at === 'string' ? o.updated_at : null,
        budget: typeof o.budget === 'number' ? o.budget : null,
        status: isContractStatusValue(o.status) ? o.status : null,
        coordinates: isJson(o.coordinates) ? o.coordinates : null,
        user_contract_role: validateUserRole(typeof o.user_contract_role === 'string' ? o.user_contract_role : null),
        // Ensure all fields from EnrichedUserContract are present
        // user_id: typeof o.user_id === 'string' ? o.user_id : null, // REMOVE
        // Add any other missing fields from EnrichedUserContract with appropriate defaults
    };
}


export function useContractsData(): {
    contracts: EnrichedUserContract[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    reloadContracts: () => Promise<void>;
} {
    const { profile } = useAuthStore();
    const [contracts, setContracts] = useState<EnrichedUserContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadContracts = useCallback(async (): Promise<void> => {
        if (!profile || !profile.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fetchedContracts = await rpcClient.getEnrichedUserContracts({ _user_id: profile.id });
            setContracts(
                Array.isArray(fetchedContracts)
                    ? fetchedContracts.map(normalizeEnrichedUserContract)
                    : []
            );
        } catch (err) {
            console.error('Error loading user contracts:', err);
            toast.error('Failed to load contracts');
            setError('Failed to load contracts.');
        } finally {
            setLoading(false);
        }
    }, [profile?.id]);

    useEffect(() => {
        void loadContracts();
    }, [loadContracts]);

    // Fix: Ensure filteredContracts returns full EnrichedUserContract objects, not a mapped subset
    const filteredContracts = useMemo(() => {
        return contracts.filter(c => {
            const lowerSearchQuery = searchQuery.toLowerCase();
            if (lowerSearchQuery === '') {
                return true;
            }
            if (c.title === null) {
                return false;
            }
            return c.title.toLowerCase().includes(lowerSearchQuery);
        });
    }, [contracts, searchQuery]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    return {
        contracts: filteredContracts, // Return the filtered and mapped contracts
        loading,
        error,
        searchQuery,
        handleSearchChange,
        reloadContracts: loadContracts, // Expose a way to reload contracts
    };
}
