import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import type { Avatars, Contracts, JobTitles, Profile, Organization } from '@/lib/types';
import type { UserRole } from '@/lib/enums';
import { ProfileSection } from './StandardPageComponents/ProfileSection'; 
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import { ContractsSection } from './StandardPageComponents/ContractsSection';
import { PageContainer } from './StandardPageComponents/PageContainer';
import { getCroppedImg } from '@/utils/cropImage';
import type { Area } from 'react-easy-crop';

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
    return contracts.filter((c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase())
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

export function Dashboard() {
  // ── auth + nav ───────────────────────────────────────────
  useRequireProfile();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuthStore();  
  
  // ── state for dashboard data ──────────────────────────────
  const [avatars, setAvatars] = useState<Avatars[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitles[]>([]);
  const [contracts, setContracts] = useState<Contracts[]>([]);
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
  });  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      if (!user?.id) return;
      setLoading(true);
      setError(null);

      try {
        // Get the profile from the store
        if (!profile) {
          setLoading(false);
          return;
        }

        // Load avatars (used in modal)
        const { data: avatarsData } = await supabase
          .rpc('get_avatars_for_profile', { _profile_id: user.id });        setAvatars((avatarsData as unknown as Avatars[]) || []);

        // Load organizations and job titles for editing
        const [{ data: orgsData }, { data: jobsData }] = await Promise.all([
          supabase.rpc('get_organizations'),
          supabase.rpc('get_job_titles')
        ]);
        setOrganizations((orgsData as unknown as Organization[]) || []);
        setJobTitles((jobsData as unknown as JobTitles[]) || []);

        // Get user's contracts
        const { data: userContracts, error: ucErr } = await supabase
          .rpc('get_user_contracts', { _user_id: user.id });

        if (ucErr) {
          console.error("Error loading user contracts:", ucErr);
          toast.error("Failed to load contracts");
          setLoading(false);
          return;
        }

        const contractIds = userContracts?.map(uc => uc.contract_id) || [];

        if (contractIds.length === 0) {
          setContracts([]);
          setMetrics({
            activeContracts: 0,
            openIssues: 0,
            pendingInspections: 0,
          });
          setLoading(false);
          return;
        }

        // Get all contracts for the user
        const { data: contractsData, error: contractsErr } = await supabase
          .from("contracts")
          .select("*")
          .in("id", contractIds)
          .order("created_at", { ascending: false });

        if (contractsErr) {
          console.error("Error loading contracts:", contractsErr);
          toast.error("Failed to load contracts");
          setLoading(false);
          return;
        }

        setContracts((contractsData as unknown as Contracts[]) || []);

        // Get dashboard metrics using the RPC
        const { data: metricsData, error: metricsErr } = await supabase
          .rpc('get_dashboard_metrics', { _user_id: user.id });

        if (metricsErr) {
          console.error("Error loading metrics:", metricsErr);
          toast.error("Failed to load dashboard metrics");
        } else if (metricsData && metricsData.length > 0) {
          setMetrics({
            activeContracts: metricsData[0].active_contracts || 0,
            openIssues: metricsData[0].total_issues || 0,
            pendingInspections: metricsData[0].total_inspections || 0,
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

    loadData();
  }, [user, profile]);

  // ── profile editing functions ───────────────────────────
  // Initialize form when profile is available
  useEffect(() => {
    if (profile) {
      setEditForm({
        avatar_id: profile.avatar_id || '',
        organization_id: profile.organization_id || '',
        job_title_id: profile.job_title_id || '',
        address: profile.location || '',
        phone: profile.phone || '',
        email: profile.email || '',
        custom_job_title: profile.job_title || '',
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
      if (selectedImage && croppedAreaPixels) {
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
      toast.error("Failed to update profile");    } finally {
      // No need to set state as we're using a local variable
    }
  };

  // ── contract filtering ──────────────────────────────────
  const { searchQuery, filteredContracts, handleSearchChange } =
    useContractFiltering(contracts);

  // ── guard states ────────────────────────────────────────
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (error) {
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
    email: profile.email || '',
    username: profile.username,
    phone: profile.phone,
    location: profile.location,
    avatar_id: profile.avatar_id,
    avatar_url: profile.avatar_url,
    organization_id: profile.organization_id,
    job_title_id: profile.job_title_id,
    organizations: profile.organization_name ? {
      name: profile.organization_name,
      address: null,
      phone: null,
      website: null
    } : null,
    job_titles: profile.job_title ? {
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
          onSaveProfile={handleSaveProfile}
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