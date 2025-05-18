import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import type { Database } from "@/lib/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

export interface EnrichedProfileInput {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  role: UserRole;
  job_title_id?: string;
  custom_job_title?: string;
  organization_id?: string;
  custom_organization_name?: string;
  avatar_id?: string;
}

export function useSignup() {
  const { setUser, setProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  async function signup(
    email: string,
    password: string,
    profileInput: EnrichedProfileInput,
  ) {
    setIsLoading(true);
    setError(null);

    try {
      // 1) Supabase signup
      const { data: signUpData, error: signUpError } = await supabase.auth
        .signUp({
          email,
          password,
        });

      if (signUpError) {
        toast.error(signUpError.message || "Signup failed");
        throw signUpError;
      }

      if (!signUpData?.user) {
        toast.error("Signup succeeded but no user returned");
        throw new Error("Signup succeeded but no user returned");
      }

      setUser(signUpData.user);

      // 2) Insert profile via RPC with undefined for optional fields
      const { error: insertProfileError } = await supabase.rpc(
        "insert_profile_full",
        {
          _id: signUpData.user.id,
          _role: profileInput.role,
          _full_name: profileInput.full_name,
          _email: profileInput.email,
          _username: profileInput.username,
          _phone: profileInput.phone ?? undefined,
          _location: profileInput.location ?? undefined,
          _job_title_id: profileInput.job_title_id ?? undefined,
          _custom_job_title: profileInput.custom_job_title ?? undefined,
          _organization_id: profileInput.organization_id ?? undefined,
          _custom_organization_name: profileInput.custom_organization_name ??
            undefined,
          _avatar_id: profileInput.avatar_id ?? undefined,
        },
      );

      if (insertProfileError) {
        toast.error(insertProfileError.message || "Failed to create profile");
        throw insertProfileError;
      }

      // 3) Load enriched profile
      const { data: profileData, error: enrichedError } = await supabase.rpc(
        "get_enriched_profile",
        {
          _user_id: signUpData.user.id,
        },
      );

      if (enrichedError) {
        toast.error(enrichedError.message || "Failed to load profile data");
        throw enrichedError;
      }

      setProfile(profileData?.[0] ?? null);
      toast.success("Account created successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    signup,
    error,
    isLoading,
  };
}
