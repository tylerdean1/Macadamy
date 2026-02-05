import { useState } from 'react';
import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useProfileDashboardPayload } from '@/hooks/useProfileDashboardPayload';

import { Page } from '@/components/Layout';
import { PageContainer } from '@/components/Layout';
import { ProfileSection } from './StandardPageComponents/ProfileSection';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';
import { EditProfileModal } from './StandardPageComponents/EditProfileModal';

export default function Dashboard() {
  useRequireProfile(); // Ensures user is logged in and profile exists

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    profile,
    projects,
    metrics,
    loading,
    error: dashboardError,
  } = useProfileDashboardPayload();
  // Explicitly check for non-empty error strings and provide a default empty string if none are found.
  // Fix: Remove null/undefined from array before .find()
  // Final fix: filter out null/undefined and empty strings before .find()
  const errorList = [dashboardError].filter((e): e is string => typeof e === 'string' && e != null && e.trim() !== '');
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
          profile={profile}
          onClose={() => setIsModalOpen(false)}
        />

        <DashboardMetrics
          activeContracts={metrics.activeContracts}
          openIssues={metrics.openIssues}
          pendingInspections={metrics.pendingInspections}
        />

        {/* Simplified projects display */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Status: {project.status || 'Unknown'}</span>
                  {project.start_date && <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </Page>
  );
}