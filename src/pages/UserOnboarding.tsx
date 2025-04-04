import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Save, User, ChevronRight, HardHat, PenTool as Tool, Briefcase, ClipboardCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface JobTitle {
  id: string;
  title: string;
  is_custom: boolean;
}

interface OnboardingForm {
  username: string;
  fullName: string;
  company: string;
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';
  jobTitleId: string;
  customJobTitle: string;
  phone: string;
  location: string;
  email: string;
}

export function UserOnboarding() {
  const navigate = useNavigate();
  const { user, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [isAddingCustomTitle, setIsAddingCustomTitle] = useState(false);
  const [form, setForm] = useState<OnboardingForm>({
    username: '',
    fullName: '',
    company: '',
    role: 'Admin',
    jobTitleId: '',
    customJobTitle: '',
    phone: '',
    location: '',
    email: '', 
  });
  

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const fetchJobTitles = async () => {
    try {
      const { data, error } = await supabase
        .from('job_titles')
        .select('*')
        .order('title');

      if (error) throw error;
      setJobTitles(data || []);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : JSON.stringify(error);
      console.error('Error fetching job titles:', msg);
    }
    
  };

  const handleAddCustomTitle = async () => {
    if (!form.customJobTitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from('job_titles')
        .insert({
          title: form.customJobTitle,
          is_custom: true,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setJobTitles([...jobTitles, data]);
      setForm(prev => ({ ...prev, jobTitleId: data.id }));
      setIsAddingCustomTitle(false);
      setForm(prev => ({ ...prev, customJobTitle: '' }));
    } catch (error) {
      console.error('Error adding custom job title:', error);
      setError('Error adding custom job title');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        // First check if a profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking profile existence:', profileError);
          return;
        }

        // If no profile exists, create an initial one
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              role: 'Contractor',
              full_name: '' // Will be set during onboarding
            });

          if (insertError) {
            console.error('Error creating initial profile:', insertError);
            return;
          }
        } else {
          // If profile exists, check if it's complete
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('role, full_name, company, username, email, phone, location')
            .eq('id', user.id)
            .single();
        
          if (fetchError) {
            console.error('Error fetching profile details:', fetchError);
            return;
          }
        
          // If profile is complete, redirect to dashboard
          if (profile.full_name && profile.username) {
            setProfile({
              role: profile.role,
              fullName: profile.full_name,
              company: profile.company,
              username: profile.username,
              email: profile.email,
              phone: profile.phone,
              location: profile.location,
            });
        
            navigate('/dashboard');
          }
        }
        
      } catch (error) {
        console.error('Error in auth check:', error);
      }
    };

    checkAuth();
  }, [user, navigate, setProfile]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!form.username || form.username.length < 3) {
        setUsernameAvailable(false);
        return;
      }

      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', form.username)
          .maybeSingle();

        if (error) throw error;
        setUsernameAvailable(!data);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(false);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [form.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (!usernameAvailable) {
        setError('Please choose a different username');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: form.username,
          full_name: form.fullName,
          company: form.company,
          role: form.role,
          job_title_id: form.jobTitleId,
          phone: form.phone,
          location: form.location
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile({
        role: form.role,
        fullName: form.fullName,
        company: form.company,
        email: form.email,
        phone: form.phone,
        location: form.location,
        username: form.username,
      });
      

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error saving profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: 'Contractor',
      title: 'Contractor',
      description: 'I manage construction projects and oversee field operations',
      icon: <HardHat className="w-8 h-8" />
    },
    {
      role: 'Engineer',
      title: 'Engineer',
      description: 'I design, review, and approve construction plans',
      icon: <Tool className="w-8 h-8" />
    },
    {
      role: 'Inspector',
      title: 'Inspector',
      description: 'I perform quality control inspections and ensure compliance',
      icon: <ClipboardCheck className="w-8 h-8" />
    },
    {
      role: 'Admin',
      title: 'Administrator',
      description: 'I manage contracts and oversee project administration',
      icon: <Briefcase className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            {[1, 2, 3].map((number) => (
              <React.Fragment key={number}>
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= number ? 'bg-primary text-white' : 'bg-background-light text-gray-400'
                  }`}
                >
                  {number}
                </div>
                {number < 3 && (
                  <div className="flex-1 h-1 mx-2 rounded bg-background-light">
                    <div
                      className={`h-full bg-primary transition-all duration-300 ease-in-out ${
                        step > number ? 'w-full' : 'w-0'
                      }`}
                    />

                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Role Selection */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to Macadamy!</h1>
              <p className="text-gray-400">Let's start by selecting your role</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roleCards.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, role: card.role as OnboardingForm['role'] }));
                    setStep(2);
                  }}
                  className={`p-6 rounded-lg border-2 transition-colors text-left ${
                    form.role === card.role
                      ? 'border-primary bg-primary/10'
                      : 'border-background-lighter bg-background-light hover:border-primary/50'
                  }`}
                >
                  <div className="text-primary mb-4">{card.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-gray-400 text-sm">{card.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Personal Information */}
          <div className={step === 2 ? 'block' : 'hidden'}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Personal Information</h2>
              <p className="text-gray-400">Tell us a bit about yourself</p>
            </div>

            <div className="bg-background-light rounded-lg border border-background-lighter p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                    className={`w-full bg-background border text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors ${
                      form.username
                        ? usernameAvailable
                          ? 'border-green-500'
                          : 'border-red-500'
                        : 'border-background-lighter'
                    }`}
                    required
                    placeholder="Choose a username"
                    pattern="[a-z0-9_]{3,}"
                    title="Username must be at least 3 characters and can only contain lowercase letters, numbers, and underscores"
                  />
                  {form.username && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm">
                      {checkingUsername ? (
                        <span className="text-gray-400">Checking...</span>
                      ) : usernameAvailable ? (
                        <span className="text-green-500">Available</span>
                      ) : (
                        <span className="text-red-500">Not available</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Username must be at least 3 characters and can only contain lowercase letters, numbers, and underscores
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                    required
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title
                </label>
                {isAddingCustomTitle ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.customJobTitle}
                      onChange={(e) => setForm({ ...form, customJobTitle: e.target.value })}
                      className="flex-1 bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                      placeholder="Enter custom job title"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTitle}
                      className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomTitle(false)}
                      className="px-4 py-2 bg-background-lighter hover:bg-background text-white rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      aria-label="Job title selector"
                      value={form.jobTitleId}
                      onChange={(e) => setForm({ ...form, jobTitleId: e.target.value })}
                      className="flex-1 bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      required
                    >

                      <option value="">Select Job Title</option>
                      {jobTitles.map(title => (
                        <option key={title.id} value={title.id}>{title.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomTitle(true)}
                      className="px-4 py-2 bg-background-lighter hover:bg-background text-white rounded-md transition-colors"
                    >
                      Add Custom
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                    required
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-2.5 bg-background-light hover:bg-background-lighter text-white rounded-md transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!usernameAvailable || !form.username}
                className="flex items-center px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Step 3: Company Information */}
          <div className={step === 3 ? 'block' : 'hidden'}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Company Information</h2>
              <p className="text-gray-400">Tell us about your organization</p>
            </div>

            <div className="bg-background-light rounded-lg border border-background-lighter p-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                    required
                    placeholder="Company Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-background-light hover:bg-background-lighter text-white rounded-md transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !usernameAvailable}
                className="flex items-center px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}