import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import ContractCreation from './pages/ContractCreation';
import { ContractDashboard } from './pages/ContractDashboard';
import { ResetPassword } from './pages/ResetPassword';
import { UserOnboarding } from './pages/UserOnboarding';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Analytics } from '@vercel/analytics/react';
import { useAuthStore } from './lib/store';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { v4 as uuidv4 } from 'uuid';

function DemoRedirect() {
  const { setUser, setProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupDemoUser = async () => {
      try {
        setLoading(true);
        
        // Step 1: Sign in the demo user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'test123',
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Failed to authenticate demo user');
        }

        // Set the user immediately after authentication
        setUser(authData.user);

        // Step 2: Generate session ID for demo data
        const sessionId = uuidv4();

        // Step 3: Create demo data with error handling
        const { error: cloneError } = await supabase.rpc('create_clone_for_test_user', {
          session_id: sessionId
        });

        if (cloneError) {
          console.error('Clone error:', cloneError);
          throw new Error('Failed to create demo environment');
        }

        // Store session ID for cleanup later
        localStorage.setItem('demo_session_id', sessionId);

        // Step 4: Fetch user profile with retries
        let attempts = 0;
        const maxAttempts = 3;
        let profileData = null;

        while (attempts < maxAttempts && !profileData) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select(`
              id,
              role,
              full_name,
              email,
              username,
              phone,
              location,
              organization_id,
              job_title_id,
              organizations (
                id,
                name,
                address,
                phone,
                website
              ),
              job_titles (
                id,
                title
              )
            `)
            .eq('id', authData.user.id)
            .maybeSingle();

          if (!profileError && profile) {
            profileData = profile;
            break;
          }

          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }

        if (!profileData) {
          throw new Error('Failed to fetch user profile');
        }

        // Step 5: Update profile in store
        setProfile({
          role: profileData.role || 'Admin',
          fullName: profileData.full_name || 'Demo User',
          email: profileData.email,
          phone: profileData.phone || '',
          location: profileData.location || '',
          company: profileData.organizations?.name || 'Demo Organization',
          username: profileData.username || 'demo_user',
          jobTitleId: profileData.job_title_id,
          organizationId: profileData.organization_id
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

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<UserOnboarding />} />
        <Route path="/demo" element={<DemoRedirect />} />
        <Route path="/demo/create" element={<ContractCreation />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <ProtectedRoute>
              <ContractDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}