import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore } from '@/lib/store';
import type { EnrichedUserContract } from '@/lib/types';
import type { ProjectStatus, UserRoleType } from '@/lib/types';

// Helper to check if a value is a valid ProjectStatus
function isProjectStatusValue(val: unknown): val is ProjectStatus {
    return (
        typeof val === 'string' &&
        ['planned', 'active', 'complete', 'archived', 'on_hold', 'canceled'].includes(val)
    );
}

// Validate user role value
function validateUserRole(role: string | null | undefined): UserRoleType | null {
    const validRoles: UserRoleType[] = [
        'system_admin', 'org_admin', 'org_supervisor', 'org_user', 'org_viewer',
        'inspector', 'auditor'
    ];
    if (role !== null && role !== undefined && validRoles.includes(role as UserRoleType)) {
        return role as UserRoleType;
    }
    return null;
}


// Normalize unknown object into EnrichedUserContract
function normalizeEnrichedUserContract(obj: unknown): EnrichedUserContract {
    const o = typeof obj === 'object' && obj !== null ? obj as Record<string, unknown> : {};
    return {
        id: typeof o.id === 'string' ? o.id : '',
        name: typeof o.name === 'string' ? o.name : '',
        description: typeof o.description === 'string' ? o.description : null,
        start_date: typeof o.start_date === 'string' ? o.start_date : null,
        end_date: typeof o.end_date === 'string' ? o.end_date : null,
        created_at: typeof o.created_at === 'string' ? o.created_at : null,
        updated_at: typeof o.updated_at === 'string' ? o.updated_at : '',
        status: isProjectStatusValue(o.status) ? o.status : null,
        organization_id: typeof o.organization_id === 'string' ? o.organization_id : null,
        user_contract_role: validateUserRole(
            typeof o.user_contract_role === 'string' ? o.user_contract_role : null
        ),
    };
}


export function useProjectsData(): {
    projects: EnrichedUserContract[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    reloadProjects: () => Promise<void>;
} {
    const { profile } = useAuthStore();
    const [projects, setProjects] = useState<EnrichedUserContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadProjects = useCallback(async (): Promise<void> => {
        if (!profile || !profile.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const fetchedProjects = await rpcClient.getEnrichedUserContracts({ _user_id: profile.id });
            setProjects(
                Array.isArray(fetchedProjects)
                    ? fetchedProjects.map(normalizeEnrichedUserContract)
                    : []
            );
        } catch (err) {
            console.error('Error loading user projects:', err);
            toast.error('Failed to load projects');
            setError('Failed to load projects.');
        } finally {
            setLoading(false);
        }
    }, [profile?.id]);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    const filteredProjects = useMemo(() => {
        return projects.filter(c => {
            const lowerSearchQuery = searchQuery.toLowerCase();
            if (lowerSearchQuery === '') {
                return true;
            }
            return c.name.toLowerCase().includes(lowerSearchQuery);
        });
    }, [projects, searchQuery]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    return {
        projects: filteredProjects,
        loading,
        error,
        searchQuery,
        handleSearchChange,
        reloadProjects: loadProjects, // Expose a way to reload projects
    };
}
