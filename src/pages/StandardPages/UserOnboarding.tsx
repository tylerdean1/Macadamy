import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { useSignup } from '@/hooks/useSignup';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import type { EnrichedProfileInput } from '@/hooks/useSignup';

type UserRole = EnrichedProfileInput['role'];

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { signup, error, isLoading } = useSignup();
  const roleOptions = useEnumOptions('user_role');
  const { user, profile } = useAuthStore();

  // Check if user is already logged in with a complete profile
  useEffect(() => {
    if (user && profile) {
      // If user already has a complete profile, redirect to dashboard
      toast.info('You are already logged in and have completed onboarding.');
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const [form, setForm] = useState<EnrichedProfileInput & { password: string }>({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'Contractor',
    phone: '',
    location: '',
    job_title_id: undefined,
    custom_job_title: '',
    organization_id: undefined,
    custom_organization_name: '',
    avatar_id: undefined,
  });

  const [step, setStep] = useState(1);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (step === 2 && form.username.trim().length >= 3) {
      const checkUsername = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', form.username.toUpperCase())
          .maybeSingle();
        setUsernameAvailable(!data);
      };
      checkUsername();
    }
  }, [form.username, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.full_name || !form.username) {
      toast.error('Please fill out all required fields');
      return;
    }

    // Username validation
    if (!usernameAvailable) {
      toast.error('Please choose a different username. This one is already taken.');
      return;
    }

    // Role validation
    if (!form.role) {
      toast.error('Please select your role');
      return;
    }

    // Password strength validation
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const profileInput: EnrichedProfileInput = {
      full_name: form.full_name,
      username: form.username.toUpperCase(),
      email: form.email,
      phone: form.phone || undefined,
      location: form.location || undefined,
      role: form.role,
      job_title_id: form.job_title_id || undefined,
      custom_job_title: form.custom_job_title || undefined,
      organization_id: form.organization_id || undefined,
      custom_organization_name: form.custom_organization_name || undefined,
      avatar_id: form.avatar_id || undefined,
    };

    try {
      // Call the signup method with email, password, and profile data
      await signup(form.email, form.password, profileInput);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Error creating account. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-background-light rounded shadow border border-background-lighter">
      <h1 className="text-2xl font-bold mb-6 text-white">Create Your Account</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
                required
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  // Validate email and password before proceeding
                  if (!form.email.trim()) {
                    toast.error('Please enter your email address');
                    return;
                  }
                  
                  if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) {
                    toast.error('Please enter a valid email address');
                    return;
                  }
                  
                  if (!form.password.trim()) {
                    toast.error('Please enter a password');
                    return;
                  }
                  
                  if (form.password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    return;
                  }
                  
                  setStep(2);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Username</label>
              <input
                type="text"
                placeholder="e.g. J.SMITH"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
                required
              />
              {usernameAvailable === false && (
                <p className="text-red-500 text-sm mt-1">Username is already taken.</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                placeholder="e.g. (555) 123-4567"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Location</label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={form.location ?? ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  // Validate full name and username before proceeding
                  if (!form.full_name.trim()) {
                    toast.error('Please enter your full name');
                    return;
                  }
                  
                  if (!form.username.trim()) {
                    toast.error('Please enter a username');
                    return;
                  }
                  
                  if (form.username.trim().length < 3) {
                    toast.error('Username must be at least 3 characters');
                    return;
                  }
                  
                  if (usernameAvailable === false) {
                    toast.error('This username is already taken. Please choose another one.');
                    return;
                  }
                  
                  if (usernameAvailable === null) {
                    toast.error('Please wait while we check if the username is available');
                    return;
                  }
                  
                  setStep(3);
                }}
                disabled={!usernameAvailable || isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label htmlFor="role-select" className="block text-sm text-gray-300 mb-2">Role</label>
              <select
                id="role-select"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              >
                <option value="" disabled>Select your role</option>
                {roleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mt-4 mb-2">Organization</label>
              <input
                type="text"
                placeholder="e.g. Acme Infrastructure, LLC"
                value={form.custom_organization_name}
                onChange={(e) => setForm({ ...form, custom_organization_name: e.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}