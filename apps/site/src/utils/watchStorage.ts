'use client';

const WATCHED_KEY = 'animekun_watched';
const CURRENT_EP_KEY = 'animekun_current_ep';
const LANGUAGE_KEY = 'animekun_language';
const SERVER_HISTORY_KEY = 'animekun_server_history';
const SERVER_HISTORY_MAX = 10;

// ── Watched Episodes ──────────────────────────────────────────────────────────

export function getWatchedEpisodes(animeId: string): number[] {
  try {
    const raw = localStorage.getItem(WATCHED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    return parsed[animeId] ?? [];
  } catch {
    return [];
  }
}

export function markEpisodeWatched(animeId: string, episodeNumber: number): void {
  try {
    const raw = localStorage.getItem(WATCHED_KEY);
    const parsed: Record<string, number[]> = raw ? JSON.parse(raw) : {};
    const list = parsed[animeId] ?? [];
    if (!list.includes(episodeNumber)) {
      parsed[animeId] = [...list, episodeNumber];
      localStorage.setItem(WATCHED_KEY, JSON.stringify(parsed));
    }
  } catch { /* silent */ }
}

// ── Current Episode ───────────────────────────────────────────────────────────

export function getCurrentEpisode(animeId: string): number | null {
  try {
    const raw = localStorage.getItem(CURRENT_EP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed[animeId] ?? null;
  } catch {
    return null;
  }
}

export function setCurrentEpisode(animeId: string, episodeNumber: number): void {
  try {
    const raw = localStorage.getItem(CURRENT_EP_KEY);
    const parsed: Record<string, number> = raw ? JSON.parse(raw) : {};
    parsed[animeId] = episodeNumber;
    localStorage.setItem(CURRENT_EP_KEY, JSON.stringify(parsed));
  } catch { /* silent */ }
}

// ── Language ──────────────────────────────────────────────────────────────────

export function getLanguage(animeId: string): 'sub' | 'dub' {
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY);
    if (!raw) return 'sub';
    const parsed = JSON.parse(raw) as Record<string, 'sub' | 'dub'>;
    return parsed[animeId] ?? 'sub';
  } catch {
    return 'sub';
  }
}

export function setLanguage(animeId: string, lang: 'sub' | 'dub'): void {
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY);
    const parsed: Record<string, 'sub' | 'dub'> = raw ? JSON.parse(raw) : {};
    parsed[animeId] = lang;
    localStorage.setItem(LANGUAGE_KEY, JSON.stringify(parsed));
  } catch { /* silent */ }
}

// ── Server History (global) ───────────────────────────────────────────────────

export function getServerHistory(): string[] {
  try {
    const raw = localStorage.getItem(SERVER_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function addServerToHistory(serverId: string): void {
  try {
    const history = getServerHistory().filter((s) => s !== serverId);
    const updated = [serverId, ...history].slice(0, SERVER_HISTORY_MAX);
    localStorage.setItem(SERVER_HISTORY_KEY, JSON.stringify(updated));
  } catch { /* silent */ }
}

export function getPreferredServer(availableServerIds: string[]): string | null {
  const history = getServerHistory();
  for (const id of history) {
    if (availableServerIds.includes(id)) return id;
  }
  return null;
}