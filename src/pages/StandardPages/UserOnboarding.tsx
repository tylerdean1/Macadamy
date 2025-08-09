import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
// Replaced Nominatim-based suggestions with Google Places
import { usePlacesLocationAutocomplete, useGhostCompletion } from '@/hooks/usePlacesAutocomplete';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import type { AuthEnrichedProfileInput } from '@/hooks/useAuth';

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { signup: signupRaw } = useAuth();
  const { loading } = useAuthStore();
  const signup = signupRaw as ((email: string, password: string, profileInput: AuthEnrichedProfileInput) => Promise<unknown>);
  const isLoading = loading.auth || loading.profile;
  const { user, profile } = useAuthStore();

  const [form, setForm] = useState<AuthEnrichedProfileInput & { password: string }>(
    {
      full_name: '',
      username: '',
      email: '',
      password: '',
      role: 'org_user', // Default role
      phone: '',
      location: '',
      // job_title_id: undefined, // These are optional in AuthEnrichedProfileInput
      // custom_job_title: '',
      // organization_id: undefined,
      // custom_organization_name: '',
      // avatar_id: undefined,
    },
  );

  const places = usePlacesLocationAutocomplete(form.location ?? '', { countries: ['us', 'ca', 'mx'], type: '(cities)' });
  const allRoles = useEnumOptions('user_role_type');
  const roleOptions = useMemo(() => allRoles.filter(r => r !== 'system_admin'), [allRoles]);
  const topLocation = useMemo(() => places[0]?.description ?? '', [places]);
  const [lastTypedLocation, setLastTypedLocation] = useState<string>('');
  const [showPlaces, setShowPlaces] = useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const locationBoxRef = useRef<HTMLDivElement | null>(null);
  const ghost = useGhostCompletion(form.location ?? '', topLocation);

  // Auto-fill best location suggestion after brief pause
  useEffect(() => {
    const q = (form.location ?? '').trim();
    if (q.length < 3) return;
    const t = setTimeout(() => {
      // Only auto-fill if the user hasn't typed something else since suggestions came back
      if (topLocation && lastTypedLocation === q) {
        setForm((prev) => ({ ...prev, location: topLocation }));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.location, topLocation, lastTypedLocation]);

  // Check if user is already logged in with a complete profile
  useEffect(() => {
    if (user && profile) {
      // If user already has a complete profile, redirect to dashboard
      toast.info('You are already logged in and have completed onboarding.');
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  // Close suggestions on click outside
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!locationBoxRef.current) return;
      if (!locationBoxRef.current.contains(e.target as Node)) {
        setShowPlaces(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const [step, setStep] = useState(1);
  // Org search/creation is deferred to post-auth Organization Onboarding to satisfy RLS.
  // We rely on backend unique constraints during signup to detect duplicates.
  // Pre-flight username checks are disabled due to RLS on anon.

  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    if (!form.email || !form.password || !form.full_name || !form.username) {
      toast.error('Please fill out all required fields');
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

    const doSignup = async (): Promise<void> => {
      try {
        const signedUpProfile = await signup(form.email, form.password, profileInput);
        if (typeof signedUpProfile !== 'undefined' && signedUpProfile !== null && typeof signedUpProfile === 'object') {
          // Success handled in hook navigation
        }
      } catch (err) {
        console.error('Signup error:', err);
        toast.error('Error creating account. Please try again.');
      }
    };

    await doSignup();
    // After attempting account creation, return to landing page
    navigate('/', { replace: true });
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
                autoComplete="email"
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
                autoComplete="new-password"
                required
              />
            </div>

            <ul className="text-xs text-gray-400 mt-2 space-y-1">
              <li className={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'text-green-500' : 'text-red-500'}>
                {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '✔' : '✖'} Valid email
              </li>
              <li className={form.password.length >= 6 ? 'text-green-500' : 'text-red-500'}>
                {form.password.length >= 6 ? '✔' : '✖'} Password at least 6 characters
              </li>
            </ul>

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
              {/* Duplicate username handled at submit time */}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as unknown as AuthEnrichedProfileInput['role'] })}
                className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
                aria-label="Select user role"
                required
              >
                {roleOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                ))}
              </select>
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
              <div className="relative" ref={locationBoxRef}>
                {/* Ghost suggestion overlay */}
                <input
                  type="text"
                  className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded relative z-10"
                  placeholder="e.g. Phoenix, AZ"
                  value={form.location ?? ''}
                  onChange={(e) => { setLastTypedLocation(e.target.value); setForm({ ...form, location: e.target.value }); setShowPlaces(true); setHighlightIndex(-1); }}
                  onFocus={() => { setShowPlaces(true); if (places.length > 0) setHighlightIndex(0); }}
                  onKeyDown={(e) => {
                    // Accept ghost completion on Tab
                    if (e.key === 'Tab' && ghost) {
                      e.preventDefault();
                      setForm(prev => ({ ...prev, location: (prev.location ?? '') + ghost }));
                      setShowPlaces(false);
                      setHighlightIndex(-1);
                      return;
                    }
                    if (showPlaces && places.length > 0) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setHighlightIndex((idx) => {
                          const next = idx < places.length - 1 ? idx + 1 : 0;
                          return next;
                        });
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setHighlightIndex((idx) => {
                          const prev = idx > 0 ? idx - 1 : places.length - 1;
                          return prev;
                        });
                      } else if (e.key === 'Enter') {
                        if (highlightIndex >= 0 && highlightIndex < places.length) {
                          e.preventDefault();
                          const chosen = places[highlightIndex];
                          setForm(prev => ({ ...prev, location: chosen.description }));
                          setShowPlaces(false);
                          setHighlightIndex(-1);
                        }
                      } else if (e.key === 'Escape') {
                        setShowPlaces(false);
                        setHighlightIndex(-1);
                      }
                    }
                  }}
                  autoComplete="off"
                />
                <input
                  tabIndex={-1}
                  aria-hidden
                  aria-label="ghost-suggestion"
                  className="absolute inset-0 w-full text-gray-500/50 bg-transparent px-4 py-2 pointer-events-none select-none z-0"
                  value={(form.location ?? '') + ghost}
                  readOnly
                />
              </div>
              {showPlaces && places.length > 0 && (
                <div className="mt-1 border border-background-lighter bg-background rounded overflow-hidden">
                  {places.slice(0, 5).map((p, i) => (
                    <button
                      key={p.description}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm ${i === highlightIndex ? 'bg-background-light' : 'hover:bg-background-light'}`}
                      onMouseEnter={() => setHighlightIndex(i)}
                      onClick={() => {
                        setForm(prev => ({ ...prev, location: p.description }));
                        setShowPlaces(false);
                        setHighlightIndex(-1);
                      }}
                    >
                      {p.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ul className="text-xs text-gray-400 mt-2 space-y-1">
              <li className={form.full_name.trim() ? 'text-green-500' : 'text-red-500'}>
                {form.full_name.trim() ? '✔' : '✖'} Full name
              </li>
              <li className={form.username.trim().length >= 3 ? 'text-green-500' : 'text-red-500'}>
                {form.username.trim().length >= 3 ? '✔' : '✖'} Username (min 3 chars)
              </li>
              {/* Duplicate username is handled during signup (unique constraint) */}
            </ul>

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back
              </button>
              <button
                type="submit"
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
                  // submit handled by form onSubmit
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
          </>
        )}

        {/* Step 3 removed. We defer organization selection to a post-auth Organization Onboarding page. */}
      </form>
    </div>
  );
}

/* No inline org helpers; org search/creation occurs in OrganizationOnboarding post-auth */
