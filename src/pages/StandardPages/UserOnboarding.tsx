import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import type { AuthEnrichedProfileInput } from '@/hooks/useAuth';

type UserRole = AuthEnrichedProfileInput['role'];

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { signup: signupRaw, error } = useAuth();
  const { loading } = useAuthStore();
  const signup = signupRaw as ((email: string, password: string, profileInput: AuthEnrichedProfileInput) => Promise<unknown>);
  const isLoading = loading.auth || loading.profile;
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

  const [form, setForm] = useState<AuthEnrichedProfileInput & { password: string }>({
    full_name: '',
    username: '',
    email: '',
    password: '',
    role: 'Contractor', // Default role
    phone: '',
    location: '',
    // job_title_id: undefined, // These are optional in AuthEnrichedProfileInput
    // custom_job_title: '',
    // organization_id: undefined,
    // custom_organization_name: '',
    // avatar_id: undefined,
  });

  const [step, setStep] = useState(1);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (step === 2 && typeof form.username === 'string' && form.username.trim().length >= 3) {
      const checkUsername = async () => {
        try {
          // Fix: use 'username' instead of '_username' in the object literal
          const userObj = { username: form.username.toUpperCase() };
          const profile = await rpcClient.getEnrichedProfileByUsername(userObj);
          setUsernameAvailable(!profile);
        } catch {
          setUsernameAvailable(null);
        }
      };
      void checkUsername();
    }
  }, [form.username, step]);

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!form.email || !form.password || !form.full_name || !form.username) {
      toast.error('Please fill out all required fields');
      return;
    }

    // Username validation
    if (usernameAvailable === false) {
      toast.error('Please choose a different username. This one is already taken.');
      return;
    }
    if (usernameAvailable === null) {
      toast.error('Please wait while we check if the username is available');
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

    const profileInput: AuthEnrichedProfileInput = {
      full_name: form.full_name,
      username: form.username.toUpperCase(),
      email: form.email,
      phone: typeof form.phone === 'string' && form.phone.trim() !== '' ? form.phone : undefined,
      location: typeof form.location === 'string' && form.location.trim() !== '' ? form.location : undefined,
      role: form.role,
      job_title_id: typeof form.job_title_id === 'string' && form.job_title_id.trim() !== '' ? form.job_title_id : undefined,
      custom_job_title: typeof form.custom_job_title === 'string' && form.custom_job_title.trim() !== '' ? form.custom_job_title : undefined,
      organization_id: typeof form.organization_id === 'string' && form.organization_id.trim() !== '' ? form.organization_id : undefined,
      custom_organization_name: typeof form.custom_organization_name === 'string' && form.custom_organization_name.trim() !== '' ? form.custom_organization_name : undefined,
      avatar_id: typeof form.avatar_id === 'string' && form.avatar_id.trim() !== '' ? form.avatar_id : undefined,
    };

    try {
      // Call the signup method with email, password, and profile data
      const signedUpProfile = await signup(form.email, form.password, profileInput); // signup now returns profile or null
      if (typeof signedUpProfile !== 'undefined' && signedUpProfile !== null && typeof signedUpProfile === 'object') {
        // Success logic (if any)
      } else {
        // Error handling is done within useAuth (sets error state, shows toast)
        // toast.error('Error creating account. Please try again.'); // Redundant if useAuth shows a toast
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Error creating account. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-background-light rounded shadow border border-background-lighter">
      <h1 className="text-2xl font-bold mb-6 text-white">Create Your Account</h1>

      <form onSubmit={evt => { void handleSubmit(evt); }} className="space-y-6">
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
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
                onChange={(event) => setForm({ ...form, password: event.target.value })}
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
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
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
                onChange={(event) => setForm({ ...form, username: event.target.value })}
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
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Location</label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={form.location ?? ''}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
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
                  if (!form.full_name || !form.full_name.trim()) {
                    toast.error('Please enter your full name');
                    return;
                  }
                  if (!form.username || !form.username.trim()) {
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
                disabled={Boolean(usernameAvailable !== true || isLoading)}
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
                onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
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
                onChange={(event) => setForm({ ...form, custom_organization_name: event.target.value })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              />
            </div>

            {typeof error === 'string' && error.trim() !== '' ? <p className="text-red-500 text-sm mt-2">{error}</p> : null}

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