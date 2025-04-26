import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ShieldCheck, Clock, Users, ClipboardList,
  PenTool as Tool, FileText, TrendingUp, Truck, Settings, ChevronRight
} from 'lucide-react';
import { AuthForm } from '../components/AuthForm';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';
import { validateUserRole } from '../lib/utils/validate-user-role';
import { toast } from 'react-hot-toast';

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

type FeatureSectionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
};

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
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, clearAuth } = useAuthStore();

  const handleAuth = async (identifier: string, password: string) => {
    try {
      setError(null);
      setSuccess(null);

      if (isLogin) {
        const isEmail = identifier.includes('@');
        let email = identifier.trim();

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

        if (signInError) throw signInError;

        if (signInData.user) {
          const sessionId = uuidv4();
          console.log('Generated Session ID:', sessionId);
        
          console.log('Trying to fetch profile for user ID:', signInData.user.id);

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select(`
              id,
              role,
              full_name,
              email,
              username,
              phone,
              location,
              avatar_id,
              job_title_id,
              organization_id,
              avatars:avatar_id (
                url,
                is_preset
              ),
              organizations:organization_id (
                name,
                address,
                phone,
                website
              ),
              job_titles:job_title_id (
                title,
                is_custom
              )
            `)
            .eq('id', signInData.user.id)
            .single();
        
          if (profileError || !profileData) {
            console.error('Failed to fetch profile data:', profileError?.message || 'No data found');
            return;
          }
        
          const { setUser, setProfile } = useAuthStore.getState();
          setUser(signInData.user);
          setProfile({
            id: profileData.id,
            user_role: validateUserRole(profileData.role),
            full_name: profileData.full_name,
            email: profileData.email,
            phone: profileData.phone || '',
            location: profileData.location || '',
            organization_id: profileData.organization_id || '',
            username: profileData.username || '',
            job_title_id: profileData.job_title_id,
            avatar_id: profileData.avatar_id || null,
            avatar_url: profileData.avatars?.url || null,
            avatars: profileData.avatars
              ? {
                  url: profileData.avatars.url,
                  is_preset: profileData.avatars.is_preset,
                }
              : null,
            organizations: profileData.organizations || null,
            job_titles: profileData.job_titles
              ? {
                  title: profileData.job_titles.title,
                  is_custom: profileData.job_titles.is_custom,
                }
              : null,
          });
        
          navigate('/dashboard');
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

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: signUpData.user.id,
            email: identifier,
            role: 'Contractor',
            full_name: '',
            created_at: new Date().toISOString(), // ✅ add this line
          });
        
          if (profileError) throw new Error('Error creating user profile');
        
          setUser(signUpData.user);
          navigate('/onboarding');
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Authentication error:', err);
      setError(err.message);
      clearAuth();
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      setError(null);
      setSuccess(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess('Password reset instructions have been sent to your email');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Reset password error:', err);
      setError('Error sending reset instructions. Please try again.');
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
              <div className="flex justify-center mt-2">
                <button
                  onClick={async () => {
                    try {
                      const sessionId = uuidv4();
                      const uuid = uuidv4();
                      const email = `demo-${uuid}@macadamy.io`;
                      const password = crypto.randomUUID().slice(0, 20);
                  
                      // 1. Sign up temporary user
                      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                      });
                  
                      if (signUpError || !signUpData?.user) {
                        console.error('Demo signup failed:', signUpError?.message);
                        toast.error("Demo signup failed. Please try again.");
                        return;
                      }
                  
                      const { id: userId } = signUpData.user;
                  
                      // 2. Call edge function to fully clone demo environment
                      const { error: cloneError } = await supabase.functions.invoke('clone_demo_environment', {
                        body: {
                          session_id: sessionId,
                          user_id: userId,
                        },
                      });
                  
                      if (cloneError) {
                        console.error('Edge function clone failed:', cloneError.message);
                        toast.error("Demo environment setup failed. Please try again.");
                        return;
                      }
                  
                      toast.success("Demo environment ready! Redirecting...");

                      // 3. Wait for session propagationconsole.error('Demo signup failed:',
                      await new Promise((r) => setTimeout(r, 500));
                  
                      // 4. Fetch full profile with joins
                      const { data: userData, error: userError } = await supabase.auth.getUser();
                      if (userError || !userData?.user?.id) {
                        toast.error("Failed to fetch user after setup.");
                        console.error('No user found after clone:', userError?.message);
                        return;
                      }
                  
                      const { data: profileData, error: fetchError } = await supabase
                        .from('profiles')
                        .select(`
                          id,
                          role,
                          full_name,
                          email,
                          username,
                          phone,
                          location,
                          avatar_id,
                          job_title_id,
                          organization_id,
                          avatars:avatar_id (
                            url,
                            is_preset
                          ),
                          organizations:organization_id (
                            name,
                            address,
                            phone,
                            website
                          ),
                          job_titles:job_title_id (
                            title,
                            is_custom
                          )
                        `)
                        .eq('id', userData.user.id)
                        .single();
                  
                      if (fetchError) {
                        console.error(`Failed to fetch profile for cloned user ${userData.user.id}:`, fetchError.message);
                        return;
                      }
                  
                      // 5. Set auth state and redirect
                      const { setUser, setProfile } = useAuthStore.getState();
                      setUser(userData.user);
                      setProfile({
                        id: profileData.id,
                        user_role: validateUserRole(profileData.role),
                        full_name: profileData.full_name,
                        email: profileData.email,
                        phone: profileData.phone || '',
                        location: profileData.location || '',
                        organization_id: profileData.organization_id || '',
                        username: profileData.username || '',
                        job_title_id: profileData.job_title_id,
                        avatar_id: profileData.avatar_id || null,
                        avatar_url: profileData.avatars?.url || null,
                        avatars: profileData.avatars
                          ? {
                              url: profileData.avatars.url,
                              is_preset: profileData.avatars.is_preset,
                            }
                          : null,
                        organizations: profileData.organizations || null,
                        job_titles: profileData.job_titles
                          ? {
                              title: profileData.job_titles.title,
                              is_custom: profileData.job_titles.is_custom,
                            }
                          : null,
                      });
                  
                      localStorage.setItem('test_session_id', sessionId);
                      navigate('/dashboard');
                    } catch (err) {
                      console.error('Try demo setup failed:', err);
                    }
                  }}
                  className="bg-yellow-400/10 text-yellow-300 border border-yellow-300 hover:bg-yellow-400 hover:text-black font-semibold text-sm px-6 py-2 rounded-md transition-colors"
                >
                  Try Demo Project
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 w-full max-w-md">
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                  {success}
                </div>
              )}
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
            features={[
              'Detailed contract tracking',
              'WBS organization',
              'Line item management',
              'Change order tracking',
            ]}
          />
          <FeatureSection
            icon={<Truck className="w-8 h-8" />}
            title="Resource Tracking"
            description="Monitor all project resources in real-time"
            features={[
              'Material inventory',
              'Equipment usage logs',
              'Labor tracking',
              'Supplier management',
            ]}
          />
          <FeatureSection
            icon={<Tool className="w-8 h-8" />}
            title="Field Operations"
            description="Manage day-to-day field activities"
            features={[
              'Daily work logs',
              'Field measurements',
              'Equipment scheduling',
              'Safety incident tracking',
            ]}
          />
          <FeatureSection
            icon={<FileText className="w-8 h-8" />}
            title="Quality Control"
            description="Maintain high standards with comprehensive QC tools"
            features={[
              'Inspection reports',
              'Quality checklists',
              'Issue tracking',
              'Photo documentation',
            ]}
          />
          <FeatureSection
            icon={<TrendingUp className="w-8 h-8" />}
            title="Progress Monitoring"
            description="Track project progress and performance"
            features={[
              'Progress tracking',
              'Cost monitoring',
              'Schedule updates',
              'Performance metrics',
            ]}
          />
          <FeatureSection
            icon={<Settings className="w-8 h-8" />}
            title="Project Tools"
            description="Specialized tools for construction management"
            features={[
              'Quantity calculators',
              'Cost estimators',
              'Schedule planners',
              'Document templates',
            ]}
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
              <p className="text-gray-400">
                Everything you need to manage construction projects in one place
              </p>
            </div>
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Secure & Reliable</h3>
              <p className="text-gray-400">
                Enterprise-grade security and data protection
              </p>
            </div>
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <Clock className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Real-time Updates</h3>
              <p className="text-gray-400">
                Instant access to project data and updates
              </p>
            </div>
            <div className="text-center">
              <div className="text-primary mb-4 flex justify-center">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Team Collaboration</h3>
              <p className="text-gray-400">
                Seamless communication between all project stakeholders
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}