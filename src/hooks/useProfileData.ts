import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { rpcClient } from '@/lib/rpc.client';
import { useAuthStore, type EnrichedProfile } from '@/lib/store';
import type { Avatars, Area as CropperArea } from '@/lib/types'; // Assuming Area is the type for croppedAreaPixels
import type { Database } from '@/lib/database.types';
import type { OrganizationsRow, JobTitlesRow, InsertJobTitleRpcArgs } from '@/lib/rpc.types';

const BUCKET_NAME = 'avatars';
const AVATAR_FILE_NAME = 'avatar.png';

// Interface for edit form state (consistent with Dashboard.tsx)
interface EditFormState {
    username: string;
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
    avatars: Avatars[];
    jobTitles: JobTitlesRow[];
    loading: boolean;
    error: string | null;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    editForm: EditFormState;
    setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
    selectedImage: string | null;
    setSelectedImage: (img: string | null) => void;
    crop: { x: number; y: number };
    setCrop: (crop: { x: number; y: number }) => void;
    zoom: number;
    setZoom: (zoom: number) => void;
    croppedAreaPixels: CropperArea | null;
    setCroppedAreaPixels: (area: CropperArea | null) => void;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleCustomFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleAvatarSelect: (url: string) => void;
    handleRawImageSelected: (file: File) => void;
    handleImageCroppedAndUpload: (croppedFile: File) => Promise<void>;
    handleSaveProfile: () => Promise<void>;
    loadProfileData: () => Promise<void>;
} {
    const navigate = useNavigate();
    const { user, profile, setProfile } = useAuthStore();
    const profileRef = useRef<EnrichedProfile | null>(profile);

    const [organizations, setOrganizations] = useState<OrganizationsRow[]>([]);
    const [avatars, setAvatars] = useState<Avatars[]>([]);
    const [jobTitles, setJobTitles] = useState<JobTitlesRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<EditFormState>({
        username: '',
        full_name: '',
        avatar_id: null,
        organization_id: null,
        job_title_id: null,
        email: '',
        custom_job_title: '',
        phone: '',
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropperArea | null>(null);

    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    useEffect(() => {
        if (profile) {
            setEditForm({
                username: profile.username ?? '',
                full_name: profile.full_name ?? '',
                avatar_id: profile.avatar_id ?? null,
                organization_id: profile.organization_id ?? null,
                job_title_id: profile.job_title_id ?? null,
                email: profile.email ?? '',
                custom_job_title:
                    (profile.job_title_id == null || profile.job_title_id === '') &&
                        typeof profile.job_title === 'string' && profile.job_title.trim() !== ''
                        ? profile.job_title
                        : '',
                phone: profile.phone ?? '',
            });
        }
    }, [profile]);

    const loadInitialData = useCallback(async () => {
        if (!user || !profile) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // Load avatars
            let avatarsData: Avatars[] = [];
            try {
                const presetAvatarsResult = await supabase
                    .from('avatars')
                    .select('id, url, is_preset, session_id, name, created_at')
                    .eq('is_preset', true);

                if (!presetAvatarsResult.error && Array.isArray(presetAvatarsResult.data)) {
                    avatarsData = presetAvatarsResult.data.map(a => ({ ...a, name: a.name ?? '', session_id: a.session_id ?? null }));
                }
            } catch (presetError) {
                console.error('Error fetching preset avatars:', presetError);
            }

            if (typeof profile.avatar_id === 'string' && profile.avatar_id.length > 0 && typeof profile.avatar_url === 'string' && profile.avatar_url.length > 0) {
                const hasCurrentAvatar = avatarsData.some(a => a.id === profile.avatar_id);
                if (!hasCurrentAvatar) {
                    let currentAvatarName = 'User Avatar';
                    try {
                        const { data: customAvatarData, error: customAvatarError } = await supabase
                            .from('avatars')
                            .select('name, created_at')
                            .eq('id', profile.avatar_id)
                            .single();
                        if (!customAvatarError && customAvatarData?.name) {
                            currentAvatarName = customAvatarData.name;
                        }
                        avatarsData.push({
                            id: profile.avatar_id,
                            url: profile.avatar_url,
                            is_preset: false,
                            session_id: profile.session_id ?? null,
                            name: currentAvatarName,
                            created_at: customAvatarData?.created_at ?? new Date().toISOString(),
                        });
                    } catch {
                        avatarsData.push({
                            id: profile.avatar_id,
                            url: profile.avatar_url,
                            is_preset: false,
                            session_id: profile.session_id ?? null,
                            name: currentAvatarName,
                            created_at: new Date().toISOString(),
                        });
                    }
                }
            }
            setAvatars(avatarsData);

            const allOrgsData = await rpcClient.getOrganizations();
            const allJobsData = await rpcClient.getJobTitles();

            let filteredOrganizations: OrganizationsRow[] = Array.isArray(allOrgsData) ? allOrgsData : [];
            if (profile.is_demo_user === true && typeof profile.session_id === 'string' && profile.session_id.length > 0) {
                filteredOrganizations = filteredOrganizations.filter(org => org.session_id === profile.session_id);
            }
            setOrganizations(filteredOrganizations);

            let filteredJobTitlesRpcData: JobTitlesRow[] = Array.isArray(allJobsData) ? allJobsData : [];
            if (typeof profile.organization_id === 'string' && profile.organization_id.length > 0) {
                filteredJobTitlesRpcData = filteredJobTitlesRpcData.filter(jt => jt.organization_id === profile.organization_id);
            }
            if (profile.is_demo_user === true && typeof profile.session_id ===
                filteredJobTitlesRpcData = filteredJobTitlesRpcData.filter(jt => jt.session_id === profile.session_id);
        }
            setJobTitles(filteredJobTitlesRpcData);

    } catch (err) {
        console.error('Error loading profile data:', err);
        toast.error('Failed to load profile related data.');
        setError('Failed to load profile data.');
    } finally {
        setLoading(false);
    }
}, [user, profile, setProfile]);

useEffect(() => {
    void loadInitialData();
}, [loadInitialData]);

const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
}, []);

const handleCustomFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === 'create-new') {
        navigate('/create-organization');
        return;
    }
    handleFormChange(e);
}, [navigate, handleFormChange]);

const handleAvatarSelect = useCallback((url: string) => {
    const selectedAvatar = avatars.find(avatar => avatar.url === url);
    if (selectedAvatar) {
        setEditForm(prev => ({ ...prev, avatar_id: selectedAvatar.id }));
    }
    setSelectedImage(null);
}, [avatars]);

const handleRawImageSelected = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
        setSelectedImage(e.target?.result as string);
        setEditForm(prev => ({ ...prev, avatar_id: '' })); // Clear avatar_id for custom upload
    };
    reader.readAsDataURL(file);
}, []);

const handleImageCroppedAndUpload = useCallback(async (croppedFile: File) => {
    const currentProfile = profileRef.current;
    if (!currentProfile?.id) {
        toast.error('User profile not loaded or user ID is missing.');
        return;
    }

    const avatarStoragePath = `${currentProfile.id}/${AVATAR_FILE_NAME}`;

    try {
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(avatarStoragePath, croppedFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;
        if (!uploadData?.path) throw new Error('No path returned from storage upload.');

        const newStoragePath = uploadData.path;
        let finalAvatarIdForProfile: string | undefined;

        const avatarRecordPayload = {
            name: croppedFile.name || AVATAR_FILE_NAME,
            url: newStoragePath, // Store the storage path, not public URL initially
            is_preset: false,
            session_id: currentProfile.is_demo_user ? currentProfile.session_id : null,
        };

        // Check if user has an existing non-preset avatar
        if (currentProfile.avatar_id) {
            const { data: existingAvatarData, error: fetchError } = await supabase
                .from('avatars')
                .select('id, is_preset')
                .eq('id', currentProfile.avatar_id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

            if (existingAvatarData && !existingAvatarData.is_preset) { // Update existing custom avatar
                const { data: updatedAvatar, error: updateError } = await supabase
                    .from('avatars')
                    .update(avatarRecordPayload)
                    .eq('id', existingAvatarData.id)
                    .select('id')
                    .single();
                if (updateError) throw updateError;
                finalAvatarIdForProfile = updatedAvatar?.id;
            }
        }

        // If no existing custom avatar to update, or if current is preset, insert new
        if (!finalAvatarIdForProfile) {
            const { data: insertedAvatar, error: insertError } = await supabase
                .from('avatars')
                .insert(avatarRecordPayload)
                .select('id')
                .single();
            if (insertError) throw insertError;
            finalAvatarIdForProfile = insertedAvatar?.id;
        }

        if (!finalAvatarIdForProfile) throw new Error('Failed to obtain an avatar ID.');

        setEditForm(prev => ({ ...prev, avatar_id: finalAvatarIdForProfile }));

        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newStoragePath);
        let newPublicAvatarUrl = publicUrlData.publicUrl;

        if (newPublicAvatarUrl && profileRef.current && setProfile) {
            newPublicAvatarUrl += `?t=${new Date().getTime()}`; // Cache bust
            const updatedProfileData: EnrichedProfile = {
                ...profileRef.current,
                avatar_id: finalAvatarIdForProfile,
                avatar_url: newPublicAvatarUrl,
            };
            setProfile(updatedProfileData); // Update auth store
            // Also update the local avatars state
            setAvatars(prevAvatars => {
                const existingIndex = prevAvatars.findIndex(av => av.id === finalAvatarIdForProfile);
                const newAvatarEntry: Avatars = {
                    id: finalAvatarIdForProfile,
                    url: newPublicAvatarUrl,
                    is_preset: false,
                    name: avatarRecordPayload.name,
                    session_id: avatarRecordPayload.session_id,
                    created_at: new Date().toISOString() // Or fetch if available
                };
                if (existingIndex > -1) {
                    const updatedAvatars = [...prevAvatars];
                    updatedAvatars[existingIndex] = newAvatarEntry;
                    return updatedAvatars;
                }
                return [...prevAvatars, newAvatarEntry];
            });
        }
        toast.success('Avatar image processed. Save profile to apply changes.');
    } catch (e: any) {
        console.error('Avatar upload error:', e);
        toast.error(`Avatar upload failed: ${e.message}`);
    }
}, [setProfile]);

const handleSaveProfile = useCallback(async () => {
    const currentProfile = profileRef.current;
    if (!currentProfile || !currentProfile.id) {
        toast.error('User profile not found.');
        return;
    }

    const processingEditForm = { ...editForm };
    let customJobTitleId: string | null = null;

    // Handle custom job title creation
    if (typeof processingEditForm.custom_job_title === 'string' && processingEditForm.custom_job_title.trim() && (!processingEditForm.job_title_id || processingEditForm.job_title_id === '')) {
        const customTitleText = processingEditForm.custom_job_title.trim();
        try {
            const findQuery = supabase
                .from('job_titles')
                .select('id')
                .eq('title', customTitleText)
                .eq('is_custom', true);

            if (typeof currentProfile.organization_id === 'string' && currentProfile.organization_id) {
                findQuery.eq('organization_id', currentProfile.organization_id);
            } else if (currentProfile.is_demo_user === true && typeof currentProfile.session_id === 'string' && currentProfile.session_id) {
                findQuery.eq('session_id', currentProfile.session_id);
            } else {
                findQuery.is('organization_id', null).is('session_id', null);
            }
            const { data: existingTitle, error: findError } = await findQuery.maybeSingle();
            if (findError) throw findError;

            if (existingTitle) {
                customJobTitleId = existingTitle.id;
            } else {
                const jobTitleRpcPayload: InsertJobTitleRpcArgs = {
                    title: customTitleText,
                    is_custom: true,
                    organization_id: typeof currentProfile.organization_id === 'string' && currentProfile.organization_id ? currentProfile.organization_id : undefined,
                    session_id: currentProfile.is_demo_user === true && typeof currentProfile.session_id === 'string' && currentProfile.session_id ? currentProfile.session_id : undefined,
                };
                const newCustomTitles = await rpcClient.insert_job_title(jobTitleRpcPayload);
                if (Array.isArray(newCustomTitles) && newCustomTitles.length > 0 && newCustomTitles[0]) {
                    const newJobTitleRpcRow = newCustomTitles[0];
                    customJobTitleId = newJobTitleRpcRow.id;
                } else {
                    throw new Error('Failed to save custom job title: No new title data returned.');
                }
            }
            if (customJobTitleId) {
                processingEditForm.job_title_id = customJobTitleId;
            }
        } catch (e) {
            console.error('Custom job title error:', e);
            toast.error('Custom job title error.');
            return; // Stop save if custom job title fails
        }
    }

    const updatePayload: Partial<Database['public']['Tables']['profiles']['Row']> = {};
    if (processingEditForm.username !== (currentProfile.username ?? '')) updatePayload.username = processingEditForm.username;
    if (processingEditForm.full_name !== (currentProfile.full_name ?? '')) updatePayload.full_name = processingEditForm.full_name;
    if (processingEditForm.avatar_id !== (currentProfile.avatar_id ?? null)) updatePayload.avatar_id = processingEditForm.avatar_id;
    if ((processingEditForm.organization_id !== undefined ? processingEditForm.organization_id : null) !== (currentProfile.organization_id ?? null)) {
        updatePayload.organization_id = processingEditForm.organization_id ?? null;
    }
    if ((processingEditForm.job_title_id !== undefined ? processingEditForm.job_title_id : null) !== (currentProfile.job_title_id ?? null)) {
        updatePayload.job_title_id = processingEditForm.job_title_id ?? null;
    } else if ((!processingEditForm.job_title_id || processingEditForm.job_title_id === '') && (!processingEditForm.custom_job_title || processingEditForm.custom_job_title.trim() === '') && currentProfile.job_title_id) {
        updatePayload.job_title_id = null; // Clear job title if both fields are empty
    }
    if (processingEditForm.phone !== (currentProfile.phone ?? '')) updatePayload.phone = processingEditForm.phone;
    if (processingEditForm.email !== (currentProfile.email ?? '')) {
        updatePayload.email = processingEditForm.email;
    }

    if (Object.keys(updatePayload).length === 0) {
        toast('No changes to save.', { icon: '🤷' });
        setIsModalOpen(false);
        return;
    }

    try {
        const { data: updatedProfileResponse, error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', currentProfile.id)
            .select()
            .single();

        if (updateError) throw updateError;

        if (updatedProfileResponse && setProfile) {
            const newEnrichedProfile: EnrichedProfile = {
                ...currentProfile,
                ...updatedProfileResponse,
                avatar_url: updatedProfileResponse.avatar_id && typeof updatedProfileResponse.avatar_id === 'string' && updatedProfileResponse.avatar_id !== ''
                    ? supabase.storage.from(BUCKET_NAME).getPublicUrl(`${currentProfile.id}/${AVATAR_FILE_NAME}`).data.publicUrl + `?t=${new Date().getTime()}`
                    : null,
                organization_name: updatedProfileResponse.organization_id && typeof updatedProfileResponse.organization_id === 'string' && updatedProfileResponse.organization_id !== ''
                    ? organizations.find(o => o.id === updatedProfileResponse.organization_id)?.name ?? null
                    : null,
                job_title: updatedProfileResponse.job_title_id && typeof updatedProfileResponse.job_title_id === 'string' && updatedProfileResponse.job_title_id !== ''
                    ? jobTitles.find(j => j.id === updatedProfileResponse.job_title_id)?.title ?? null
                    : (typeof processingEditForm.custom_job_title === 'string' && processingEditForm.custom_job_title.trim() && (!updatedProfileResponse.job_title_id || updatedProfileResponse.job_title_id === '') ? processingEditForm.custom_job_title.trim() : null),
            };
            setProfile(newEnrichedProfile);
            toast.success('Profile updated successfully!');
        }
        setIsModalOpen(false);
    } catch (e) {
        console.error('Error updating profile:', e);
        toast.error('Error updating profile.');
    }
}, [editForm, profileRef, organizations, jobTitles, setProfile, avatars]);

return {
    profile, // Return current profile for direct use if needed
    organizations,
    avatars,
    jobTitles,
    loading,
    error,
    isModalOpen,
    setIsModalOpen,
    editForm,
    setEditForm, // Expose setEditForm if direct manipulation is needed, though handleFormChange is preferred
    selectedImage,
    setSelectedImage,
    crop,
    setCrop,
    zoom,
    setZoom,
    croppedAreaPixels,
    setCroppedAreaPixels,
    handleFormChange,
    handleCustomFormChange,
    handleAvatarSelect,
    handleRawImageSelected,
    handleImageCroppedAndUpload,
    handleSaveProfile,
    loadProfileData: loadInitialData, // Expose loader if manual refresh is needed
};
}
