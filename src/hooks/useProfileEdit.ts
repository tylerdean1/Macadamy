import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { rpcClient } from "@/lib/rpc.client";
import type { EnrichedProfile } from "@/lib/store";
import type { UpdateProfileRpcArgs } from "@/lib/rpc.types";
import { useAuthStore } from "@/lib/store";

type ReturnType = {
  updateProfile: (updates: Partial<EnrichedProfile> & { id: string }) => Promise<void>;
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
    updates: Partial<EnrichedProfile> & { id: string },
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!user) {
      setError(new Error("User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setError(new Error("No active session found"));
        setLoading(false);
        return;
      }

      const { id, ...profileData } = updates;
      // Map frontend fields to backend RPC args
      const rpcArgs: UpdateProfileRpcArgs = {
        _id: id,
        _full_name: profileData.full_name,
        _username: profileData.username ?? undefined,
        _email: profileData.email ?? undefined,
        _phone: profileData.phone ?? undefined,
        _location: profileData.location ?? undefined,
        _role: profileData.role ?? undefined,
        _job_title_id: profileData.job_title_id ?? undefined,
        _organization_id: profileData.organization_id ?? undefined,
        _avatar_id: profileData.avatar_id ?? undefined,
      };
      // Remove undefined properties
      Object.keys(rpcArgs).forEach((key) => {
        const K = key as keyof UpdateProfileRpcArgs;
        if (rpcArgs[K] === undefined) {
          delete rpcArgs[K];
        }
      });
      await rpcClient.updateProfileFull(rpcArgs);
      if (profile && profile.id === id) {
        const updatedProfileData = { ...profile };
        for (const key in profileData) {
          if (Object.prototype.hasOwnProperty.call(profileData, key)) {
            (updatedProfileData as Record<string, unknown>)[key] = (profileData as Record<string, unknown>)[key];
          }
        }
        setProfile(updatedProfileData);
      }
      setSuccess(true);
    } catch (e: unknown) {
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
