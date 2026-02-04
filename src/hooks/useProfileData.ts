import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase';
import { useAuthStore, type EnrichedProfile } from '@/lib/store';
import type { Tables, Json } from '@/lib/database.types';

type OrganizationsRow = Tables<'organizations'>;
type JobTitlesRow = Tables<'job_titles'>;

// Interface for edit form state
interface EditFormState {
    full_name: string;
    avatar_id: string | null;
    organization_id?: string | null;
    job_title_id?: string | null;
    email?: string;
    custom_job_title?: string;
    phone?: string;
}

export function useProfileData(): {
    profile: EnrichedProfile | null;
    organizations: OrganizationsRow[];
    jobTitles: JobTitlesRow[];
    editForm: EditFormState;
    setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
    loading: boolean;
    editLoading: boolean;
    reloadData: () => Promise<void>;
    saveProfile: () => Promise<void>;
    addCustomJobTitle: (title: string) => Promise<void>;
} {
    const { profile, setProfile } = useAuthStore();
    const [organizations, setOrganizations] = useState<OrganizationsRow[]>([]);
    const [jobTitles, setJobTitles] = useState<JobTitlesRow[]>([]);
    const [editForm, setEditForm] = useState<EditFormState>({
        full_name: '',
        avatar_id: null,
        organization_id: null,
        job_title_id: null,
        email: '',
        custom_job_title: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const runPublicRpc = async <T,>(
        fn: string,
        args?: Record<string, unknown>
    ): Promise<{ data: T | null; error: unknown | null }> => {
        const rpc = supabase.rpc as unknown as (
            this: typeof supabase,
            name: string,
            params?: Record<string, unknown>
        ) => Promise<{ data: T | null; error: unknown | null }>;

        return rpc.call(supabase, fn, args);
    };

    // Update form when profile changes
    useEffect(() => {
        if (profile) {
            setEditForm({
                full_name: profile.full_name ?? '',
                avatar_id: profile.avatar_id ?? null,
                organization_id: profile.organization_id ?? null,
                job_title_id: profile.job_title_id ?? null,
                email: profile.email ?? '',
                custom_job_title: '',
                phone: profile.phone ?? '',
            });
        }
    }, [profile]);

    const loadData = useCallback(async (): Promise<void> => {
        if (!profile) return;
        if (!profile.organization_id) {
            setOrganizations([]);
            setJobTitles([]);
            return;
        }

        setLoading(true);
        try {
            const fetchOrganizations = async (): Promise<OrganizationsRow[]> => {
                const orgs = await rpcClient.get_organizations_public({ p_query: '' });
                const matched = Array.isArray(orgs)
                    ? orgs.filter((org) => org.id === profile.organization_id)
                    : [];
                return matched.map((org) => ({
                    id: org.id,
                    name: org.name,
                    description: null,
                    mission_statement: null,
                    headquarters: null,
                    logo_url: null,
                    created_at: null,
                    updated_at: '',
                    deleted_at: null,
                } satisfies OrganizationsRow));
            };

            const [allOrgsData, jobTitlesResult] = await Promise.all([
                fetchOrganizations(),
                runPublicRpc<JobTitlesRow[]>('get_job_titles_public'),
            ]);

            if (jobTitlesResult.error) {
                throw jobTitlesResult.error;
            }

            const normalizedOrganizations: OrganizationsRow[] = Array.isArray(allOrgsData)
                ? (allOrgsData as OrganizationsRow[])
                : [];
            setOrganizations(normalizedOrganizations);
            setJobTitles(Array.isArray(jobTitlesResult.data) ? jobTitlesResult.data : []);

            if (normalizedOrganizations.length > 0) {
                const orgRow = normalizedOrganizations[0] as Record<string, unknown>;
                const organizationName = typeof orgRow.name === 'string' ? orgRow.name : null;
                const organizationAddress = typeof orgRow.address === 'string' ? orgRow.address : null;

                if (organizationName !== profile.organization_name || organizationAddress !== profile.organization_address) {
                    setProfile({
                        ...profile,
                        organization_name: organizationName,
                        organization_address: organizationAddress,
                    });
                }
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const saveProfile = useCallback(async (): Promise<void> => {
        if (!profile?.id) {
            toast.error('No profile found to update');
            return;
        }

        setEditLoading(true);
        try {
            // Create update payload
            const updatePayload: Record<string, unknown> = {};

            if (editForm.full_name !== (profile.full_name ?? '')) {
                updatePayload._full_name = editForm.full_name;
            }
            if (editForm.email !== (profile.email ?? '')) {
                updatePayload._email = editForm.email;
            }
            if (editForm.phone !== (profile.phone ?? '')) {
                updatePayload._phone = editForm.phone;
            }
            if (editForm.avatar_id !== (profile.avatar_id ?? null)) {
                updatePayload._avatar_id = editForm.avatar_id;
            }
            if (editForm.job_title_id !== (profile.job_title_id ?? null)) {
                updatePayload._job_title_id = editForm.job_title_id;
            }

            if (Object.keys(updatePayload).length === 0) {
                toast.success('No changes to save');
                return;
            }

            // Update the profile using RPC
            const rpcArgs = {
                _id: profile.id,
                _input: updatePayload as Json
            };

            await rpcClient.update_profiles(rpcArgs);

            // Update the local profile state
            let avatarUrl = profile.avatar_url;
            if (editForm.avatar_id !== (profile.avatar_id ?? null)) {
                if (editForm.avatar_id) {
                    const rpc = supabase.rpc as unknown as (
                        this: typeof supabase,
                        name: string,
                        params?: Record<string, unknown>
                    ) => Promise<{ data: { url?: string | null } | null; error: unknown | null }>;

                    const { data, error } = await rpc.call(supabase, 'get_avatar_by_id_public', {
                        p_avatar_id: editForm.avatar_id
                    });
                    if (error) {
                        throw error;
                    }
                    avatarUrl = data?.url ?? null;
                } else {
                    avatarUrl = null;
                }
            }
            const updatedProfile: EnrichedProfile = {
                ...profile,
                full_name: editForm.full_name || null,
                email: editForm.email || profile.email,
                phone: editForm.phone || null,
                avatar_id: editForm.avatar_id,
                avatar_url: avatarUrl ?? profile.avatar_url,
                organization_id: editForm.organization_id ?? null,
                job_title_id: editForm.job_title_id ?? null,
                updated_at: new Date().toISOString(),
                // Keep enriched fields as they are for now
                job_title: profile.job_title,
                organization_name: profile.organization_name,
            };

            setProfile(updatedProfile);
            toast.success('Profile updated successfully');

        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    }, [profile, editForm, setProfile]);

    const addCustomJobTitle = useCallback(async (title: string): Promise<void> => {
        if (!title.trim()) {
            toast.error('Job title cannot be empty');
            return;
        }

        try {
            const { data: newJobTitle, error: jobTitleError } = await runPublicRpc<JobTitlesRow>(
                'insert_job_title_public',
                { p_name: title.trim() }
            );

            if (jobTitleError) {
                throw jobTitleError;
            }

            if (newJobTitle?.id) {
                // Reload job titles to include the new one
                await loadData();

                // Set the new job title as selected
                setEditForm(prev => ({
                    ...prev,
                    job_title_id: newJobTitle.id,
                    custom_job_title: '',
                }));

                toast.success('Custom job title added successfully');
            } else {
                throw new Error('Failed to create job title');
            }
        } catch (error) {
            console.error('Error adding custom job title:', error);
            toast.error('Failed to add custom job title');
        }
    }, [loadData]);

    return {
        profile,
        organizations,
        jobTitles,
        editForm,
        setEditForm,
        loading,
        editLoading,
        reloadData: loadData,
        saveProfile,
        addCustomJobTitle,
    };
}
