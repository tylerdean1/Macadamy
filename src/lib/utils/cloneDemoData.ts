/*───────────────────────────────────────────────────────────
  cloneDemoData.ts
  – one-stop helper for creating & caching demo sessions
───────────────────────────────────────────────────────────*/

import { supabase } from '@/lib/supabase'; // use the single shared client

/* ── env vars ───────────────────────────────────────────── */
const BASE_PROFILE = import.meta.env
  .VITE_BASE_PROFILE_ID as string; // “0000…0000” test user

/* ── local-storage / cache ──────────────────────────────── */
export interface DemoSession {
  sessionId : string; // uuid for the cloned profile
  userId    : string; // same as sessionId unless you hook up Supabase Auth
  createdAt : number; // epoch ms
}

const STORAGE_KEY = 'demo_session';
const TTL_MS      = 12 * 60 * 60 * 1_000; // 12h

/** Try to read an un-expired session from localStorage */
export function getDemoSession(): DemoSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const s: DemoSession = JSON.parse(raw);
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

function saveDemoSession(s: DemoSession) {
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

  // 2️⃣ invoke your master RPC
  const { data, error } = await supabase
    .rpc('execute_full_demo_clone', { session_id: BASE_PROFILE })
    .single<{ cloned_profile_id: string }>();

  if (error || !data?.cloned_profile_id) {
    throw new Error(
      `Failed to create demo environment: ${error?.message ?? 'no data'}`
    );
  }

  // 3️⃣ build & persist
  const session: DemoSession = {
    sessionId: data.cloned_profile_id,
    userId:    data.cloned_profile_id,
    createdAt: Date.now(),
  };
  saveDemoSession(session);
  return session;
}
