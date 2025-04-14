import { create } from 'zustand'; // Zustand library for state management
import { User as SupabaseUser } from '@supabase/supabase-js'; // Supabase user type import

// Type for user roles in the application
export type UserRole = 'Admin' | 'Contractor' | 'Engineer' | 'Project Manager' | 'Inspector';

// Interface defining the structure of a user profile
interface Profile {
  role: UserRole; // User's role
  fullName: string; // User's full name
  email: string; // User's email address
  phone: string; // User's phone number
  location: string; // User's address or location
  company: string; // Company name
  username: string; // Username of the user
  jobTitleId?: string; // Optional job title ID
  organizationId?: string; // Optional organization ID
}

// Interface defining the authentication state management
interface AuthState {
  user: SupabaseUser | null; // The current Supabase user, or null if not authenticated
  profile: Profile | null; // The current user profile, or null if not set
  setUser: (user: SupabaseUser | null) => void; // Function to set the user
  setProfile: (profile: Profile | null) => void; // Function to set the profile
  clearAuth: () => void; // Function to clear user and profile
  bypassAuth: () => void; // Function to set default user and profile for development
}

// Default user data for bypassing authentication (used for demo purposes)
const defaultUser: SupabaseUser = {
  id: '00000000-0000-0000-0000-000000000000', // Example user ID
  email: 'test@test.com', // Default email for the user
  role: 'authenticated', // User role
  aud: 'authenticated', // Audience for the authentication
  created_at: new Date().toISOString(), // Created date for the user
  app_metadata: {}, // Any app-specific metadata (empty for now)
  user_metadata: {}, // Any user-specific metadata (empty for now)
};

// Default profile data for bypassing authentication (used for demo purposes)
const defaultProfile: Profile = {
  role: 'Admin', // Default role for the demo
  fullName: 'Test User', // Default full name for the demo
  email: 'test@test.com', // Default email for the demo
  phone: '', // Default phone number (empty for now)
  location: '', // Default location (empty for now)
  company: '', // Default company name (empty for now)
  username: 'test', // Default username for the demo
};

// Create Zustand store for authentication state management
export const useAuthStore = create<AuthState>((set) => ({
  user: null, // Initial user state
  profile: null, // Initial profile state
  setUser: (user) => set({ user }), // Setter function for user
  setProfile: (profile) => set({ profile }), // Setter function for profile
  clearAuth: () => set({ user: null, profile: null }), // Function to clear user authentication
  bypassAuth: () => set({ user: defaultUser, profile: defaultProfile }), // Set default user for development
}));