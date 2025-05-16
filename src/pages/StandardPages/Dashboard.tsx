import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useAuthStore } from '@/lib/store';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useProfileEdit } from '@/hooks/useProfileEdit';
import { useContractFiltering } from '@/hooks/useContractFiltering';

import { ProfileSection } from './StandardPageComponents/ProfileSelction';
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import { ContractsSection } from './StandardPageComponents/ContractsSection';
import { PageContainer } from './StandardPageComponents/PageContainer';

export function Dashboard() {
  // ── auth + nav ───────────────────────────────────────────
  useRequireProfile();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  // ── debug ────────────────────────────────────────────────
  console.log('[DEBUG] Dashboard - profile state:', {
    userExists: !!user,
    profileExists: !!profile,
    profileId: profile?.id,
  });

  // ── custom hooks for data and profile editing ────────────
  const {
    avatars,
    organizations,
    jobTitles,
    contracts,
    metrics,
    loading: dashboardLoading, // <- trailing comma required
  } = useDashboardData();

  const {
    isModalOpen,
    setIsModalOpen,
    editForm,
    selectedImage,
    crop,
    zoom,
    croppedAreaPixels,
    initializeForm,
    handleFormChange,
    handleAvatarUpload,
    handleAvatarSelect,
    handleSaveProfile,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
  } = useProfileEdit(user?.id);

  // ── contract filtering ──────────────────────────────────
  const { searchQuery, filteredContracts, handleSearchChange } =
    useContractFiltering(contracts);

  // ── initialise profile form when profile arrives ────────
  React.useEffect(() => {
    if (profile) initializeForm(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ── custom org "create-new" handler ─────────────────────
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

  // ── guard states ────────────────────────────────────────
  if (dashboardLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No profile found
      </div>
    );
  }

  // ── main render ─────────────────────────────────────────
  const avatarUrl = profile.avatars ? profile.avatars.url : null;

  return (
    <div className="min-h-screen bg-background">
      <PageContainer>
        <ProfileSection profile={profile} onEdit={() => setIsModalOpen(true)} />

        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          avatars={avatars}
          profileAvatarUrl={avatarUrl}
          organizations={organizations}
          jobTitles={jobTitles}
          editForm={editForm}
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