import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noAccountFound, setNoAccountFound] = useState(false);
  const navigate = useNavigate();
  // Cast resetPassword to the correct function type
  const { resetPassword: resetPasswordRaw } = useAuth();
  const resetPassword = resetPasswordRaw as ((email: string) => Promise<unknown>);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setNoAccountFound(false);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email);
      if (typeof result === 'object' && result !== null) {
        setSuccess('Password reset link sent! Check your email.');
        toast.success('Password reset link sent! Check your email.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-background-light p-8 rounded-lg shadow-xl border border-background-lighter">
          <h1 className="text-2xl font-bold text-white mb-6">Reset Your Password</h1>

          {/* For error/success rendering, use explicit null/empty checks */}
          {typeof error === 'string' && error.length > 0 && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {typeof success === 'string' && success.length > 0 && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
              {success}
            </div>
          )}

          {noAccountFound && (
            <div className="mb-4 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg text-yellow-300 text-sm">
              No account found for that email.{' '}
              <button
                onClick={() => navigate('/onboarding')}
                className="underline text-yellow-200 hover:text-white"
              >
                Sign up?
              </button>
            </div>
          )}

          {/* For form, use: <form onSubmit={e => { void handleSubmit(e); }} ... > */}
          <form onSubmit={e => { void handleSubmit(e); }} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary"
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Sending reset link...' : 'Send Reset Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-primary hover:text-primary-hover"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
