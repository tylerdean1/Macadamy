// React and React Libraries
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import ContractCreation from './pages/ContractCreation';
import { ContractDashboard } from './pages/ContractDashboard';
import { ResetPassword } from './pages/ResetPassword';
import { UserOnboarding } from './pages/UserOnboarding';
import { ContractSettings } from './pages/ContractSettings';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Badge } from '@/components/ui/badge';

// Utilities and Libraries
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './lib/supabase';
import { Toaster } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Store and Hooks
import { useAuthStore } from './lib/store';
import { useBootstrapAuth } from './hooks/useBootstrapAuth';

// Types and Helpers
import type { Database } from './lib/database.types';
import { validateUserRole } from './lib/utils/validate-user-role';
import { Organization, JobTitle } from './lib/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileQueryResult = ProfileRow & {
  user_role: Database['public']['Enums']['user_role'];
  organizations?: Organization;
  job_titles?: JobTitle;
  is_demo_user?: boolean;
};

function DemoRedirect() {
  const { setUser, setProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const profile = useAuthStore((state) => state.profile);

  useEffect(() => {
    const setupDemoUser = async () => {
      try {
        setLoading(true);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'test123',
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Failed to authenticate demo user');
        }

        setUser(authData.user);

        const sessionId = uuidv4();
        const { error: cloneError } = await supabase.rpc('create_clone_for_test_user', {
          session_id: sessionId,
        });

        if (cloneError) throw new Error('Failed to create demo environment');
        localStorage.setItem('demo_session_id', sessionId);

        let attempts = 0;
        const maxAttempts = 3;
        let profileData: ProfileQueryResult | null = null;

        while (attempts < maxAttempts && !profileData) {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select(`
              id,
              user_role,
              full_name,
              email,
              username,
              phone,
              location,
              avatar_url,
              avatar_id,
              organization_id,
              job_title_id,
              is_demo_user,
              organizations (
                id,
                name,
                address,
                phone,
                website
              ),
              job_titles (
                id,
                title,
                is_custom
              )
            `)
            .eq('id', authData.user.id)
            .maybeSingle<ProfileQueryResult>();

          if (!profileError && data) {
            profileData = data;
            break;
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
          }
        }

        if (!profileData) {
          throw new Error('Failed to fetch user profile');
        }

        setProfile({
          id: profileData.id,
          user_role: validateUserRole(profileData.user_role),
          full_name: profileData.full_name ?? 'Demo User',
          email: profileData.email,
          username: profileData.username ?? 'demo_user',
          phone: profileData.phone ?? '',
          location: profileData.location ?? '',
          avatar_id: profileData.avatar_id ?? '',
          avatar_url: profileData.avatar_url ?? '',
          organization_id: profileData.organization_id ?? '',
          job_title_id: profileData.job_title_id ?? '',
          is_demo_user: profileData.is_demo_user ?? false,
          organizations: profileData.organizations
            ? {
                name: profileData.organizations.name ?? 'Demo Organization',
                address: profileData.organizations.address ?? '',
                phone: profileData.organizations.phone ?? '',
                website: profileData.organizations.website ?? '',
              }
            : {
                name: 'Demo Organization',
                address: '',
                phone: '',
                website: '',
              },
          job_titles: profileData.job_titles
            ? {
                title: profileData.job_titles.title ?? '',
                is_custom: profileData.job_titles.is_custom ?? false,
              }
            : {
                title: '',
                is_custom: false,
              },
        });

        setLoading(false);
      } catch (error) {
        console.error('Demo setup error:', error);
        setError(error instanceof Error ? error.message : 'Failed to setup demo environment');
        setLoading(false);
      }
    };

    setupDemoUser();
  }, [setUser, setProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">Setting up demo environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background-light p-8 rounded-lg border border-background-lighter max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Demo Setup Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {profile?.is_demo_user && (
        <div className="w-full text-center bg-yellow-400/90 text-black py-2 text-sm">
          <Badge className="bg-black/80 text-yellow-300 border border-black/40 px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide">
            DEMO USER
          </Badge>{' '}
          — You are in a sandbox environment. Changes will be wiped after 24 hours.
        </div>
      )}
      <Navigate to="/dashboard" replace />
    </>
  );
}

export default function App() {
  const isLoading = useBootstrapAuth();
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/reset-password', '/onboarding'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 mt-4">Loading Macadamy...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<UserOnboarding />} />
        <Route path="/demo" element={<DemoRedirect />} />
        <Route path="/demo/create" element={<ContractCreation />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/contracts/:id" element={
          <ProtectedRoute>
            <ContractDashboard />
          </ProtectedRoute>
        } />
        <Route path="/contracts/:id/contractsettings" element={
          <ProtectedRoute>
            <ContractSettings />
          </ProtectedRoute>
        } />
      </Routes>
      <Analytics />
    </>
  );
}
