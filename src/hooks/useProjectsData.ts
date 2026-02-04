import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { disableOrderByForTable, getOrderByColumn } from '@/lib/utils/rpcOrderBy';
import { supabase } from '@/lib/supabase';
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
    const { user, profile, loading: authLoading } = useAuthStore();
    const [projects, setProjects] = useState<EnrichedUserContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const requestSeq = useRef(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const loadProjects = useCallback(async (): Promise<void> => {
        const requestId = ++requestSeq.current;
        const canUpdate = () => isMountedRef.current && requestId === requestSeq.current;
        if (authLoading.initialization || authLoading.profile || authLoading.auth) {
            console.debug('[useProjectsData] Skipping load: auth still bootstrapping', {
                initialization: authLoading.initialization,
                auth: authLoading.auth,
                profile: authLoading.profile,
            });
            if (canUpdate()) {
                setLoading(true);
            }
            return;
        }
        if (!user?.id) {
            console.debug('[useProjectsData] Skipping load: user not ready', {
                userId: user?.id ?? null,
            });
            if (canUpdate()) {
                setProjects([]);
                setLoading(false);
            }
            return;
        }
        if (!profile || profile.id !== user.id) {
            console.debug('[useProjectsData] Skipping load: profile not synced to user', {
                userId: user.id,
                profileId: profile?.id ?? null,
            });
            if (canUpdate()) {
                setLoading(true);
            }
            return;
        }
        if (!profile.organization_id) {
            console.debug('[useProjectsData] Skipping load: missing organization_id');
            if (canUpdate()) {
                setProjects([]);
                setLoading(false);
            }
            return;
        }
        if (accessDenied) {
            console.debug('[useProjectsData] Skipping load: access denied flag set');
            if (canUpdate()) {
                setProjects([]);
                setLoading(false);
            }
            return;
        }
        const canUseProjectRpc = profile.role === 'system_admin'
            || profile.role === 'org_admin'
            || profile.role === 'org_supervisor';
        if (!canUseProjectRpc) {
            console.debug('[useProjectsData] Skipping load: role not permitted', {
                role: profile.role ?? null,
            });
            if (canUpdate()) {
                setProjects([]);
                setLoading(false);
            }
            return;
        }
        if (canUpdate()) {
            setLoading(true);
            setError(null);
        }
        try {
            const orderBy = await getOrderByColumn('projects');
            if (!orderBy) {
                if (canUpdate()) {
                    setProjects([]);
                    setError(null);
                }
                return;
            }

            const payload = {
                _filters: { organization_id: profile.organization_id },
                _order_by: orderBy,
                _direction: 'asc'
            } as Record<string, unknown>;

            console.debug('[useProjectsData] Calling filter_projects', {
                userId: user.id,
                profileId: profile.id,
                role: profile.role ?? null,
                organizationId: profile.organization_id ?? null,
                payload,
            });

            const { data: fetchedProjects, error: projectsError } = await supabase
                .rpc('filter_projects', payload);

            if (projectsError) {
                console.error('[useProjectsData] filter_projects error', {
                    code: projectsError.code,
                    message: projectsError.message,
                    details: projectsError.details,
                    hint: projectsError.hint,
                });
                const message = projectsError.message?.toLowerCase() ?? '';
                const isPermissionDenied = projectsError.code === '42501'
                    || message.includes('access denied')
                    || message.includes('permission denied');
                if (isPermissionDenied) {
                    if (canUpdate()) {
                        console.warn('[useProjectsData] Access denied for filter_projects; suppressing retries');
                        setAccessDenied(true);
                        setProjects([]);
                        setError(null);
                    }
                    return;
                }
                if (projectsError.message === 'unknown order_by column') {
                    disableOrderByForTable('projects');
                    if (canUpdate()) {
                        setProjects([]);
                        setError(null);
                    }
                    return;
                }
                throw projectsError;
            }
            if (canUpdate()) {
                setProjects(
                    Array.isArray(fetchedProjects)
                        ? fetchedProjects.map((proj) => normalizeEnrichedUserContract({
                            id: proj.id,
                            name: proj.name,
                            description: proj.description,
                            start_date: proj.start_date,
                            end_date: proj.end_date,
                            created_at: proj.created_at,
                            updated_at: proj.updated_at,
                            status: proj.status,
                            organization_id: proj.organization_id,
                            user_contract_role: null,
                        }))
                        : []
                );
            }
        } catch (err) {
            console.error('[useProjectsData] Error loading user projects', err);
            if (canUpdate()) {
                toast.error('Failed to load projects');
                setError('Failed to load projects.');
            }
        } finally {
            if (canUpdate()) {
                setLoading(false);
            }
        }
    }, [accessDenied, authLoading.initialization, authLoading.profile, authLoading.auth, profile?.id, profile?.organization_id, profile?.role, user?.id]);

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    useEffect(() => {
        setAccessDenied(false);
    }, [user?.id]);

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
