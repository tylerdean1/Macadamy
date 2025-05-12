export interface DemoSession {
  sessionId: string;
  userId: string;
  email: string;
  password: string;
  createdAt: number;
}

const STORAGE_KEY = 'demo_session';

export function getDemoSession(): DemoSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data: DemoSession = JSON.parse(raw);
    // expire after 12h
    if (Date.now() - data.createdAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveDemoSession(session: DemoSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}