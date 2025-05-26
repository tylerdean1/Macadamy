import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useAuthStore, type EnrichedProfile } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import * as RPC from '@/lib/rpc.types'; // Changed: Import all as RPC namespace
import type {
  EnrichedUserContract,
  JobTitle, // This is Database['public']['Tables']['job_titles']['Row']
  Organization,
  Area,
  Avatars,
} from '@/lib/types';
import type { ContractStatusValue } from '@/lib/enums';
import { validateUserRole } from '@/lib/utils/validate-user-role'; // Restored for normalizeEnrichedUserContract
// import { getCroppedImg } from '@/utils/cropImage'; // Still seems unused here
import { PageContainer } from './StandardPageComponents/PageContainer';
import { ProfileSection } from './StandardPageComponents/ProfileSection';
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';
// Removed type EditProfileModalProps as it's not directly used in this file
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import { ContractsSection } from './StandardPageComponents/ContractsSection';

// Helper to check if a value is a valid ContractStatusValue
function isContractStatusValue(val: unknown): val is ContractStatusValue {
  return (
    typeof val === 'string' &&
    [
      'Draft',
      'Awaiting Assignment',
      'Active',
      'On Hold',
      'Final Review',
      'Closed',
      'Bidding Solicitation',
      'Assigned(Partial)',
      'Assigned(Full)',
      'Completed',
      'Cancelled',
    ].includes(val)
  );
}

// Fix unnecessary assertion in isJson
function isJson(val: unknown): val is import('@/lib/types').Json {
  if (
    val === null ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  )
    return true;
  if (Array.isArray(val)) return val.every(isJson);
  if (typeof val === 'object' && val !== null) { // Added null check for val
    return Object.values(val).every(isJson);
  }
  return false;
}

// Safe normalization for EnrichedUserContract
function normalizeEnrichedUserContract(obj: unknown): EnrichedUserContract {
  const o =
    typeof obj === 'object' && obj !== null ? obj as Record<string, unknown> : {};
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
    user_contract_role: validateUserRole(
      typeof o.user_contract_role === 'string' ? o.user_contract_role : null
    ),
    session_id: typeof o.session_id === 'string' ? o.session_id : null,
  };
}

// Interface for metrics data
interface DashboardMetricsData {
  activeContracts: number;
  openIssues: number;
  pendingInspections: number;
}

// Custom hook for contract filtering
function useContractFiltering(contracts: EnrichedUserContract[]) {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize filtered contracts to prevent unnecessary recalculations
  const filteredContracts = useMemo(() => {
    return contracts
      .map((c) => ({
        id: c.id,
        title: c.title ?? undefined,
        description: c.description ?? undefined,
        location: c.location ?? undefined,
        start_date: c.start_date ?? undefined,
        end_date: c.end_date ?? undefined,
        budget: c.budget ?? undefined,
        status: c.status ?? undefined,
      }))
      .filter((c) =>
        typeof c.title === 'string' &&
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [contracts, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    searchQuery,
    filteredContracts,
    handleSearchChange,
  };
}

// Interface for edit form state
interface EditFormState {
  username: string;
  full_name: string;
  avatar_id: string | null;
  organization_id?: string | null;
  job_title_id?: string | null;
  email?: string;
  custom_job_title?: string;
}

export default function Dashboard() {
  // ── auth + nav ───────────────────────────────────────────
  useRequireProfile();
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuthStore();

  const profileRef = useRef<EnrichedProfile | null>(profile);

  // ── state for dashboard data ──────────────────────────────
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [contracts, setContracts] = useState<EnrichedUserContract[]>([]);
  const [avatars, setAvatars] = useState<Avatars[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    activeContracts: 0,
    openIssues: 0,
    pendingInspections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── profile edit state ────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    username: "",
    full_name: "",
    avatar_id: null,
    organization_id: null,
    job_title_id: null,
    email: "",
    custom_job_title: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // const [isUploading, setIsUploading] = useState(false); // Commented out as it seems unused now

  // ── debug ────────────────────────────────────────────────
  console.log('[DEBUG] Dashboard - profile state:', {
    userExists: !!user,
    profileExists: !!profile,
    profileId: profile?.id,
  });

  // ── load dashboard data using RPCs ───────────────────────
  useEffect(() => {
    async function loadData() {
      if (!user || typeof user.id !== 'string' || user.id === '') return;
      setLoading(true);
      setError(null);

      try {
        if (!profile) {
          setLoading(false);
          return;
        }
        // Load avatars (used in modal) with error handling
        try {
          // Get preset avatars and the user's current avatar
          let avatarsData: { id: string; url: string; is_preset: boolean; session_id?: string | null; name?: string | null }[] = [];

          // First try to fetch all preset avatars
          try {
            const presetAvatarsResult = await supabase
              .from('avatars')
              .select('id, url, is_preset, session_id, name')
              .eq('is_preset', true);

            if (presetAvatarsResult.error) { // Check error first
              console.error('Error fetching preset avatars:', presetAvatarsResult.error);
            } else {
              avatarsData = [...presetAvatarsResult.data.map(a => ({ ...a, name: a.name ?? '' }))];
            }
          } catch (presetError) {
            console.error('Error fetching preset avatars:', presetError);
          }

          // Add the user's current avatar if it exists and isn't already in the list
          if (
            typeof profile.avatar_id === 'string' &&
            profile.avatar_id.trim() !== '' &&
            typeof profile.avatar_url === 'string' &&
            profile.avatar_url.trim() !== ''
          ) {
            const hasCurrentAvatar = avatarsData.some(a => a.id === profile.avatar_id);
            if (!hasCurrentAvatar) {
              let currentAvatarName = 'User Avatar';
              if (!avatarsData.find(a => a.id === profile.avatar_id)) {
                try {
                  const { data: customAvatarData, error: customAvatarError } = await supabase
                    .from('avatars')
                    .select('name')
                    .eq('id', profile.avatar_id)
                    .single();
                  if (customAvatarError) {
                    console.error('Error fetching custom avatar name:', customAvatarError);
                  } else if (customAvatarData?.name != null && customAvatarData.name !== '') { // Ensure customAvatarData.name is not null/empty
                    currentAvatarName = customAvatarData.name;
                  }
                } catch (e) {
                  console.error('Exception fetching custom avatar name:', e);
                }
              }
              avatarsData.push({
                id: profile.avatar_id,
                url: profile.avatar_url,
                is_preset: false,
                session_id: profile.session_id ?? null,
                name: currentAvatarName,
              });
            }
          }
          setAvatars(avatarsData.map(a => ({
            created_at: '', // This field is part of Avatars type, provide a default or ensure it's optional
            id: a.id,
            is_preset: a.is_preset,
            name: a.name ?? '', // Ensure name is always a string
            session_id: a.session_id ?? null,
            url: a.url,
          })));
        } catch (avatarError) {
          console.error('Error handling avatars:', avatarError);
          setAvatars([]);
        }

        const [allOrgsData, allJobsData] = await Promise.all([
          rpcClient.getOrganizations(),
          rpcClient.getJobTitles(),
        ]);

        let filteredOrganizations = Array.isArray(allOrgsData) ? allOrgsData : [];
        // Corrected role comparison: use profile.is_demo_user
        if (
          profile.is_demo_user === true &&
          typeof profile.session_id === 'string' &&
          profile.session_id.trim() !== ''
        ) {
          filteredOrganizations = filteredOrganizations.filter(org => org.session_id === profile.session_id);
        }
        setOrganizations(filteredOrganizations);

        let filteredJobTitlesRpcData = Array.isArray(allJobsData) ? allJobsData : [];
        if (
          typeof profile.organization_id === 'string' &&
          profile.organization_id.trim() !== ''
        ) {
          filteredJobTitlesRpcData = filteredJobTitlesRpcData.filter(jt => jt.organization_id === profile.organization_id);
        }
        // Corrected role comparison: use profile.is_demo_user
        if (
          profile.is_demo_user === true &&
          typeof profile.session_id === 'string' &&
          profile.session_id.trim() !== ''
        ) {
          filteredJobTitlesRpcData = filteredJobTitlesRpcData.filter(jt => jt.session_id === profile.session_id);
        }

        setJobTitles(
          filteredJobTitlesRpcData.map(j => ({
            id: j.id,
            title: j.title,
            is_custom: j.is_custom ?? null,
          }))
        );

        // Get user's contracts using the new enriched RPC
        let fetchedContracts: EnrichedUserContract[] = [];
        try {
          fetchedContracts = await rpcClient.getEnrichedUserContracts({
            _user_id: profile.id,
          });
        } catch (ucErr) {
          console.error('Error loading user contracts:', ucErr);
          toast.error('Failed to load contracts');
        }
        setContracts(
          Array.isArray(fetchedContracts)
            ? fetchedContracts.map(normalizeEnrichedUserContract)
            : []
        );

        // Get dashboard metrics using the RPC
        try {
          const metricsData = await rpcClient.getDashboardMetrics({
            _user_id: profile.id, // Changed user_id to _user_id
          });
          setMetrics({
            activeContracts: metricsData.active_contracts || 0,
            openIssues: metricsData.total_issues || 0,
            pendingInspections: metricsData.total_inspections || 0,
          });
        } catch (metricsErr) {
          console.error('Error loading metrics:', metricsErr);
          toast.error('Failed to load dashboard metrics');
          setMetrics({
            activeContracts: 0,
            openIssues: 0,
            pendingInspections: 0,
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [user, profile]);

  // ── profile editing functions ───────────────────────────
  // Initialize form when profile is available
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username ?? "",
        full_name: profile.full_name ?? "",
        avatar_id: profile.avatar_id ?? null,
        organization_id: profile.organization_id ?? null,
        job_title_id: profile.job_title_id ?? null,
        email: profile.email ?? "",
        custom_job_title: (
          (profile.job_title_id == null || profile.job_title_id === "") &&
          typeof profile.job_title === "string" &&
          profile.job_title.trim() !== ""
        ) ? profile.job_title : "",
      });
    }
  }, [profile]);

  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle custom form changes (e.g., redirecting for new organization creation)
  const handleCustomFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === 'create-new') {
      navigate('/create-organization');
      return;
    }
    handleFormChange(e);
  };

  // Handle avatar selection from the preset list
  const handleAvatarSelect = (url: string) => {
    const selectedAvatar = avatars.find((avatar) => typeof avatar.url === 'string' && avatar.url === url);
    if (selectedAvatar && typeof selectedAvatar.id === 'string') {
      setEditForm((prev) => ({
        ...prev,
        avatar_id: selectedAvatar.id,
      }));
    }
    setSelectedImage(null); // Clear any custom image selection
  };

  // Handle raw image selection from file input (passed to EditProfileModal.onRawImageSelected)
  const handleRawImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setEditForm(prev => ({ ...prev, avatar_id: '' }));
    };
    reader.readAsDataURL(file);
  };

  const BUCKET_NAME = 'avatars'; // Define BUCKET_NAME at a scope accessible by all functions that need it.
  const avatarFileName = "avatar.png"; // Define avatarFileName similarly if it's constant.

  const handleImageCroppedAndUpload = async (croppedFile: File) => {
    const currentProfile = profileRef.current;
    if (!currentProfile || !currentProfile.id) {
      toast.error("User profile not loaded or user ID is missing.");
      return;
    }

    const avatarStoragePath = `${currentProfile.id}/${avatarFileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(avatarStoragePath, croppedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading avatar to storage:', uploadError);
        toast.error(`Storage upload failed: ${uploadError.message}. Ensure bucket '${BUCKET_NAME}' exists and RLS policies are set for it.`);
        return;
      }

      if (!uploadData?.path) {
        console.error('Upload to storage succeeded but no path returned.');
        toast.error('Storage upload error: No path returned from upload.');
        return;
      }
      const newStoragePath = uploadData.path;

      let finalAvatarIdForProfile: string | undefined;

      const avatarRecordPayload = {
        name: croppedFile.name || avatarFileName,
        url: newStoragePath,
        is_preset: false,
        session_id: currentProfile.is_demo_user === true ? currentProfile.session_id : null,
      };

      if (currentProfile.avatar_id != null && currentProfile.avatar_id.trim() !== '') {
        const { data: existingAvatarData, error: fetchError } = await supabase
          .from('avatars')
          .select('id, is_preset')
          .eq('id', currentProfile.avatar_id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing avatar record:', fetchError);
          toast.error(`Error checking current avatar: ${fetchError.message}`);
        }

        if (existingAvatarData && !existingAvatarData.is_preset) {
          const { data: updatedAvatar, error: updateError } = await supabase
            .from('avatars')
            .update(avatarRecordPayload)
            .eq('id', existingAvatarData.id)
            .select('id')
            .single();

          if (updateError) {
            console.error('Error updating avatar record:', updateError);
            toast.error(`Failed to update avatar in database: ${updateError.message}`);
            return;
          }
          finalAvatarIdForProfile = updatedAvatar?.id;
          toast('Existing avatar record updated.');
        } else if (existingAvatarData && existingAvatarData.is_preset) {
          toast('Current avatar is a preset. A new avatar record will be created.');
        }
      }

      if (finalAvatarIdForProfile == null || finalAvatarIdForProfile === "") { // Retained explicit check for empty string too
        const { data: insertedAvatar, error: insertError } = await supabase
          .from('avatars')
          .insert(avatarRecordPayload)
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting new avatar record:', insertError);
          toast.error(`Failed to insert new avatar in database: ${insertError.message}`);
          return;
        }
        finalAvatarIdForProfile = insertedAvatar?.id;
        toast.success('New avatar record created.');
      }

      if (!finalAvatarIdForProfile) {
        console.error('Failed to obtain an avatar ID after database operations.');
        toast.error('Error processing avatar database record.');
        return;
      }

      setEditForm((prev) => ({ ...prev, avatar_id: finalAvatarIdForProfile })); // Removed unnecessary non-null assertion

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(newStoragePath);

      let newPublicAvatarUrl = publicUrlData.publicUrl;
      if (newPublicAvatarUrl && profileRef.current && typeof setProfile === 'function') {
        newPublicAvatarUrl += `?t=${new Date().getTime()}`;

        const updatedProfileData: EnrichedProfile = {
          ...(profileRef.current), // Removed unnecessary assertion
          avatar_id: finalAvatarIdForProfile, // Removed unnecessary non-null assertion
          avatar_url: newPublicAvatarUrl,
        };
        setProfile(updatedProfileData);
      }

      toast.success('Avatar image processed. Save profile to apply changes.');

    } catch (e: unknown) {
      const error = e as Error;
      console.error("An unexpected error occurred during avatar upload:", error);
      toast.error(`An unexpected error occurred: ${error.message || "Please try again."}`);
    }
  };

  const handleSaveProfile = async () => {
    const currentProfile = profileRef.current;
    if (!currentProfile || !currentProfile.id) {
      toast.error("User profile not found.");
      return;
    }

    const processingEditForm = { ...editForm };

    if (processingEditForm.custom_job_title != null && processingEditForm.custom_job_title.trim() !== "" && (processingEditForm.job_title_id == null || processingEditForm.job_title_id === "")) {
      const customTitleText = processingEditForm.custom_job_title.trim();
      let existingCustomJobTitleId: string | null = null;

      const findQuery = supabase
        .from('job_titles')
        .select('id')
        .eq('title', customTitleText)
        .eq('is_custom', true);

      if (currentProfile.organization_id != null && currentProfile.organization_id !== '') {
        findQuery.eq('organization_id', currentProfile.organization_id);
      } else if (currentProfile.is_demo_user === true && currentProfile.session_id != null && currentProfile.session_id !== '') {
        findQuery.eq('session_id', currentProfile.session_id);
      } else {
        findQuery.is('organization_id', null).is('session_id', null);
      }

      const { data: existingTitle, error: findError } = await findQuery.maybeSingle();

      if (findError) {
        console.error("Error finding custom job title:", findError);
        toast.error(`Error processing custom job title: ${findError.message}`);
        return;
      }

      if (existingTitle) {
        existingCustomJobTitleId = existingTitle.id;
      } else {
        const rpcArgs: RPC.InsertJobTitleRpcArgs = {
          title: customTitleText,
          is_custom: true,
          created_by: currentProfile.id, // This is correct for the RPC args
        };

        if (currentProfile.organization_id != null && currentProfile.organization_id !== '') {
          rpcArgs.organization_id = currentProfile.organization_id;
        } else if (currentProfile.is_demo_user === true && currentProfile.session_id != null && currentProfile.session_id !== '') {
          rpcArgs.session_id = currentProfile.session_id;
        }

        try {
          const newCustomTitles = await rpcClient.insert_job_title(rpcArgs);
          // newCustomTitles is of type RPC.JobTitlesRow[]
          if (newCustomTitles && newCustomTitles.length > 0 && newCustomTitles[0]) {
            const newJobTitleRpcRow = newCustomTitles[0]; // Type: RPC.JobTitlesRow
            existingCustomJobTitleId = newJobTitleRpcRow.id;

            // Construct object for local state `jobTitles` which expects `JobTitle[]`
            // `JobTitle` is Database['public']['Tables']['job_titles']['Row']
            // It includes: id, title, is_custom, created_at, created_by, updated_at, session_id, organization_id
            const newTitleForState: JobTitle = {
              id: newJobTitleRpcRow.id,
              title: newJobTitleRpcRow.title,
              is_custom: newJobTitleRpcRow.is_custom ?? null,
              // Properties from RPC.JobTitlesRow that are also in Database JobTitlesRow
              session_id: newJobTitleRpcRow.session_id ?? null,
              organization_id: newJobTitleRpcRow.organization_id ?? null,
              // Properties that might NOT be in RPC.JobTitlesRow but are in Database JobTitlesRow
              // For these, we either use what the RPC *might* return (if it was extended) or default to null/current time.
              created_by: currentProfile.id, // We know who created it from the current context.
              created_at: new Date().toISOString(), // Set current time for created_at
              updated_at: new Date().toISOString(), // Set current time for updated_at
            };
            setJobTitles(prev => [...prev, newTitleForState]);
          } else {
            toast.error('Failed to save custom job title: No new title data returned from RPC.');
            return;
          }
        } catch (rpcInsertError: any) {
          console.error("Error inserting custom job title via RPC:", rpcInsertError);
          if (rpcInsertError?.message?.includes('duplicate key value violates unique constraint')) {
            toast.error('This custom job title already exists. Please try a different title or select the existing one.');
          } else {
            toast.error(`Failed to save custom job title: ${rpcInsertError?.message || 'Unknown RPC error'}`);
          }
          return;
        }
      }
      if (existingCustomJobTitleId != null && existingCustomJobTitleId !== '') {
        processingEditForm.job_title_id = existingCustomJobTitleId;
      }
    }

    const updatePayload: Partial<Database['public']['Tables']['profiles']['Row']> = {};

    if (processingEditForm.username !== (currentProfile.username ?? "")) {
      updatePayload.username = processingEditForm.username;
    }
    if (processingEditForm.full_name !== (currentProfile.full_name ?? "")) {
      updatePayload.full_name = processingEditForm.full_name;
    }
    if (processingEditForm.avatar_id !== (currentProfile.avatar_id ?? null)) {
      updatePayload.avatar_id = processingEditForm.avatar_id;
    }
    const orgIdToUpdate = processingEditForm.organization_id === undefined ? null : processingEditForm.organization_id;
    if (orgIdToUpdate !== (currentProfile.organization_id ?? null)) {
      updatePayload.organization_id = orgIdToUpdate;
    }

    const jobTitleIdToUpdate = processingEditForm.job_title_id === undefined ? null : processingEditForm.job_title_id;
    if (jobTitleIdToUpdate !== (currentProfile.job_title_id ?? null)) {
      updatePayload.job_title_id = jobTitleIdToUpdate;
    } else if ((jobTitleIdToUpdate == null || jobTitleIdToUpdate === "") && (processingEditForm.custom_job_title == null || processingEditForm.custom_job_title.trim() === "") && (currentProfile.job_title_id != null && currentProfile.job_title_id !== "")) {
      updatePayload.job_title_id = null;
    }

    if (Object.keys(updatePayload).length === 0) {
      toast("No changes to save.", { icon: "🤷" });
      setIsModalOpen(false);
      return;
    }

    const { data: updatedProfileResponse, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", currentProfile.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      toast.error(`Error updating profile: ${error.message}`);
    } else {
      toast.success("Profile updated successfully!");
      if (updatedProfileResponse && typeof setProfile === 'function') { // This check is valid as updatedProfileResponse can be null
        const newEnrichedProfile: EnrichedProfile = {
          ...currentProfile,
          ...updatedProfileResponse,
          avatar_url: (updatedProfileResponse.avatar_id != null && updatedProfileResponse.avatar_id !== "" && currentProfile.id != null && BUCKET_NAME != null && avatarFileName != null)
            ? (supabase.storage.from(BUCKET_NAME).getPublicUrl(`${currentProfile.id}/${avatarFileName}`).data.publicUrl + `?t=${new Date().getTime()}`)
            : null,
          organization_name: (updatedProfileResponse.organization_id != null && updatedProfileResponse.organization_id !== "" && organizations)
            ? (organizations.find(o => o.id === updatedProfileResponse.organization_id)?.name ?? null)
            : null,
          job_title: (updatedProfileResponse.job_title_id != null && updatedProfileResponse.job_title_id !== "" && jobTitles)
            ? (jobTitles.find(j => j.id === updatedProfileResponse.job_title_id)?.title ?? null)
            : ((processingEditForm.custom_job_title != null && processingEditForm.custom_job_title.trim() !== "") && (updatedProfileResponse.job_title_id == null || updatedProfileResponse.job_title_id === "") ? processingEditForm.custom_job_title : null),
          is_demo_user: currentProfile.is_demo_user === true,
          session_id: currentProfile.session_id ?? null,
          role: currentProfile.role ?? null,
        };
        setProfile(newEnrichedProfile);
      }
    }
    setIsModalOpen(false);
  };

  const { searchQuery, filteredContracts, handleSearchChange } = useContractFiltering(contracts);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (error != null && error !== '') {
    return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">No profile found</div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <ProfileSection
          profile={profile}
          onEdit={() => setIsModalOpen(true)}
        />

        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          avatars={avatars}
          organizations={organizations}
          jobTitles={jobTitles}
          editForm={{
            ...editForm,
            avatar_id: editForm.avatar_id ?? undefined,
            organization_id: editForm.organization_id ?? undefined,
            job_title_id: editForm.job_title_id ?? undefined,
          }}
          selectedImage={selectedImage}
          crop={crop}
          zoom={zoom}
          croppedAreaPixels={croppedAreaPixels}
          onAvatarSelect={handleAvatarSelect}
          onRawImageSelected={handleRawImageSelected}
          onImageCroppedAndUpload={handleImageCroppedAndUpload}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_: Area, area: Area) => setCroppedAreaPixels(area)}
          onFormChange={handleCustomFormChange}
          onSaveProfile={() => {
            void handleSaveProfile();
            setIsModalOpen(false); // Close modal after save attempt
          }}
        />

        <DashboardMetrics
          activeContracts={metrics.activeContracts}
          openIssues={metrics.openIssues}
          pendingInspections={metrics.pendingInspections}
        />

        <ContractsSection
          filteredContracts={filteredContracts}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </PageContainer>
    </div>
  );
}