import { useState } from "react";
import { rpcClient } from "@/lib/rpc.client";
import type { EnrichedProfile } from "@/lib/store";
import type { Database } from "@/lib/database.types";
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

      const { id, ...profileData } = updates;
      // Map frontend fields to backend RPC args
      const isSystemAdmin = profile?.role === 'system_admin';
      const inputPayload: Record<string, unknown> = {
        full_name: profileData.full_name ?? undefined,
        email: profileData.email ?? undefined,
        phone: profileData.phone ?? undefined,
        avatar_id: profileData.avatar_id ?? undefined,
        job_title_id: profileData.job_title_id ?? undefined,
        ...(isSystemAdmin ? { role: profileData.role ?? undefined } : {}),
        ...(isSystemAdmin ? { organization_id: profileData.organization_id ?? undefined } : {}),
      };

      Object.keys(inputPayload).forEach((key) => {
        const K = key as keyof typeof inputPayload;
        if (inputPayload[K] === undefined) {
          delete inputPayload[K];
        }
      });

      await rpcClient.update_profiles({
        _id: id,
        _input: inputPayload as Database['public']['Functions']['update_profiles']['Args']['_input']
      });
      if (profile && profile.id === id) {
        const updatedProfileData = { ...profile };
        for (const key in profileData) {
          if (Object.prototype.hasOwnProperty.call(profileData, key)) {
            if (!isSystemAdmin && (key === 'role' || key === 'organization_id')) {
              continue;
            }
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
