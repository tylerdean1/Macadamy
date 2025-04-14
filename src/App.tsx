import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // Import routing components from React Router
import { LandingPage } from './pages/LandingPage'; // Import landing page component
import { Dashboard } from './pages/Dashboard'; // Import dashboard component
import ContractCreation from './pages/ContractCreation'; // Import contract creation component
import { ContractDashboard } from './pages/ContractDashboard'; // Import contract dashboard component
import { ResetPassword } from './pages/ResetPassword'; // Import password reset component
import { UserOnboarding } from './pages/UserOnboarding'; // Import user onboarding component
import { ProtectedRoute } from './components/ProtectedRoute'; // Import protected route component
import { Navbar } from './components/Navbar'; // Import navigation bar component
import { Analytics } from '@vercel/analytics/react'; // Import analytics component
import { useEffect, useState } from 'react'; // Import hooks from React
import { supabase } from './lib/supabase'; // Import Supabase client
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { Toaster } from 'sonner'; // Import toaster component for notifications
import { ContractSettings } from './pages/ContractSettings'; // Import contract settings component
import { useAuthStore } from './lib/store'; // Import auth store for user state management

/**
 * DemoRedirect Component for setting up a demo user account.
 * 
 * This component handles the demo user authentication, setup of 
 * a demo environment including a profile clone, and redirects the 
 * user to the dashboard upon successful setup. It manages loading 
 * and error states during the setup process, providing user feedback 
 * via toast notifications.
 */
function DemoRedirect() {
  const { setUser, setProfile } = useAuthStore(); // Retrieve user state management functions
  const [error, setError] = useState<string | null>(null); // State variable for error messages
  const [loading, setLoading] = useState(true); // State variable for loading indicator

  useEffect(() => {
    // Function to set up demo user
    const setupDemoUser = async () => {
      try {
        setLoading(true); // Set loading state to true

        // Attempt to authenticate demo user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'test@test.com', // Demo email
          password: 'test123', // Demo password
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Failed to authenticate demo user'); // Throw error if failed to auth
        }

        setUser(authData.user); // Set user state

        const sessionId = uuidv4(); // Generate a new session identifier

        // Run a stored procedure to create a clone of the demo user profile
        const { error: cloneError } = await supabase.rpc('create_clone_for_test_user', {
          session_id: sessionId // Pass session ID to procedure
        });

        if (cloneError) {
          console.error('Clone error:', cloneError);
          throw new Error('Failed to create demo environment'); // Handle error
        }

        localStorage.setItem('demo_session_id', sessionId); // Store session ID in local storage

        // Fetch the user's profile with retries to handle potential delays
        let attempts = 0;
        const maxAttempts = 3; // Set maximum attempts
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
            .eq('id', authData.user.id) // Match profile ID
            .maybeSingle();

          if (!profileError && profile) {
            profileData = profile; // Assign fetched profile data
            break; // Exit loop
          }

          attempts++; // Increment attempt counter
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Delay before next attempt
          }
        }

        if (!profileData) {
          throw new Error('Failed to fetch user profile'); // Handle error if fetching profile fails
        }

        // Set user profile state with fetched data
        setProfile({
          role: profileData.role || 'Admin', // Default to 'Admin' role if not available
          fullName: profileData.full_name || 'Demo User', // Default full name if not available
          email: profileData.email, // User email
          phone: profileData.phone || '', // User phone, default to empty if not available
          location: profileData.location || '', // User location, default to empty if not available
          company: profileData.organizations?.[0]?.name || 'Demo Organization', // Default company name if not available
          username: profileData.username || 'demo_user', // Default username if not available
          jobTitleId: profileData.job_title_id, // Job title ID
          organizationId: profileData.organization_id // Organization ID
        });

        setLoading(false); // Reset loading state
      } catch (error) {
        console.error('Demo setup error:', error); // Log error for debugging
        setError(error instanceof Error ? error.message : 'Failed to setup demo environment'); // Set error state
        setLoading(false); // Reset loading state
      }
    };

    setupDemoUser(); // Call setup function
  }, [setUser, setProfile]); // Dependencies

  // If loading, show a spinner
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

  // If there's an error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-background-light p-8 rounded-lg border border-background-lighter max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Demo Setup Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'} // Redirect to home
            className="w-full bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if setup is successful
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" /> {/* Toast notifications */}
      <BrowserRouter>
        <Navbar /> {/* Navigation bar */}
        <Routes>
          <Route path="/" element={<LandingPage />} /> // Landing page route
          <Route path="/reset-password" element={<ResetPassword />} /> // Password reset route
          <Route path="/onboarding" element={<UserOnboarding />} /> // User onboarding route
          <Route path="/demo" element={<DemoRedirect />} /> // Demo user setup route
          <Route path="/demo/create" element={<ContractCreation />} /> // Contract creation demo route
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard /> // Protected dashboard route
            </ProtectedRoute>
          } />
          <Route path="/contracts/:id" element={
            <ProtectedRoute>
              <ContractDashboard /> // Protected contract dashboard route
            </ProtectedRoute>
          } />
          <Route path="/contracts/:id/contractsettings" element={
            <ProtectedRoute>
              <ContractSettings /> // Protected contract settings route
            </ProtectedRoute>
          } />
        </Routes>
        <Analytics /> {/* Analytics tracking */}
      </BrowserRouter>
    </>
  );
}