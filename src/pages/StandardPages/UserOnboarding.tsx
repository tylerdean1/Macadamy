import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';
import { useOrganizationsData } from '@/hooks/useOrganizationsData';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';

export default function UserOnboarding(): JSX.Element {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { loading } = useAuthStore();
  const isLoading = loading.auth || loading.profile;

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');

  // Fetch all organizations for select
  const { organizations, loading: orgsLoading, error: orgsError } = useOrganizationsData();



  const handleSubmit = async (evt: React.FormEvent) => {
    evt.preventDefault();

    if (selectedOrg === "__create_new__") {
      // Redirect to organization onboarding page
      navigate('/organizations/onboarding', { replace: true });
      return;
    }

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please enter your name, email, and password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Pass selectedOrg to signup/profile logic as needed (not implemented here)
    const result = await signup(email, password, fullName);
    if (!result) return;

    if (!result.session) {
      navigate('/', { replace: true });
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="bg-background-light p-8 rounded-lg shadow-xl border border-background-lighter w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Create your account</h1>
        <form onSubmit={e => { void handleSubmit(e); }} className="space-y-5">
          {/* Organization select field */}
          <div>
            <label htmlFor="signup-organization" className="block text-sm text-gray-300 mb-2">
              Organization
            </label>
            <select
              id="signup-organization"
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
              disabled={isLoading || orgsLoading}
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            >
              <option value="" disabled>
                {orgsLoading ? 'Loading organizations...' : 'Select an organization'}
              </option>
              <option value="__create_new__">Create new organization…</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {orgsError && <div className="text-red-400 text-xs mt-1">{orgsError}</div>}
          </div>
          <div>
            <label htmlFor="signup-name" className="block text-sm text-gray-300 mb-2">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              autoComplete="name"
              placeholder="Jane Doe"
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm text-gray-300 mb-2">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
              placeholder="email@example.com"
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm text-gray-300 mb-2">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-sm text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full bg-background border border-background-lighter text-gray-100 px-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 text-md"
            disabled={isLoading}
            isLoading={isLoading}
          >
            Sign Up
          </Button>
        </form>
      </Card>
    </div>
  );
}
