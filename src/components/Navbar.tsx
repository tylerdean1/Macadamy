import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-background-light border-b border-background-lighter">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}