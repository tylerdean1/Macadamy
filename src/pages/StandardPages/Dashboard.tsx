import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useProfileData } from '@/hooks/useProfileData';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

import { Page } from './StandardPageComponents/Page';
import { PageContainer } from './StandardPageComponents/PageContainer';
import { ProfileSection } from './StandardPageComponents/ProfileSection';
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import type { Area } from 'react-easy-crop'; // Ensure this type is available or defined if needed by EditProfileModal directly

export default function Dashboard() {
  useRequireProfile(); // Ensures user is logged in and profile exists

  const {
    profile,
    organizations,
    avatars,
    jobTitles,
    loading: profileLoading,
    error: profileError,
    isModalOpen,
    setIsModalOpen,
    editForm,
    selectedImage,
    crop,
    zoom,
    croppedAreaPixels,
    handleCustomFormChange,
    handleAvatarSelect,
    handleRawImageSelected,
    handleImageCroppedAndUpload,
    handleSaveProfile,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
  } = useProfileData();


  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics();

  const loading = profileLoading || metricsLoading;
  // Explicitly check for non-empty error strings and provide a default empty string if none are found.
  // Fix: Remove null/undefined from array before .find()
  // Final fix: filter out null/undefined and empty strings before .find()
  const errorList = [profileError, metricsError].filter((e): e is string => typeof e === 'string' && e != null && e.trim() !== '');
  const combinedError = errorList.length > 0 ? errorList[0] : null;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (combinedError !== null && combinedError !== '') { // Check if combinedError is a non-empty string
    return <div className="min-h-screen flex items-center justify-center">Error: {combinedError}</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">No profile found.</div>;
  }

  return (
    <Page>
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
          editForm={{ // Ensure editForm structure matches EditProfileModalProps
            username: editForm.username,
            full_name: editForm.full_name,
            avatar_id: editForm.avatar_id ?? undefined, // Ensure optional fields are handled
            organization_id: editForm.organization_id ?? undefined,
            job_title_id: editForm.job_title_id ?? undefined,
            email: editForm.email ?? undefined,
            custom_job_title: editForm.custom_job_title ?? undefined,
            phone: editForm.phone ?? undefined,
          }}
          selectedImage={selectedImage}
          crop={crop}
          zoom={zoom}
          croppedAreaPixels={croppedAreaPixels}
          onAvatarSelect={handleAvatarSelect}
          onRawImageSelected={handleRawImageSelected}
          onImageCroppedAndUpload={handleImageCroppedAndUpload}
          onCropChange={setCrop} // Pass down setters
          onZoomChange={setZoom}
          onCropComplete={(_: Area, area: Area) => setCroppedAreaPixels(area)} // Pass down setter
          onFormChange={handleCustomFormChange} // Using handleCustomFormChange as it includes create-new logic
          onSaveProfile={() => {
            void handleSaveProfile();
          }}
        />

        <DashboardMetrics
          activeContracts={metrics.activeContracts}
          openIssues={metrics.openIssues}
          pendingInspections={metrics.pendingInspections}
        />

      </PageContainer>
    </Page>
  );}