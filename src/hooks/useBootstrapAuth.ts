import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { validateUserRole } from "@/lib/utils/validate-user-role";
import { DemoSession, getDemoSession } from "@/lib/utils/cloneDemoData";
import type { EnrichedProfile } from "@/lib/store";

// 🔹 Async function version for calling in AuthForm.tsx
export async function bootstrapAuthSession(): Promise<void> {
  const { setUser, setProfile, clearAuth } = useAuthStore.getState();

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth
      .getSession();

    if (sessionError || !sessionData.session?.user) {
      clearAuth();
      return;
    }

    const user = sessionData.session.user;
    setUser(user);

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id, role, full_name, email, username, phone, location, avatar_id, organization_id, job_title_id, session_id,
        organizations:organization_id (id, name, address, phone, website),
        job_titles:job_title_id (id, title, is_custom),
        avatars:avatar_id (url)
      `)
      .eq("id", user.id)
      .single();

    if (error || !data) {
      clearAuth();
      return;
    }

    const demoSession: DemoSession | null = getDemoSession();
    const isDemo = demoSession?.userId === user.id;

    // Create an enriched profile with the proper type
    const enrichedProfile: EnrichedProfile = {
      id: data.id,
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      location: data.location,
      role: validateUserRole(data.role),
      job_title_id: data.job_title_id,
      organization_id: data.organization_id,
      avatar_id: data.avatar_id,
      avatar_url: data.avatars?.url ?? null,
      job_title: data.job_titles?.title ?? null,
      organization_name: data.organizations?.name ?? null,
      session_id: isDemo ? demoSession!.sessionId : (data.session_id ?? null),
    };

    setProfile(enrichedProfile);
  } catch (err) {
    console.error("[bootstrapAuthSession ERROR]", err);
    clearAuth();
  }
}

// 🔹 useBootstrapAuth hook for app-wide session checking
export function useBootstrapAuth(): boolean {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await bootstrapAuthSession();
      setIsLoading(false);
    })();
  }, [navigate]);

  return isLoading;
}
