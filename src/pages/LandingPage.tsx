import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Clock, Users, ClipboardList, PenTool as Tool, FileText, TrendingUp, Truck, Settings, ChevronRight } from 'lucide-react';
import { AuthForm } from '../components/AuthForm';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-12 h-12 text-primary"
        >
          <path d="M8 8h6v4H8z" />
          <path d="M14 6h3v6h-3z" />
          <path d="M2 12L4 16H8" />
          <path d="M2 12H8" />
          <path d="M2 12L4 8H8" />
          <path d="M4 8v8" />
          <path d="M8 12v4" />
          <path d="M17 12v4" />
          <path d="M8 16h9" />
          <path d="M8 14h9" />
          <circle cx="10" cy="15" r="0.5" />
          <circle cx="12.5" cy="15" r="0.5" />
          <circle cx="15" cy="15" r="0.5" />
          <path d="M16 6v-2" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-sm rounded-full" />
      </div>
      <span className="text-2xl font-bold text-white">Macadamy</span>
    </div>
  );
}

// Define the props for each feature section
type FeatureSectionProps = {
  title: string;
  description: string;
  icon: React.ReactNode; // Icon for the section
  features: string[]; // List of features for this section
};

// Component to display individual feature sections
function FeatureSection({ title, description, icon, features }: FeatureSectionProps) {
  return (
    <div className="bg-background-light p-6 rounded-lg border border-background-lighter hover:border-primary transition-colors">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <ChevronRight className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(true); // State for tracking login/signup mode
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [success, setSuccess] = useState<string | null>(null); // State for success messages
  const navigate = useNavigate(); // Hook for navigation
  const { setUser, clearAuth, setProfile } = useAuthStore(); // Get auth store methods

  // Handle authentication for logging in or signing up
  const handleAuth = async (identifier: string, password: string) => {
    try {
      setError(null); // Reset error state
      setSuccess(null); // Reset success state

      if (isLogin) {
        const isEmail = identifier.includes('@'); // Check if the identifier is an email
        let email = identifier;

        if (!isEmail) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', identifier.toLowerCase())
            .single();

          if (profileError || !profileData?.email) {
            throw new Error('Invalid username or password');
          }

          email = profileData.email;
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError; // Handle sign-in errors

        if (signInData.user) {
          // If logged in with a test account, create a test session
          if (signInData.user.email === 'test@test.com') {
            const sessionId = uuidv4();
            const { error: cloneError } = await supabase.rpc('create_clone_for_test_user', {
              session_id: sessionId,
            });

            if (cloneError) {
              console.error('❌ Failed to clone contract for test user:', cloneError.message);
            } else {
              console.log('✅ Cloned contract for test session:', sessionId);
              localStorage.setItem('test_session_id', sessionId);
            }
          }

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single();

          if (profileData) {
            setUser(signInData.user); // Set user in auth store
            setProfile({
              role: profileData.role,
              fullName: profileData.full_name,
              email: profileData.email,
              phone: profileData.phone || '',
              location: profileData.location || '',
              company: profileData.company || '',
              username: profileData.username || '',
              jobTitleId: profileData.job_title_id,
              organizationId: profileData.organization_id
            });
            navigate('/dashboard'); // Redirect to dashboard
          } else {
            navigate('/onboarding'); // Redirect to onboarding if no profile found
          }
        }
      } else {
        if (!identifier.includes('@')) {
          throw new Error('Please enter a valid email address');
        }

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', identifier)
          .maybeSingle();

        if (existingProfile) {
          throw new Error('An account with this email already exists');
        }

        // Sign up a new user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
        });

        if (signUpError) throw signUpError; // Handle sign-up errors

        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: identifier,
              role: 'Contractor', // Default role
              full_name: ''
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error('Error creating user profile');
          }

          setUser(signUpData.user); // Set user in auth store
          navigate('/onboarding'); // Redirect to onboarding
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Authentication error:', err);
      setError(err.message);
      clearAuth(); // Clear auth on error
    }    
  };

  const handleForgotPassword = async (email: string) => {
    try {
      setError(null); // Reset error state
      setSuccess(null); // Reset success state

      // Send password reset instructions to the user
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error; // Handle errors during reset

      setSuccess('Password reset instructions have been sent to your email'); // Notify the user
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Reset password error:', err);
      setError('Error sending reset instructions. Please try again.'); // Alert of any failures
    }
  };

  const handleDevLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'test123',
      });

      if (error) {
        console.error('Demo login failed:', error.message);
        return;
      }

      const sessionId = uuidv4(); // Create a session ID for the test user
      const { error: cloneError } = await supabase.rpc('create_clone_for_test_user', {
        session_id: sessionId
      });

      if (cloneError) {
        console.error('Clone failed:', cloneError.message);
        return;
      }

      localStorage.setItem('test_session_id', sessionId); // Store the session ID

      // Fetch profile with retries
      let profileData = null;
      let attempts = 0;
      const maxAttempts = 3;

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
              name,
              address,
              phone,
              website
            )
          `)
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profileError && profile) {
          profileData = profile;
          break;
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Wait before retrying
        }
      }

      if (!profileData) {
        console.error('Failed to fetch profile data');
        return;
      }

      useAuthStore.getState().setUser(data.user); // Set user in the auth store
      useAuthStore.getState().setProfile({
        role: profileData.role,
        fullName: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone || '',
        location: profileData.location || '',
        company: profileData.organizations?.[0]?.name || '',
        username: profileData.username || '',
        jobTitleId: profileData.job_title_id,
        organizationId: profileData.organization_id
      });

      navigate('/dashboard'); // Redirect to the dashboard
    } catch (error) {
      console.error('Demo setup failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background-light border-b border-background-lighter">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12">
            <Logo />
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
                Complete Construction<br />
                <span className="text-primary">Project Management</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Streamline your construction projects with our comprehensive management system.
                Track materials, labor, equipment, and more in one unified platform.
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleDevLogin}
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Try Demo Project
                </button>
                {import.meta.env.DEV && (
                  <button
                    onClick={handleDevLogin}
                    className="bg-secondary hover:bg-secondary-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Dev Login
                  </button>
                )}
              </div>
            </div>
            <div className="lg:w-1/2 w-full max-w-md">
              {error && <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>}
              {success && <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">{success}</div>}
              <AuthForm
                isLogin={isLogin}
                onSubmit={handleAuth}
                onToggleMode={() => setIsLogin(!isLogin)}
                onForgotPassword={handleForgotPassword}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Comprehensive Project Management</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureSection
            icon={<ClipboardList className="w-8 h-8" />}
            title="Contract Management"
            description="Efficiently manage contracts and work breakdown structures"
            features={['Detailed contract tracking', 'WBS organization', 'Line item management', 'Change order tracking']}
          />
          <FeatureSection
            icon={<Truck className="w-8 h-8" />}
            title="Resource Tracking"
            description="Monitor all project resources in real-time"
            features={['Material inventory', 'Equipment usage logs', 'Labor tracking', 'Supplier management']}
          />
          <FeatureSection
            icon={<Tool className="w-8 h-8" />}
            title="Field Operations"
            description="Manage day-to-day field activities"
            features={['Daily work logs', 'Field measurements', 'Equipment scheduling', 'Safety incident tracking']}
          />
          <FeatureSection
            icon={<FileText className="w-8 h-8" />}
            title="Quality Control"
            description="Maintain high standards with comprehensive QC tools"
            features={['Inspection reports', 'Quality checklists', 'Issue tracking', 'Photo documentation']}
          />
          <FeatureSection
            icon={<TrendingUp className="w-8 h-8" />}
            title="Progress Monitoring"
            description="Track project progress and performance"
            features={['Progress tracking', 'Cost monitoring', 'Schedule updates', 'Performance metrics']}
          />
          <FeatureSection
            icon={<Settings className="w-8 h-8" />}
            title="Project Tools"
            description="Specialized tools for construction management"
            features={['Quantity calculators', 'Cost estimators', 'Schedule planners', 'Document templates']}
          />
        </div>
      </div>

      <div className="bg-background-light border-t border-background-lighter py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <Building2 className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">All-in-One Solution</h3>
              <p className="text-gray-400">Everything you need to manage construction projects in one place</p>
            </div>
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Secure & Reliable</h3>
              <p className="text-gray-400">Enterprise-grade security and data protection</p>
            </div>
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <Clock className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real-time Updates</h3>
              <p className="text-gray-400">Instant access to project data and updates</p>
            </div>
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Team Collaboration</h3>
              <p className="text-gray-400">Seamless communication between all project stakeholders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}