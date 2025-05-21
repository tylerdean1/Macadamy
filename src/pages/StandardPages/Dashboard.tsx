import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import { supabase } from '@/lib/supabase'; // Only needed for storage (avatar upload)
import type { Avatars, Contracts, JobTitles, Profile, Organization, EnrichedUserContract } from '@/lib/types';
import type { ContractStatusValue, UserRole } from '@/lib/enums';
import { validateUserRole } from '@/lib/utils/validate-user-role';

import { ProfileSection } from './StandardPageComponents/ProfileSection';
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import { ContractsSection } from './StandardPageComponents/ContractsSection';
import { PageContainer } from './StandardPageComponents/PageContainer';
import { getCroppedImg } from '@/utils/cropImage';
import type { Area } from 'react-easy-crop';

// Helper to check if a value is a valid ContractStatusValue
function isContractStatusValue(val: unknown): val is ContractStatusValue {
  return typeof val === 'string' && [
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
  ].includes(val);
}

// Fix unnecessary assertion in isJson
function isJson(val: unknown): val is import('@/lib/types').Json {
  if (
    val === null ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  ) return true;
  if (Array.isArray(val)) return val.every(isJson);
  if (typeof val === 'object') {
    return Object.values(val).every(isJson);
  }
  return false;
}

// Safe normalization for EnrichedUserContract
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
function useContractFiltering(contracts: Contracts[]) {
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize filtered contracts to prevent unnecessary recalculations
  const filteredContracts = useMemo(() => {
    return contracts
      .map(c => ({
        id: c.id,
        title: c.title ?? undefined,
        description: c.description ?? undefined,
        location: c.location ?? undefined,
        start_date: c.start_date ?? undefined,
        end_date: c.end_date ?? undefined,
        budget: c.budget ?? undefined,
        status: c.status ?? undefined,
      }))
      .filter((c) => typeof c.title === 'string' && c.title.toLowerCase().includes(searchQuery.toLowerCase()));
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

export default function Dashboard() {
  // ── auth + nav ───────────────────────────────────────────
  useRequireProfile();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuthStore();

  // ── state for dashboard data ──────────────────────────────
  const [avatars, setAvatars] = useState<Avatars[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitles[]>([]);
  const [contracts, setContracts] = useState<EnrichedUserContract[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    activeContracts: 0,
    openIssues: 0,
    pendingInspections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── profile edit state ────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    avatar_id: '',
    organization_id: '',
    job_title_id: '',
    address: '',
    phone: '',
    email: '',
    custom_job_title: '',
  }); const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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
        // Load avatars (used in modal)
        const avatarsData = await rpcClient.getAvatarsForProfile({ p_profile_id: user.id });
        setAvatars(
          (Array.isArray(avatarsData) ? avatarsData : []).map(a => ({
            id: a.id,
            url: a.url,
            is_preset: a.is_preset,
            created_at: null,
            profile_id: null,
            session_id: null,
            name: '', // fallback, not present in AvatarsForProfileRow
          }))
        );

        // Load organizations and job titles for editing
        const sessionId = profile.session_id ?? '';
        const [orgsData, jobsData] = await Promise.all([
          rpcClient.getOrganizations({ p_session_id: sessionId }),
          rpcClient.getJobTitles()
        ]);
        setOrganizations(Array.isArray(orgsData) ? orgsData : []);
        setJobTitles(
          (Array.isArray(jobsData) ? jobsData : []).map(j => ({
            id: '', // fallback, not present in JobTitlesRow
            title: j.title ?? '',
            is_custom: j.is_custom ?? false,
            session_id: j.session_id ?? null,
            created_at: null,
            updated_at: null,
            created_by: null, // fallback, not present in JobTitlesRow
          }))
        );

        // Get user's contracts using the new enriched RPC
        let fetchedContracts: EnrichedUserContract[] = [];
        try {
          fetchedContracts = await rpcClient.getEnrichedUserContracts({ _user_id: user.id });
        } catch (ucErr) {
          console.error("Error loading user contracts:", ucErr);
          toast.error("Failed to load contracts");
        }
        setContracts(Array.isArray(fetchedContracts)
          ? fetchedContracts.map(normalizeEnrichedUserContract)
          : []);

        // Get dashboard metrics using the RPC
        try {
          const metricsData = await rpcClient.getDashboardMetrics({ p_user_id: user.id });
          setMetrics({
            activeContracts: metricsData.active_contracts || 0,
            openIssues: metricsData.total_issues || 0,
            pendingInspections: metricsData.total_inspections || 0,
          });
        } catch (metricsErr) {
          console.error("Error loading metrics:", metricsErr);
          toast.error("Failed to load dashboard metrics");
          setMetrics({
            activeContracts: 0,
            openIssues: 0,
            pendingInspections: 0,
          });
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [user, profile]);

  // ── profile editing functions ───────────────────────────
  // Initialize form when profile is available
  useEffect(() => {
    if (profile) {
      setEditForm({
        avatar_id: profile.avatar_id ?? '',
        organization_id: profile.organization_id ?? '',
        job_title_id: profile.job_title_id ?? '',
        address: profile.location ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        custom_job_title: profile.job_title ?? '',
      });
    }
  }, [profile]);

  // Handle form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle custom form changes (e.g., redirecting for new organization creation)
  const handleCustomFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'organization_id' && value === 'create-new') {
      navigate('/create-organization');
      return;
    }
    handleFormChange(e);
  };

  // Handle avatar selection
  const handleAvatarSelect = (url: string) => {
    const selectedAvatar = avatars.find(avatar => avatar.url === url);
    if (selectedAvatar) {
      setEditForm(prev => ({
        ...prev,
        avatar_id: selectedAvatar.id
      }));
    }
    setSelectedImage(null); // Clear any custom image selection
  };

  // Handle avatar upload
  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };  // Handle profile save with RPC
  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    try {
      // If we have a cropped image, upload it first
      let avatarUrl = null;
      if (selectedImage !== null && croppedAreaPixels !== null) {
        const blob = await getCroppedImg(selectedImage, croppedAreaPixels);
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        // Upload to storage
        const fileName = `${user.id}_${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      // Prepare updates
      const updates = {
        phone: editForm.phone,
        location: editForm.address,
        email: editForm.email,
        organization_id: editForm.organization_id || null,
        job_title_id: editForm.job_title_id || null,
        custom_job_title: !editForm.job_title_id && editForm.custom_job_title ? editForm.custom_job_title : null,
        avatar_id: editForm.avatar_id || null,
        avatar_url: avatarUrl
      };

      // Use the updateProfile from authStore which calls the RPC
      await updateProfile(profile.id, updates);

      toast.success("Profile updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      // No need to set state as we're using a local variable
    }
  };

  // ── contract filtering ──────────────────────────────────
  const { searchQuery, filteredContracts, handleSearchChange } =
    useContractFiltering(contracts as Contracts[]); // Now compatible due to optional session_id

  // ── guard states ────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (error != null && error !== '') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No profile found
      </div>
    );
  }  // ── main render ─────────────────────────────────────────
  const avatarUrl = profile.avatar_url ?? null;

  // Create a profile object with the necessary user_role property for ProfileSection
  const profileForComponent: Profile = {
    id: profile.id,
    user_role: profile.role as UserRole,
    full_name: profile.full_name,
    email: profile.email ?? '',
    username: profile.username,
    phone: profile.phone ?? '',
    location: profile.location ?? '',
    avatar_id: profile.avatar_id ?? '',
    avatar_url: profile.avatar_url ?? '',
    organization_id: profile.organization_id ?? '',
    job_title_id: profile.job_title_id ?? '',
    organizations: (profile.organization_name != null && profile.organization_name !== '') ? {
      name: profile.organization_name,
      address: null,
      phone: null,
      website: null
    } : null,
    job_titles: (profile.job_title != null && profile.job_title !== '') ? {
      title: profile.job_title,
      is_custom: true
    } : null
  };
  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <ProfileSection profile={profileForComponent} onEdit={() => setIsModalOpen(true)} />

        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          avatars={avatars}
          profileAvatarUrl={avatarUrl}
          organizations={organizations}
          jobTitles={jobTitles}
          editForm={{
            ...editForm,
            avatar_id: editForm.avatar_id || undefined,
          }}
          selectedImage={selectedImage}
          crop={crop}
          zoom={zoom}
          croppedAreaPixels={croppedAreaPixels}
          onAvatarSelect={handleAvatarSelect}
          onAvatarUpload={handleAvatarUpload}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, area) => setCroppedAreaPixels(area)}
          onFormChange={handleCustomFormChange}
          onSaveProfile={() => { void handleSaveProfile(); }}
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