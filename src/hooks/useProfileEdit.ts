import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { rpcClient } from "@/lib/rpc.client";
import { AllProfilesRow, UpdateProfileFullRpcArgs } from "@/lib/rpc.types";
import { useAuthStore } from "@/lib/store";

type ReturnType = {
  updateProfile: (updates: Partial<AllProfilesRow> & { id: string }) => Promise<void>;
  loading: boolean;
  error: Error | null;
  success: boolean;
};

const useProfileEdit = (): ReturnType => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null); // Changed from any to Error | null
  const [success, setSuccess] = useState(false);
  const { user, profile, setProfile } = useAuthStore();
  const updateProfile = async (
    updates: Partial<AllProfilesRow> & { id: string },
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!user) {
      setError(new Error("User not authenticated")); // Changed to new Error()
      setLoading(false);
      return;
    }

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setError(new Error("No active session found")); // Changed to new Error()
        setLoading(false);
        return;
      }

      const { id, ...profileData } = updates;

      const rpcArgs: UpdateProfileFullRpcArgs = {
        p_id: id,
        p_full_name: profileData.full_name,
        p_username: profileData.username,
        p_email: profileData.email,
        p_phone: profileData.phone,
        p_location: profileData.location,
        p_role: profileData.role,
        p_job_title_id: profileData.job_title_id,
        p_organization_id: profileData.organization_id,
        p_avatar_id: profileData.avatar_id,
        p_created_by: user.id,
        p_session_id: typeof profile?.session_id === 'string' && profile.session_id.trim() !== '' ? profile.session_id : '',
      };

      // Remove undefined properties
      Object.keys(rpcArgs).forEach((key) => {
        const K = key as keyof UpdateProfileFullRpcArgs;
        if (rpcArgs[K] === undefined) {
          delete rpcArgs[K];
        }
      });

      await rpcClient.updateProfileFull(rpcArgs);

      if (profile && profile.id === id) {
        const updatedProfileData = { ...profile };
        for (const key in profileData) {
          if (Object.prototype.hasOwnProperty.call(profileData, key)) {
            // Assuming profileData keys are valid for updatedProfileData
            (updatedProfileData as Record<string, unknown>)[key] = (profileData as Record<string, unknown>)[key];
          }
        }
        setProfile(updatedProfileData);
      }
      setSuccess(true);
    } catch (e: unknown) { // Changed from 'any' to 'unknown'
      console.error("Update profile hook error:", e);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("An unexpected error occurred"));
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error, success };
}

export { useProfileEdit };
