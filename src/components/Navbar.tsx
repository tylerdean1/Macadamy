import { useNavigate, Link } from 'react-router-dom'; // Hooks for routing
import { LogOut, Home } from 'lucide-react'; // Icons for logout and home
import { useAuthStore } from '../lib/store'; // Auth store for user management
import { supabase } from '../lib/supabase'; // Supabase client for authentication

// Navigation bar component
export function Navbar() {
  const navigate = useNavigate(); // Use hook for navigation
  const { user, setUser } = useAuthStore(); // Grab user and setUser function from the auth store

  // Handle user logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // Sign out from Supabase
      setUser(null); // Clear user state in the store
      navigate('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Error signing out:', error); // Log any errors
    }
  };

  // If there is no user, don't render the navbar
  if (!user) return null;

  return (
    <nav className="bg-background-light border-b border-background-lighter">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/dashboard" // Link to dashboard page
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5 mr-2" /> {/* Home icon */}
              <span className="font-medium">Dashboard</span> {/* Dashboard label */}
            </Link>
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleLogout} // Trigger logout on button click
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" /> {/* Logout icon */}
              <span className="font-medium">Sign Out</span> {/* Sign Out label */}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}