// ─── sessionStore.js ──────────────────────────────────────────────────────────
// Persists face-detection session reports to localStorage so the
// Track History page can read them across page reloads.

const KEY = 'zenith_sessions';

/** @returns {Array} all saved sessions, newest first */
export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

/** Save a completed session report object */
export function saveSession(report) {
  const sessions = getSessions();
  // attach a unique id and ISO timestamp for sorting
  const entry = { ...report, id: Date.now(), savedAt: new Date().toISOString() };
  sessions.unshift(entry);
  localStorage.setItem(KEY, JSON.stringify(sessions));
  return entry;
}

/** Delete one session by id */
export function deleteSession(id) {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

/** Clear all sessions */
export function clearAllSessions() {
  localStorage.removeItem(KEY);
}
