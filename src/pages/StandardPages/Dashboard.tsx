import { useState } from 'react';
import { useRequireProfile } from '@/hooks/useRequireProfile';
import { useProfileData } from '@/hooks/useProfileData';
import { useProjectsData } from '@/hooks/useProjectsData';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

import { Page } from '@/components/Layout';
import { PageContainer } from '@/components/Layout';
import { ProfileSection } from './StandardPageComponents/ProfileSection';
import { DashboardMetrics } from './StandardPageComponents/DashboardMetrics';

export default function Dashboard() {
  useRequireProfile(); // Ensures user is logged in and profile exists

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { profile } = useProfileData();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjectsData();

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useDashboardMetrics();

  const loading = projectsLoading || metricsLoading;
  // Explicitly check for non-empty error strings and provide a default empty string if none are found.
  // Fix: Remove null/undefined from array before .find()
  // Final fix: filter out null/undefined and empty strings before .find()
  const errorList = [projectsError, metricsError].filter((e): e is string => typeof e === 'string' && e != null && e.trim() !== '');
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

        {/* Simplified modal placeholder */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
              <p className="text-gray-600 mb-4">Profile editing functionality will be implemented with simplified interface.</p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

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