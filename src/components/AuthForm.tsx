import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (identifier: string, password: string) => Promise<void>;
  onToggleMode: () => void;
  onForgotPassword: (email: string) => Promise<void>;
}

export function AuthForm({ isLogin, onSubmit, onToggleMode, onForgotPassword }: AuthFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showForgotPassword) {
      if (!identifier.includes('@')) {
        alert('Please enter a valid email address for password reset');
        return;
      }
      await onForgotPassword(identifier);
      setShowForgotPassword(false);
    } else {
      await onSubmit(identifier, password);
    }
  };

  return (
    <div className="bg-background-light p-4 sm:p-8 rounded-lg shadow-xl border border-background-lighter w-full max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
        {showForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2">
            {isLogin ? 'Email or Username' : 'Email Address'}
          </label>
          <div className="relative">
            {isLogin ? (
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            ) : (
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
              type={isLogin ? "text" : "email"}
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
              required
              placeholder={isLogin ? "email@example.com or username" : "you@example.com"}
            />
          </div>
        </div>
        {!showForgotPassword && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-12 py-2.5 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-colors"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          {showForgotPassword ? 'Send Reset Instructions' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <div className="mt-6 text-center space-y-2">
        {isLogin && !showForgotPassword && (
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary hover:text-primary-hover transition-colors block w-full"
          >
            Forgot your password?
          </button>
        )}
        {showForgotPassword && (
          <button
            onClick={() => setShowForgotPassword(false)}
            className="text-sm text-primary hover:text-primary-hover transition-colors block w-full"
          >
            Back to Sign In
          </button>
        )}
        {!showForgotPassword && (
          <button
            onClick={onToggleMode}
            className="text-sm text-primary hover:text-primary-hover transition-colors block w-full"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        )}
      </div>
    </div>
  );
}