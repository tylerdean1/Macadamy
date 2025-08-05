import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore, type EnrichedProfile } from '@/lib/store';
import type { Tables } from '@/lib/database.types';

type OrganizationsRow = Tables<'organizations'>;
type JobTitlesRow = Tables<'job_titles'>;

// Interface for edit form state
interface EditFormState {
    full_name: string;
    avatar_url: string | null;
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
        avatar_url: null,
        organization_id: null,
        job_title_id: null,
        email: '',
        custom_job_title: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    // Update form when profile changes
    useEffect(() => {
        if (profile) {
            setEditForm({
                full_name: profile.full_name ?? '',
                avatar_url: profile.avatar_url ?? null,
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

        setLoading(true);
        try {
            // Load organizations and job titles
            const [allOrgsData, allJobsData] = await Promise.all([
                rpcClient.filter_organizations({}),
                rpcClient.filter_job_titles({})
            ]);

            setOrganizations(Array.isArray(allOrgsData) ? allOrgsData : []);
            setJobTitles(Array.isArray(allJobsData) ? allJobsData : []);
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
            if (editForm.avatar_url !== (profile.avatar_url ?? null)) {
                updatePayload._avatar_url = editForm.avatar_url;
            }
            if (editForm.organization_id !== (profile.organization_id ?? null)) {
                updatePayload._organization_id = editForm.organization_id;
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
                ...updatePayload
            };

            await rpcClient.update_profiles(rpcArgs);

            // Update the local profile state
            const updatedProfile: EnrichedProfile = {
                ...profile,
                full_name: editForm.full_name || null,
                email: editForm.email || profile.email,
                phone: editForm.phone || null,
                avatar_url: editForm.avatar_url,
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
            const jobTitlePayload = {
                _input: {
                    name: title.trim(),
                }
            };

            const newJobTitle = await rpcClient.insert_job_titles(jobTitlePayload);

            if (Array.isArray(newJobTitle) && newJobTitle.length > 0 && newJobTitle[0].id) {
                // Reload job titles to include the new one
                await loadData();

                // Set the new job title as selected
                setEditForm(prev => ({
                    ...prev,
                    job_title_id: newJobTitle[0].id,
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
