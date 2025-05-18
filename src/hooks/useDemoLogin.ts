import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { validateUserRole } from "@/lib/utils/validate-user-role";
import type { EnrichedProfile } from "@/lib/store";

export function useDemoLogin() {
  const { setProfile } = useAuthStore();

  return async function loadProfile(
    userId: string,
    sessionId: string | null = null,
  ): Promise<EnrichedProfile | null> {
    const profileRes = await supabase
      .from("profiles")
      .select(
        `
        id, role, full_name, email, username, phone, location,
        avatar_id, organization_id, job_title_id, session_id,
        organizations (id, name, address, phone, website),
        job_titles (id, title, is_custom),
        avatars (url)
        `,
      )
      .eq("id", userId)
      .single();

    if (profileRes.error || !profileRes.data) {
      console.error("Failed to load profile:", profileRes.error);
      return null;
    }

    const pd = profileRes.data;

    const profile: EnrichedProfile = {
      id: pd.id,
      full_name: pd.full_name,
      username: pd.username,
      email: pd.email ?? "",
      phone: pd.phone,
      location: pd.location,
      role: validateUserRole(pd.role),
      job_title_id: pd.job_title_id,
      organization_id: pd.organization_id,
      avatar_id: pd.avatar_id,
      avatar_url: pd.avatars?.url ?? null,
      job_title: pd.job_titles?.title ?? null,
      organization_name: pd.organizations?.name ?? null,
      session_id: sessionId ?? pd.session_id ?? null, // prefer passed session ID
    };

    setProfile(profile);
    return profile;
  };
}
