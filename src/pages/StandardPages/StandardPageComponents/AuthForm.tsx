
import { useState } from 'react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { toast } from 'sonner';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onNavigateToSignup?: () => void;
  onNavigateToResetPassword?: () => void;
}

export function AuthForm({
  onNavigateToSignup,
  onNavigateToResetPassword,
}: AuthFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Get auth functions from hooks
  const { login } = useAuth();

  // Get loading state from auth store
  const { loading } = useAuthStore();
  const isLoading = loading.auth || loading.profile;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      // The login method from useAuth now handles loading states internally
      const result = await login(identifier, password);
      if (!result) {
        setPassword('');
      }
      // Success is handled by the login function with redirection
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong during login.');
      setPassword('');
    }
  };


  return (
    <Card className="bg-background-light p-8 rounded-lg shadow-xl border border-background-lighter w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
      <form onSubmit={e => { void handleLogin(e); }} className="space-y-6">
        <div>
          <label htmlFor="id" className="block text-sm text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="id"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              placeholder="email@example.com"
              className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="pwd" className="block text-sm text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="pwd"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-12 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={onNavigateToResetPassword}
              className="text-xs text-gray-400 hover:text-primary focus:outline-none focus:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 text-md"
          disabled={isLoading}
          isLoading={isLoading}
        >
          Sign In
        </Button>

        <GoogleSignInButton className="w-full py-2.5 text-md" />
      </form>


      {onNavigateToSignup && (
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-400">Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="text-primary hover:underline focus:outline-none focus:underline"
          >
            Sign up
          </button>
        </div>
      )}
    </Card>
  );
}
