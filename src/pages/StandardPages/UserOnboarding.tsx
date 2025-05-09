import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HardHat, PenTool as Tool, Briefcase, ClipboardCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

// Interface for the job titles
interface JobTitle {
  id: string;
  title: string;
  is_custom: boolean;
}

// Interface for the onboarding form data
interface OnboardingForm {
  username: string; // User's chosen username
  fullName: string; // User's full name
  company: string; // User's company name
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector'; // User's role
  jobTitleId: string; // ID of the user's job title
  customJobTitle: string; // Custom job title if specified
  phone: string; // User's phone number
  location: string; // User's location
  email: string; // User's email
}

export function UserOnboarding() {
  const navigate = useNavigate(); // Hook for navigation
  const { user, setProfile } = useAuthStore(); // Get user and set profile from auth store
  const [loading, setLoading] = useState(false); // Loading state for actions
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [step, setStep] = useState(1); // Current step in the onboarding process
  const [usernameAvailable, setUsernameAvailable] = useState(false); // Check if username is available
  const [checkingUsername, setCheckingUsername] = useState(false); // Loading state for checking username
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]); // State for available job titles
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]); // State for organizations
  const [isNewCompany, setIsNewCompany] = useState(false); // State to toggle between creating a new company or selecting existing

  const [form, setForm] = useState<OnboardingForm>({
    username: '',
    fullName: '',
    company: '',
    role: 'Admin', // Default role
    jobTitleId: '', // Default to no job title
    customJobTitle: '',
    phone: '',
    location: '',
    email: '',
  });

  const autocompleteRef = useRef<HTMLInputElement | null>(null); // Reference for location autocomplete

  // Fetch job titles and organizations when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const [jobTitleRes, orgRes] = await Promise.all([
        supabase.from('job_titles').select('*').order('title'),
        supabase.from('organizations').select('id, name').order('name')
      ]);
      setJobTitles(jobTitleRes.data || []);
      setOrganizations(orgRes.data || []);
    };
    fetchData();
  }, []);

  // Google Autocomplete for location input
  useEffect(() => {
    if (!autocompleteRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
      types: ['(regions)'],
      componentRestrictions: { country: 'us' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const isState = place.types?.includes('administrative_area_level_1');
      if (isState && place.formatted_address) {
        setForm(prev => ({ ...prev, location: place.formatted_address ?? '' })); // Set address from autocomplete
      }
    });
  }, []);

  // Check if the username is available
  useEffect(() => {
    const checkUsername = async () => {
      if (!form.username || form.username.length < 3) {
        setUsernameAvailable(false);
        return;
      }
      setCheckingUsername(true);
      const { data } = await supabase.from('profiles').select('username').eq('username', form.username).maybeSingle();
      setUsernameAvailable(!data); // Update availability status
      setCheckingUsername(false);
    };
    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout); // Cleanup timeout
  }, [form.username]);

  // Handle the final form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!user) return; // Ensure user is authenticated

    try {
      setLoading(true);
      setError(null); // Reset error state

      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', form.company)
        .maybeSingle();

      let organizationId = existingOrg?.id; // Get organization ID if it exists

      if (!organizationId) {
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({ name: form.company, created_by: user.id })
          .select()
          .single();
        organizationId = newOrg.id; // Get the newly created organization's ID
      }

      // Update the user's profile with onboarding information
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: form.username,
          full_name: form.fullName,
          role: form.role,
          job_title_id: form.jobTitleId,
          phone: form.phone,
          location: form.location,
          organization_id: organizationId
        })
        .eq('id', user.id);

      if (updateError) throw updateError; // Handle errors during update

      setProfile({ // Update user profile state
        role: form.role,
        fullName: form.fullName,
        company: form.company,
        email: form.email,
        phone: form.phone,
        location: form.location,
        username: form.username,
        organizationId
      });

      navigate('/dashboard'); // Redirect to the dashboard after onboarding
    } catch (err) {
      console.error(err);
      setError('Failed to complete onboarding.'); // Set error message
    }
  };

  // Card for selecting user roles in onboarding
  const roleCards = [
    { role: 'Contractor', title: 'Contractor', icon: <HardHat className="w-6 h-6" /> },
    { role: 'Engineer', title: 'Engineer', icon: <Tool className="w-6 h-6" /> },
    { role: 'Inspector', title: 'Inspector', icon: <ClipboardCheck className="w-6 h-6" /> },
    { role: 'Admin', title: 'Administrator', icon: <Briefcase className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-white p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold">Select Your Role</h2>
            <div className="grid grid-cols-2 gap-4">
              {roleCards.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, role: card.role as OnboardingForm['role'] }));
                    setStep(2); // Move to the next step
                  }}
                  className={`p-4 border rounded-lg text-left ${
                    form.role === card.role ? 'border-primary bg-primary/10' : 'border-gray-700'
                  }`}
                >
                  <div className="text-primary mb-2">{card.icon}</div>
                  <div className="text-white font-semibold">{card.title}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold">Personal Info</h2>
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              className="w-full bg-gray-800 rounded p-2"
              required
            />
            {form.username && (
              <p className={`text-sm ${usernameAvailable ? 'text-green-400' : 'text-red-400'}`}>
                {checkingUsername ? 'Checking...' : usernameAvailable ? 'Available' : 'Not available'}
              </p>
            )}
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full bg-gray-800 rounded p-2"
              required
            />
            <select
              aria-label="Job Title"
              value={form.jobTitleId}
              onChange={(e) => setForm({ ...form, jobTitleId: e.target.value })}
              className="w-full bg-gray-800 rounded p-2"
              required
            >
              <option value="">Select Job Title</option>
              {jobTitles.map(title => (
                <option key={title.id} value={title.id}>{title.title}</option>
              ))}
            </select>
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-gray-800 rounded p-2"
            />
            <input
              ref={autocompleteRef}
              placeholder="Select State"
              defaultValue={form.location}
              className="w-full bg-gray-800 rounded p-2"
            />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)} // Go back to role selection
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)} // Move to company info
                disabled={!usernameAvailable} // Disable if username isn't available
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-bold">Company Info</h2>
            {isNewCompany ? (
              <input
                placeholder="Enter New Company Name"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full bg-gray-800 rounded p-2"
                required
              />
            ) : (
              <select
                aria-label="Company"
                className="w-full bg-gray-800 rounded p-2"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
              >
                <option value="">Select Company</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.name}>{org.name}</option>
                ))}
              </select>
            )}
            <p
              className="text-sm text-primary cursor-pointer mt-2"
              onClick={() => setIsNewCompany(!isNewCompany)} // Toggle between creating a new company or selecting an existing one
            >
              {isNewCompany ? '← Choose from existing companies' : '+ Create new company'}
            </p>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setStep(2)} // Go back to personal info
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back
              </button>
              <button
                type="submit" // Complete onboarding process
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded"
              >
                {loading ? 'Submitting...' : 'Complete Setup'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Display any error messages */}
          </>
        )}
      </form>
    </div>
  );
}