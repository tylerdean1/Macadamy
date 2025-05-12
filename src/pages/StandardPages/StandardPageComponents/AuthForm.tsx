import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';

interface AuthFormProps {
  isLogin: boolean;
  isLoading: boolean;
  error?: string | null;
  success?: string | null;
  onSubmit: (identifier: string, password: string) => Promise<void>;
  onToggle: () => void;
  onForgotPassword: (email: string) => Promise<void>;
}

export function AuthForm({
  isLogin,
  isLoading,
  error,
  success,
  onSubmit,
  onToggle,
  onForgotPassword,
}: AuthFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [forgot,     setForgot]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgot) {
      if (!identifier.includes('@')) {
        alert('Enter a valid email');
        return;
      }
      await onForgotPassword(identifier);
      setForgot(false);
    } else {
      await onSubmit(identifier, password);
    }
  };

  return (
    <Card className="bg-background-light p-8 rounded-lg shadow-xl border border-background-lighter w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-600 text-sm">
          {success}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-6">
        {forgot
          ? 'Reset Password'
          : isLogin
          ? 'Welcome Back'
          : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="id" className="block text-sm text-gray-300 mb-2">
            {forgot
              ? 'Email Address'
              : isLogin
              ? 'Email or Username'
              : 'Email Address'}
          </label>
          <div className="relative">
            {(isLogin && !forgot) ? (
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            ) : (
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
              id="id"
              type={forgot || !isLogin ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              autoComplete={forgot || !isLogin ? 'email' : 'username'}
              placeholder={
                forgot
                  ? 'you@example.com'
                  : isLogin
                  ? 'email@example.com or username'
                  : 'you@example.com'
              }
              className="w-full bg-background border border-background-lighter text-gray-100 pl-10 pr-4 py-2.5 rounded-md focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          </div>
        </div>

        {!forgot && (
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
                onClick={() => setShowPwd((v) => !v)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-50"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2.5 rounded disabled:opacity-50"
        >
          {isLoading
            ? 'Processing…'
            : forgot
            ? 'Send Reset Instructions'
            : isLogin
            ? 'Sign In'
            : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        {forgot ? (
          <button
            onClick={() => setForgot(false)}
            disabled={isLoading}
            className="block w-full text-sm text-primary disabled:opacity-50"
          >
            Back to Sign In
          </button>
        ) : (
          <>
            {isLogin && (
              <button
                onClick={() => setForgot(true)}
                disabled={isLoading}
                className="block w-full text-sm text-primary disabled:opacity-50"
              >
                Forgot your password?
              </button>
            )}
            <button
              onClick={onToggle}
              disabled={isLoading}
              className="block w-full text-sm text-primary disabled:opacity-50"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </>
        )}
      </div>
    </Card>
  );
}