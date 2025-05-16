import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { useLoadProfile } from '@/hooks/useLoadProfile';
import { useEnumOptions } from '@/hooks/useEnumOptions';

export default function UserOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const loadProfile = useLoadProfile();
  const roleOptions = useEnumOptions('user_role');

  type UserRole = "Admin" | "Contractor" | "Engineer" | "Project Manager" | "Inspector" | undefined;

  const [form, setForm] = useState<{
    fullName: string;
    role: UserRole;
    company: string;
    username: string;
  }>({
    fullName: '',
    role: undefined,
    company: '',
    username: '',
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (form.username.trim().length < 3) return;
    const checkUsername = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', form.username.toUpperCase())
        .maybeSingle();
      setUsernameAvailable(!data);
    };
    checkUsername();
  }, [form.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const { error: updateErr } = await supabase.from('profiles').update({
      full_name: form.fullName,
      role: form.role,
      organization_id: form.company,
      username: form.username.toUpperCase(),
    }).eq('id', user.id);

    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    await loadProfile(user.id);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-background-light rounded shadow border border-background-lighter">
      <h1 className="text-2xl font-bold mb-6 text-white">User Onboarding</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div>
            <label className="block text-sm text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Smith"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              required
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-sm text-gray-300 mb-2">Choose a Username</label>
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
                onClick={() => setStep(3)}
                disabled={!usernameAvailable || loading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label htmlFor="job-title" className="block text-sm text-gray-300 mb-2">Job Title</label>
            <select
              id="job-title"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              required
            >
              <option value="" disabled>Select your role</option>
              {roleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <label className="block text-sm text-gray-300 mt-4 mb-2">Organization</label>
            <input
              type="text"
              placeholder="e.g. Acme Infrastructure, LLC"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full bg-background border border-background-lighter text-white px-4 py-2 rounded"
              required
            />

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover rounded"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}