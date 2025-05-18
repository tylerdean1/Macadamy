import { useState } from 'react';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthFormProps {
  onNavigateToSignup: () => void;
  onNavigateToResetPassword: () => void;
}

export function AuthForm({
  onNavigateToSignup,
  onNavigateToResetPassword,
}: AuthFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDemoUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!identifier.trim()) {
      toast.error('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      // The login method will handle validation, toast messages, and redirection
      const result = await login(identifier, password);
      // If login fails, it will show appropriate error toast in the useAuth hook
      
      // If login fails, clear password for security but keep email for convenience
      if (!result) {
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went wrong during login.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginAsDemoUser();
      // The loginAsDemoUser method handles redirection
    } catch (err) {
      console.error('Demo login error:', err);
      toast.error('Failed to log in as demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-background-light p-8 rounded-lg shadow-xl border border-background-lighter w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

      <form onSubmit={handleLogin} className="space-y-6">
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
              disabled={loading}
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
              disabled={loading}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-12 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-50"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <button
          onClick={onNavigateToResetPassword}
          disabled={loading}
          className="block w-full text-sm text-primary disabled:opacity-50"
          type="button"
        >
          Forgot your password?
        </button>
        <button
          onClick={onNavigateToSignup}
          disabled={loading}
          className="block w-full text-sm text-primary disabled:opacity-50"
          type="button"
        >
          Don't have an account? Sign up
        </button>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full bg-secondary text-white py-2.5 rounded disabled:opacity-50"
        >
          Try Demo
        </Button>
      </div>
    </Card>
  );
}