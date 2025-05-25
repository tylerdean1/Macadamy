/*───────────────────────────────────────────────────────────
  cloneDemoData.ts
  – one-stop helper for creating & caching demo sessions
───────────────────────────────────────────────────────────*/

import { rpcClient } from "@/lib/rpc.client"; // use the dedicated RPC client

/* ── env vars ───────────────────────────────────────────── */
// const BASE_PROFILE_ID = import.meta.env
//   .VITE_BASE_PROFILE_ID as string; // No longer used here
const BASE_PROFILE_EMAIL = import.meta.env.VITE_BASE_PROFILE_EMAIL as string;

/* ── local-storage / cache ──────────────────────────────── */
export interface DemoSession {
  sessionId: string; // uuid for the cloned profile
  userId: string; // same as sessionId unless you hook up Supabase Auth
  createdAt: number; // epoch ms
}

const STORAGE_KEY = "demo_session";
const TTL_MS = 12 * 60 * 60 * 1_000; // 12h

/** Try to read an un-expired session from localStorage */
export function getDemoSession(): DemoSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null || raw === undefined || raw === '') return null;

  try {
    // Use type assertion for JSON.parse
    const s = JSON.parse(raw) as DemoSession;
    if (Date.now() - s.createdAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveDemoSession(s: DemoSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/* ── main helper ────────────────────────────────────────── */
/**
 * Creates a fresh demo clone (or re-uses a <12 h old one in localStorage).
 * Calls your `execute_full_demo_clone` RPC (which in turn invokes all the
 * per-table `clone_*` functions).
 *
 * Returns the newly-cloned profile ID and its cache metadata.
 */
export async function cloneDemoData(): Promise<DemoSession> {
  // 1️⃣ maybe reuse
  const cached = getDemoSession();
  if (cached) return cached;

  if (!BASE_PROFILE_EMAIL) {
    console.error(
      "VITE_BASE_PROFILE_EMAIL environment variable is not set. This is required to create a demo environment.",
    );
    throw new Error(
      "Demo environment configuration error: VITE_BASE_PROFILE_EMAIL is not set.",
    );
  }
  // 2️⃣ Call create_demo_environment to initialize profile and session
  const creationInfo = await rpcClient.createDemoEnvironment({
    base_profile_email: BASE_PROFILE_EMAIL
  });

  if (!creationInfo?.created_session_id || !creationInfo?.created_profile_id) {
    console.error(
      "Failed to create demo environment (profile creation step)",
    );
    throw new Error(
      `Failed to create demo environment (profile creation step): No data returned from create_demo_environment RPC. Ensure it returns created_session_id and created_profile_id.`,
    );
  }

  const { created_session_id, created_profile_id } = creationInfo;

  // 3️⃣ Call execute_full_demo_clone to populate all other demo data
  await rpcClient.executeFullDemoClone({ session_id: created_session_id }); // Pass the newly created session_id

  // 4️⃣ Build & persist DemoSession
  const session: DemoSession = {
    sessionId: created_session_id, // This is the session ID for all cloned data
    userId: created_profile_id, // This is the ID of the newly cloned user profile
    createdAt: Date.now(),
  };
  saveDemoSession(session);
  return session;
}
