import type { ModeId } from './game/modes';
import { dayKey } from './game/random';

const STORAGE_KEY = 'krazymap:v3';
const LEGACY_KEY = 'krazymap:v2';
const DAILY_HISTORY = 60;

export interface DailyRecord {
  score: number;
  emojis: string;
}

export interface Profile {
  gamesPlayed: number;
  bestByMode: Partial<Record<ModeId, number>>;
  discovered: string[];
  achievements: string[];
  daily: Record<string, DailyRecord>;
  dailyCount: number;
}

export function emptyProfile(): Profile {
  return { gamesPlayed: 0, bestByMode: {}, discovered: [], achievements: [], daily: {}, dailyCount: 0 };
}

const toNumber = (value: unknown) => (Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0);
const toStrings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);

export function parseProfile(raw: unknown): Profile {
  const profile = emptyProfile();
  if (!raw || typeof raw !== 'object') return profile;
  const data = raw as Record<string, unknown>;
  profile.gamesPlayed = toNumber(data.gamesPlayed);
  if (data.bestByMode && typeof data.bestByMode === 'object') {
    for (const [mode, score] of Object.entries(data.bestByMode)) {
      profile.bestByMode[mode as ModeId] = toNumber(score);
    }
  }
  profile.discovered = toStrings(data.discovered);
  profile.achievements = toStrings(data.achievements);
  profile.dailyCount = toNumber(data.dailyCount);
  if (data.daily && typeof data.daily === 'object') {
    for (const [day, record] of Object.entries(data.daily as Record<string, Partial<DailyRecord>>)) {
      if (record && typeof record === 'object') {
        profile.daily[day] = { score: toNumber(record.score), emojis: String(record.emojis ?? '') };
      }
    }
  }
  return profile;
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseProfile(JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      // Ancienne version : un meilleur score unique, obtenu en mode classique.
      const parsed = JSON.parse(legacy) as { bestScore?: unknown; gamesPlayed?: unknown };
      return parseProfile({ gamesPlayed: parsed.gamesPlayed, bestByMode: { classique: parsed.bestScore } });
    }
  } catch {
    // Stockage indisponible (navigation privée, quota) : on repart à zéro.
  }
  return emptyProfile();
}

export function saveProfile(profile: Profile): void {
  const days = Object.keys(profile.daily).sort().slice(-DAILY_HISTORY);
  const trimmed = { ...profile, daily: Object.fromEntries(days.map((d) => [d, profile.daily[d]])) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Stockage indisponible : la progression reste affichée pour la session.
  }
}

/** Nombre de jours consécutifs, jusqu'à aujourd'hui (ou hier), où le défi a été joué. */
export function dailyStreak(profile: Profile, today: Date = new Date()): number {
  const cursor = new Date(today);
  if (!profile.daily[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (profile.daily[dayKey(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
