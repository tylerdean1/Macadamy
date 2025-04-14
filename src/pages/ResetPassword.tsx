import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState(''); // State for the new password
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirming the new password
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [success, setSuccess] = useState<string | null>(null); // State for success messages
  const navigate = useNavigate(); // Hook for navigating between routes

  // Check if there's a valid session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/'); // Navigate to home if no session exists
      }
    };
    
    checkSession(); // Call the session check function
  }, [navigate]);

  // Handle submission of the reset password form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(null); // Reset error state
    setSuccess(null); // Reset success state

    // Validate that passwords match and meet length requirements
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Update the user's password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword // New password to be set
      });

      if (error) throw error; // Handle error

      setSuccess('Password has been reset successfully'); // Notify success
      setTimeout(() => {
        navigate('/'); // Redirect to login page after success
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error); // Log error
      setError('Error resetting password. Please try again.'); // Alert user of the error
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-background-light p-8 rounded-lg shadow-xl border border-background-lighter">
          <h1 className="text-2xl font-bold text-white mb-6">Reset Your Password</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error} {/* Display error message */}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
              {success} {/* Display success message */}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                  required
                  placeholder="••••••••"
                  minLength={6} // Minimum length for password
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                  required
                  placeholder="••••••••"
                  minLength={6} // Minimum length for password
                />
              </div>
            </div>

            <button
              type="submit" // Button to submit the form
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              Reset Password
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')} // Navigate back to sign in
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}